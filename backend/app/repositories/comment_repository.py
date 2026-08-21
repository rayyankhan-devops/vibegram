from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class CommentRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.comments

    async def get_by_id(self, comment_id: ObjectId) -> dict[str, Any] | None:
        return await self.collection.find_one({"_id": comment_id})

    async def create(self, comment_data: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        comment_data["created_at"] = now
        comment_data["updated_at"] = now

        result = await self.collection.insert_one(comment_data)
        comment_data["_id"] = result.inserted_id
        return comment_data

    async def delete(self, comment_id: ObjectId) -> bool:
        result = await self.collection.delete_one({"_id": comment_id})
        return result.deleted_count > 0

    async def delete_by_post_id(self, post_id: ObjectId) -> int:
        result = await self.collection.delete_many({"post_id": post_id})
        return result.deleted_count

    async def get_by_post(self, post_id: ObjectId, skip: int = 0, limit: int = 50) -> list[dict[str, Any]]:
        cursor = self.collection.find({"post_id": post_id}).sort("created_at", 1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def count_by_post(self, post_id: ObjectId) -> int:
        return await self.collection.count_documents({"post_id": post_id})
