from bson import ObjectId

from app.repositories.like_repository import LikeRepository
from app.repositories.post_repository import PostRepository
from app.schemas.like import LikeResponse
from app.utils.exceptions import NotFoundException


class LikeService:
    def __init__(self, like_repo: LikeRepository, post_repo: PostRepository):
        self.like_repo = like_repo
        self.post_repo = post_repo

    async def like_post(self, post_id: ObjectId, user_id: ObjectId) -> LikeResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Post", str(post_id))

        created = await self.like_repo.create_like(post_id=post_id, user_id=user_id)
        if created:
            await self.post_repo.increment_counts(post_id, likes_delta=1)
            updated_post = await self.post_repo.get_by_id(post_id)
            likes_count = updated_post.get("likes_count", post.get("likes_count", 0) + 1)
        else:
            likes_count = post.get("likes_count", 0)

        return LikeResponse(
            post_id=post_id,
            likes_count=likes_count,
            is_liked=True,
            message="Post liked successfully",
        )

    async def unlike_post(self, post_id: ObjectId, user_id: ObjectId) -> LikeResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Post", str(post_id))

        deleted = await self.like_repo.delete_like(post_id=post_id, user_id=user_id)
        if deleted:
            await self.post_repo.increment_counts(post_id, likes_delta=-1)
            updated_post = await self.post_repo.get_by_id(post_id)
            likes_count = max(0, updated_post.get("likes_count", post.get("likes_count", 1) - 1))
        else:
            likes_count = post.get("likes_count", 0)

        return LikeResponse(
            post_id=post_id,
            likes_count=likes_count,
            is_liked=False,
            message="Post unliked successfully",
        )
