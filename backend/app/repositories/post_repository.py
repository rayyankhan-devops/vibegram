from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class PostRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.posts

    async def get_by_id(self, post_id: ObjectId) -> dict[str, Any] | None:
        return await self.collection.find_one({"_id": post_id})

    async def create(self, post_data: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        post_data["created_at"] = now
        post_data["updated_at"] = now
        post_data.setdefault("likes_count", 0)
        post_data.setdefault("comments_count", 0)

        result = await self.collection.insert_one(post_data)
        post_data["_id"] = result.inserted_id
        return post_data

    async def create_post(self, author_id: ObjectId, image_url: str, caption: str = "") -> dict[str, Any]:
        return await self.create(
            {
                "author_id": author_id,
                "image_url": image_url,
                "caption": caption,
            }
        )

    async def delete(self, post_id: ObjectId) -> bool:
        result = await self.collection.delete_one({"_id": post_id})
        return result.deleted_count > 0

    delete_post = delete

    async def get_by_author(self, author_id: ObjectId, skip: int = 0, limit: int = 20) -> list[dict[str, Any]]:
        cursor = self.collection.find({"author_id": author_id}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def count_by_author(self, author_id: ObjectId) -> int:
        return await self.collection.count_documents({"author_id": author_id})

    async def get_feed(self, author_ids: list[ObjectId], skip: int = 0, limit: int = 20) -> list[dict[str, Any]]:
        if not author_ids:
            return []
        cursor = self.collection.find({"author_id": {"$in": author_ids}}).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def count_feed(self, author_ids: list[ObjectId]) -> int:
        if not author_ids:
            return 0
        return await self.collection.count_documents({"author_id": {"$in": author_ids}})

    async def get_explore(
        self,
        exclude_author_id: ObjectId | None = None,
        exclude_author_ids: list[ObjectId] | None = None,
        skip: int = 0,
        limit: int = 30,
    ) -> list[dict[str, Any]]:
        query: dict[str, Any] = {}
        if exclude_author_id:
            query["author_id"] = {"$ne": exclude_author_id}
        elif exclude_author_ids:
            query["author_id"] = {"$nin": exclude_author_ids}

        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    async def count_explore(
        self,
        exclude_author_id: ObjectId | None = None,
        exclude_author_ids: list[ObjectId] | None = None,
    ) -> int:
        query: dict[str, Any] = {}
        if exclude_author_id:
            query["author_id"] = {"$ne": exclude_author_id}
        elif exclude_author_ids:
            query["author_id"] = {"$nin": exclude_author_ids}
        return await self.collection.count_documents(query)

    async def increment_counts(
        self,
        post_id: ObjectId,
        likes_delta: int = 0,
        comments_delta: int = 0,
    ) -> None:
        inc_dict = {}
        if likes_delta != 0:
            inc_dict["likes_count"] = likes_delta
        if comments_delta != 0:
            inc_dict["comments_count"] = comments_delta

        if inc_dict:
            await self.collection.update_one({"_id": post_id}, {"$inc": inc_dict})
