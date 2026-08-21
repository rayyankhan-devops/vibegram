from bson import ObjectId

from app.repositories.comment_repository import CommentRepository
from app.repositories.post_repository import PostRepository
from app.repositories.user_repository import UserRepository
from app.schemas.comment import (
    CommentAuthorSummary,
    CommentCreateRequest,
    CommentListResponse,
    CommentResponse,
)
from app.utils.exceptions import ForbiddenException, NotFoundException


class CommentService:
    def __init__(
        self,
        comment_repo: CommentRepository,
        post_repo: PostRepository,
        user_repo: UserRepository,
    ):
        self.comment_repo = comment_repo
        self.post_repo = post_repo
        self.user_repo = user_repo

    async def create_comment(
        self, post_id: ObjectId, author_id: ObjectId, req: CommentCreateRequest
    ) -> CommentResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Post", str(post_id))

        author = await self.user_repo.get_by_id(author_id)
        if not author:
            raise NotFoundException("User")

        comment_doc = {
            "post_id": post_id,
            "author_id": author_id,
            "content": req.content.strip(),
        }
        created = await self.comment_repo.create(comment_doc)
        await self.post_repo.increment_counts(post_id, comments_delta=1)

        author_summary = CommentAuthorSummary(
            _id=author["_id"],
            username=author["username"],
            display_name=author.get("display_name", ""),
            avatar_url=author.get("avatar_url", ""),
        )

        return CommentResponse(
            _id=created["_id"],
            post_id=created["post_id"],
            author_id=created["author_id"],
            author=author_summary,
            content=created["content"],
            created_at=created["created_at"],
            is_owner=True,
        )

    async def get_comments(
        self,
        post_id: ObjectId,
        current_user_id: ObjectId | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> CommentListResponse:
        post = await self.post_repo.get_by_id(post_id)
        if not post:
            raise NotFoundException("Post", str(post_id))

        comments = await self.comment_repo.get_by_post(post_id, skip=skip, limit=limit)
        total = await self.comment_repo.count_by_post(post_id)

        if not comments:
            return CommentListResponse(comments=[], total=0)

        author_ids = list({c["author_id"] for c in comments})
        authors_map = await self.user_repo.get_many_by_ids(author_ids)

        post_author_id = post["author_id"]

        results: list[CommentResponse] = []
        for c in comments:
            author_doc = authors_map.get(c["author_id"])
            author_summary = None
            if author_doc:
                author_summary = CommentAuthorSummary(
                    _id=author_doc["_id"],
                    username=author_doc["username"],
                    display_name=author_doc.get("display_name", ""),
                    avatar_url=author_doc.get("avatar_url", ""),
                )

            # Owner is the comment author or the post author
            is_owner = False
            if current_user_id:
                is_owner = (c["author_id"] == current_user_id) or (post_author_id == current_user_id)

            results.append(
                CommentResponse(
                    _id=c["_id"],
                    post_id=c["post_id"],
                    author_id=c["author_id"],
                    author=author_summary,
                    content=c["content"],
                    created_at=c["created_at"],
                    is_owner=is_owner,
                )
            )

        return CommentListResponse(comments=results, total=total)

    async def delete_comment(self, comment_id: ObjectId, current_user_id: ObjectId) -> bool:
        comment = await self.comment_repo.get_by_id(comment_id)
        if not comment:
            raise NotFoundException("Comment", str(comment_id))

        post = await self.post_repo.get_by_id(comment["post_id"])
        is_comment_author = comment["author_id"] == current_user_id
        is_post_author = post is not None and post["author_id"] == current_user_id

        if not (is_comment_author or is_post_author):
            raise ForbiddenException("You do not have permission to delete this comment")

        deleted = await self.comment_repo.delete(comment_id)
        if deleted:
            await self.post_repo.increment_counts(comment["post_id"], comments_delta=-1)
        return deleted
