from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError


class LikeRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.likes

    async def get_like(self, post_id: ObjectId, user_id: ObjectId) -> dict[str, Any] | None:
        return await self.collection.find_one({"post_id": post_id, "user_id": user_id})

    async def create_like(self, post_id: ObjectId, user_id: ObjectId) -> bool:
        """
        Creates a like. Returns True if created, False if already exists.
        """
        existing = await self.get_like(post_id, user_id)
        if existing:
            return False

        try:
            await self.collection.insert_one(
                {
                    "post_id": post_id,
                    "user_id": user_id,
                    "created_at": datetime.now(timezone.utc),
                }
            )
            return True
        except DuplicateKeyError:
            return False

    async def delete_like(self, post_id: ObjectId, user_id: ObjectId) -> bool:
        result = await self.collection.delete_one({"post_id": post_id, "user_id": user_id})
        return result.deleted_count > 0

    async def delete_by_post_id(self, post_id: ObjectId) -> int:
        result = await self.collection.delete_many({"post_id": post_id})
        return result.deleted_count

    async def get_user_liked_post_ids(self, user_id: ObjectId, post_ids: list[ObjectId]) -> set[ObjectId]:
        if not post_ids:
            return set()
        cursor = self.collection.find(
            {"user_id": user_id, "post_id": {"$in": post_ids}},
            {"post_id": 1},
        )
        likes = await cursor.to_list(length=len(post_ids))
        return {like["post_id"] for like in likes}
