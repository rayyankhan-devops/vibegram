import re
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.users

    async def get_by_id(self, user_id: ObjectId) -> dict[str, Any] | None:
        return await self.collection.find_one({"_id": user_id})

    async def get_by_username(self, username: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"username": username.lower().strip()})

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"email": email.lower().strip()})

    async def get_by_username_or_email(self, identifier: str) -> dict[str, Any] | None:
        clean_id = identifier.lower().strip()
        return await self.collection.find_one(
            {
                "$or": [
                    {"username": clean_id},
                    {"email": clean_id},
                ]
            }
        )

    async def create(self, user_data: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        user_data["created_at"] = now
        user_data["updated_at"] = now
        user_data.setdefault("followers_count", 0)
        user_data.setdefault("following_count", 0)
        user_data.setdefault("posts_count", 0)
        user_data.setdefault("bio", "")
        user_data.setdefault("avatar_url", "")

        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data

    async def update(self, user_id: ObjectId, update_data: dict[str, Any]) -> dict[str, Any] | None:
        update_data["updated_at"] = datetime.now(timezone.utc)
        return await self.collection.find_one_and_update(
            {"_id": user_id},
            {"$set": update_data},
            return_document=True,
        )

    update_user = update

    async def search(self, query: str, limit: int = 20) -> list[dict[str, Any]]:
        clean_query = query.strip()
        if not clean_query:
            return []

        # Escape special regex characters for safe matching
        escaped_query = re.escape(clean_query)
        regex_pattern = f"^{escaped_query}"

        cursor = self.collection.find(
            {
                "$or": [
                    {"username": {"$regex": regex_pattern, "$options": "i"}},
                    {"display_name": {"$regex": escaped_query, "$options": "i"}},
                ]
            }
        ).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_many_by_ids(self, user_ids: list[ObjectId]) -> dict[ObjectId, dict[str, Any]]:
        if not user_ids:
            return {}
        cursor = self.collection.find({"_id": {"$in": user_ids}})
        users = await cursor.to_list(length=len(user_ids))
        return {u["_id"]: u for u in users}

    async def get_by_ids(self, user_ids: list[ObjectId]) -> list[dict[str, Any]]:
        if not user_ids:
            return []
        cursor = self.collection.find({"_id": {"$in": user_ids}})
        return await cursor.to_list(length=len(user_ids))

    async def increment_counts(
        self,
        user_id: ObjectId,
        followers_delta: int = 0,
        following_delta: int = 0,
        posts_delta: int = 0,
    ) -> None:
        inc_dict = {}
        if followers_delta != 0:
            inc_dict["followers_count"] = followers_delta
        if following_delta != 0:
            inc_dict["following_count"] = following_delta
        if posts_delta != 0:
            inc_dict["posts_count"] = posts_delta

        if inc_dict:
            await self.collection.update_one({"_id": user_id}, {"$inc": inc_dict})
