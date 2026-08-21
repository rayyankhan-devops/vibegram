from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.bookmark_repository import BookmarkRepository
from app.repositories.post_repository import PostRepository
from app.schemas.bookmark import BookmarkResponse
from app.utils.exceptions import NotFoundException


class BookmarkService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.bookmark_repo = BookmarkRepository(db)
        self.post_repo = PostRepository(db)

    async def bookmark_post(self, user_id: ObjectId, post_id: ObjectId) -> BookmarkResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Post", str(post_id))

        created = await self.bookmark_repo.create_bookmark(user_id, post_id)
        return BookmarkResponse(
            post_id=post_id,
            is_bookmarked=True,
            message="Post saved to bookmarks" if created else "Post already bookmarked",
        )

    async def unbookmark_post(self, user_id: ObjectId, post_id: ObjectId) -> BookmarkResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Post", str(post_id))

        deleted = await self.bookmark_repo.delete_bookmark(user_id, post_id)
        return BookmarkResponse(
            post_id=post_id,
            is_bookmarked=False,
            message="Post removed from bookmarks" if deleted else "Post was not bookmarked",
        )
