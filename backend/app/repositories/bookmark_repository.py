from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError


class BookmarkRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.bookmarks

    async def get_bookmark(self, user_id: ObjectId, post_id: ObjectId) -> dict[str, Any] | None:
        return await self.collection.find_one({"user_id": user_id, "post_id": post_id})

    async def create_bookmark(self, user_id: ObjectId, post_id: ObjectId) -> bool:
        """
        Creates a bookmark. Returns True if created, False if already exists.
        """
        existing = await self.get_bookmark(user_id, post_id)
        if existing:
            return False

        try:
            await self.collection.insert_one(
                {
                    "user_id": user_id,
                    "post_id": post_id,
                    "created_at": datetime.now(timezone.utc),
                }
            )
            return True
        except DuplicateKeyError:
            return False

    async def delete_bookmark(self, user_id: ObjectId, post_id: ObjectId) -> bool:
        result = await self.collection.delete_one({"user_id": user_id, "post_id": post_id})
        return result.deleted_count > 0

    async def get_user_bookmarked_post_ids(self, user_id: ObjectId, post_ids: list[ObjectId]) -> set[ObjectId]:
        if not post_ids:
            return set()
        cursor = self.collection.find(
            {"user_id": user_id, "post_id": {"$in": post_ids}},
            {"post_id": 1},
        )
        bookmarks = await cursor.to_list(length=len(post_ids))
        return {b["post_id"] for b in bookmarks}

    async def get_user_saved_post_ids(self, user_id: ObjectId, skip: int = 0, limit: int = 30) -> list[ObjectId]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(limit)
        bookmarks = await cursor.to_list(length=limit)
        return [b["post_id"] for b in bookmarks]

    async def count_user_saved_posts(self, user_id: ObjectId) -> int:
        return await self.collection.count_documents({"user_id": user_id})
