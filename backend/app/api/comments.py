from bson import ObjectId
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.repositories.comment_repository import CommentRepository
from app.repositories.post_repository import PostRepository
from app.repositories.user_repository import UserRepository
from app.schemas.comment import CommentCreateRequest, CommentListResponse, CommentResponse
from app.schemas.common import SuccessMessageResponse
from app.security.dependencies import get_current_user_id, get_current_user_id_optional
from app.services.comment_service import CommentService
from app.utils.exceptions import BadRequestException

router = APIRouter(tags=["Comments"])


def get_comment_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> CommentService:
    return CommentService(
        comment_repo=CommentRepository(db),
        post_repo=PostRepository(db),
        user_repo=UserRepository(db),
    )


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a comment to a post",
)
async def create_comment(
    post_id: str,
    req: CommentCreateRequest,
    current_user_id: ObjectId = Depends(get_current_user_id),
    comment_service: CommentService = Depends(get_comment_service),
) -> CommentResponse:
    if not ObjectId.is_valid(post_id):
        raise BadRequestException(f"Invalid post ID format: {post_id}")
    return await comment_service.create_comment(ObjectId(post_id), current_user_id, req)


@router.get(
    "/posts/{post_id}/comments",
    response_model=CommentListResponse,
    summary="Get comments for a post",
)
async def get_comments(
    post_id: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    comment_service: CommentService = Depends(get_comment_service),
) -> CommentListResponse:
    if not ObjectId.is_valid(post_id):
        raise BadRequestException(f"Invalid post ID format: {post_id}")
    return await comment_service.get_comments(ObjectId(post_id), current_user_id, skip=skip, limit=limit)


@router.delete(
    "/comments/{comment_id}",
    response_model=SuccessMessageResponse,
    summary="Delete a comment (by comment author or post author)",
)
async def delete_comment(
    comment_id: str,
    current_user_id: ObjectId = Depends(get_current_user_id),
    comment_service: CommentService = Depends(get_comment_service),
) -> SuccessMessageResponse:
    if not ObjectId.is_valid(comment_id):
        raise BadRequestException(f"Invalid comment ID format: {comment_id}")
    await comment_service.delete_comment(ObjectId(comment_id), current_user_id)
    return SuccessMessageResponse(message="Comment deleted successfully")
