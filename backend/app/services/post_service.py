from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.bookmark_repository import BookmarkRepository
from app.repositories.comment_repository import CommentRepository
from app.repositories.follow_repository import FollowRepository
from app.repositories.like_repository import LikeRepository
from app.repositories.post_repository import PostRepository
from app.repositories.user_repository import UserRepository
from app.schemas.post import PostCreateRequest, PostListResponse, PostResponse
from app.schemas.user import UserCompactResponse
from app.utils.exceptions import ForbiddenException, NotFoundException


class PostService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.post_repo = PostRepository(db)
        self.user_repo = UserRepository(db)
        self.like_repo = LikeRepository(db)
        self.comment_repo = CommentRepository(db)
        self.follow_repo = FollowRepository(db)
        self.bookmark_repo = BookmarkRepository(db)

    async def _hydrate_posts(self, posts: list[dict], current_user_id: ObjectId | None = None) -> list[PostResponse]:
        if not posts:
            return []

        author_ids = list({p["author_id"] for p in posts if "author_id" in p})
        users = await self.user_repo.get_by_ids(author_ids)
        user_map = {
            u["_id"]: UserCompactResponse(
                _id=u["_id"],
                username=u["username"],
                display_name=u["display_name"],
                avatar_url=u.get("avatar_url", ""),
            )
            for u in users
        }

        liked_post_ids: set[ObjectId] = set()
        bookmarked_post_ids: set[ObjectId] = set()
        if current_user_id:
            post_ids = [p["_id"] for p in posts]
            liked_post_ids = await self.like_repo.get_user_liked_post_ids(current_user_id, post_ids)
            bookmarked_post_ids = await self.bookmark_repo.get_user_bookmarked_post_ids(current_user_id, post_ids)

        hydrated = []
        for p in posts:
            author = user_map.get(p["author_id"])
            is_liked = p["_id"] in liked_post_ids
            is_bookmarked = p["_id"] in bookmarked_post_ids
            hydrated.append(
                PostResponse(
                    _id=p["_id"],
                    author_id=p["author_id"],
                    author=author,
                    image_url=p["image_url"],
                    caption=p.get("caption", ""),
                    likes_count=p.get("likes_count", 0),
                    comments_count=p.get("comments_count", 0),
                    is_liked=is_liked,
                    is_bookmarked=is_bookmarked,
                    created_at=p["created_at"],
                    updated_at=p.get("updated_at"),
                )
            )
        return hydrated

    async def create_post(self, author_id: ObjectId, req: PostCreateRequest) -> PostResponse:
        author = await self.user_repo.get_by_id(author_id)
        if not author:
            raise NotFoundException("User", str(author_id))

        post_dict = await self.post_repo.create_post(
            author_id=author_id,
            image_url=req.image_url,
            caption=req.caption,
        )
        await self.user_repo.increment_counts(author_id, posts_delta=1)

        compact_author = UserCompactResponse(
            _id=author["_id"],
            username=author["username"],
            display_name=author["display_name"],
            avatar_url=author.get("avatar_url", ""),
        )

        return PostResponse(
            _id=post_dict["_id"],
            author_id=author_id,
            author=compact_author,
            image_url=post_dict["image_url"],
            caption=post_dict["caption"],
            likes_count=0,
            comments_count=0,
            is_liked=False,
            is_bookmarked=False,
            created_at=post_dict["created_at"],
        )

    async def get_post(self, post_id: ObjectId, current_user_id: ObjectId | None = None) -> PostResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Post", str(post_id))

        hydrated = await self._hydrate_posts([post], current_user_id=current_user_id)
        return hydrated[0]

    async def delete_post(self, post_id: ObjectId, current_user_id: ObjectId) -> bool:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Post", str(post_id))

        if post["author_id"] != current_user_id:
            raise ForbiddenException("You can only delete your own posts")

        deleted = await self.post_repo.delete_post(post_id)
        if deleted:
            await self.user_repo.increment_counts(current_user_id, posts_delta=-1)
            await self.like_repo.delete_by_post_id(post_id)
            await self.comment_repo.delete_by_post_id(post_id)
            await self.bookmark_repo.delete_bookmark(current_user_id, post_id)
        return deleted

    async def get_feed(self, current_user_id: ObjectId, page: int = 1, limit: int = 20) -> PostListResponse:
        skip = (page - 1) * limit
        following_ids = await self.follow_repo.get_following_ids(current_user_id)
        feed_author_ids = list(set(following_ids + [current_user_id]))

        raw_posts = await self.post_repo.get_feed(feed_author_ids, skip=skip, limit=limit)
        total = await self.post_repo.count_feed(feed_author_ids)
        hydrated = await self._hydrate_posts(raw_posts, current_user_id=current_user_id)

        has_more = (skip + len(hydrated)) < total

        return PostListResponse(
            items=hydrated,
            posts=hydrated,
            total=total,
            page=page,
            limit=limit,
            has_more=has_more,
        )

    async def get_explore(
        self,
        current_user_id: ObjectId | None = None,
        page: int = 1,
        limit: int = 30,
        exclude_user_id: ObjectId | None = None,
    ) -> PostListResponse:
        skip = (page - 1) * limit
        raw_posts = await self.post_repo.get_explore(skip=skip, limit=limit, exclude_author_id=exclude_user_id)
        total = await self.post_repo.count_explore(exclude_author_id=exclude_user_id)
        hydrated = await self._hydrate_posts(raw_posts, current_user_id=current_user_id)

        has_more = (skip + len(hydrated)) < total

        return PostListResponse(
            items=hydrated,
            posts=hydrated,
            total=total,
            page=page,
            limit=limit,
            has_more=has_more,
        )

    async def get_user_posts(
        self,
        username: str,
        current_user_id: ObjectId | None = None,
        page: int = 1,
        limit: int = 30,
    ) -> PostListResponse:
        user = await self.user_repo.get_by_username(username)
        if not user:
            raise NotFoundException("User", username)

        skip = (page - 1) * limit
        raw_posts = await self.post_repo.get_by_author(user["_id"], skip=skip, limit=limit)
        total = await self.post_repo.count_by_author(user["_id"])
        hydrated = await self._hydrate_posts(raw_posts, current_user_id=current_user_id)

        has_more = (skip + len(hydrated)) < total

        return PostListResponse(
            items=hydrated,
            posts=hydrated,
            total=total,
            page=page,
            limit=limit,
            has_more=has_more,
        )

    async def get_saved_posts(
        self,
        current_user_id: ObjectId,
        page: int = 1,
        limit: int = 30,
    ) -> PostListResponse:
        skip = (page - 1) * limit
        post_ids = await self.bookmark_repo.get_user_saved_post_ids(current_user_id, skip=skip, limit=limit)
        total = await self.bookmark_repo.count_user_saved_posts(current_user_id)

        if not post_ids:
            return PostListResponse(
                items=[],
                posts=[],
                total=total,
                page=page,
                limit=limit,
                has_more=False,
            )

        posts_dict = {}
        for pid in post_ids:
            p = await self.post_repo.get_by_id(pid)
            if p:
                posts_dict[pid] = p

        ordered_posts = [posts_dict[pid] for pid in post_ids if pid in posts_dict]
        hydrated = await self._hydrate_posts(ordered_posts, current_user_id=current_user_id)

        has_more = (skip + len(hydrated)) < total

        return PostListResponse(
            items=hydrated,
            posts=hydrated,
            total=total,
            page=page,
            limit=limit,
            has_more=has_more,
        )
