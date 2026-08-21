from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError


class FollowRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.follows

    async def get_follow(self, follower_id: ObjectId, following_id: ObjectId) -> dict[str, Any] | None:
        return await self.collection.find_one(
            {
                "follower_id": follower_id,
                "following_id": following_id,
            }
        )

    async def create_follow(self, follower_id: ObjectId, following_id: ObjectId) -> bool:
        """
        Creates a follow relationship. Returns True if created, False if already exists.
        """
        existing = await self.get_follow(follower_id, following_id)
        if existing:
            return False

        try:
            await self.collection.insert_one(
                {
                    "follower_id": follower_id,
                    "following_id": following_id,
                    "created_at": datetime.now(timezone.utc),
                }
            )
            return True
        except DuplicateKeyError:
            return False

    async def delete_follow(self, follower_id: ObjectId, following_id: ObjectId) -> bool:
        result = await self.collection.delete_one(
            {
                "follower_id": follower_id,
                "following_id": following_id,
            }
        )
        return result.deleted_count > 0

    async def get_following_ids(self, follower_id: ObjectId) -> list[ObjectId]:
        cursor = self.collection.find({"follower_id": follower_id}, {"following_id": 1})
        docs = await cursor.to_list(length=None)
        return [doc["following_id"] for doc in docs]

    async def get_follower_ids(self, following_id: ObjectId) -> list[ObjectId]:
        cursor = self.collection.find({"following_id": following_id}, {"follower_id": 1})
        docs = await cursor.to_list(length=None)
        return [doc["follower_id"] for doc in docs]

    async def get_followers(self, user_id: ObjectId, skip: int = 0, limit: int = 50) -> list[dict[str, Any]]:
        cursor = self.collection.find({"following_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_following(self, user_id: ObjectId, skip: int = 0, limit: int = 50) -> list[dict[str, Any]]:
        cursor = self.collection.find({"follower_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_following_set_for_user(self, follower_id: ObjectId, target_ids: list[ObjectId]) -> set[ObjectId]:
        if not target_ids:
            return set()
        cursor = self.collection.find(
            {"follower_id": follower_id, "following_id": {"$in": target_ids}},
            {"following_id": 1},
        )
        follows = await cursor.to_list(length=len(target_ids))
        return {f["following_id"] for f in follows}
