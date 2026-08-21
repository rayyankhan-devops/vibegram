from bson import ObjectId
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.repositories.like_repository import LikeRepository
from app.repositories.post_repository import PostRepository
from app.schemas.like import LikeResponse
from app.security.dependencies import get_current_user_id
from app.services.like_service import LikeService
from app.utils.exceptions import BadRequestException

router = APIRouter(tags=["Likes"])


def get_like_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> LikeService:
    return LikeService(
        like_repo=LikeRepository(db),
        post_repo=PostRepository(db),
    )


@router.post(
    "/posts/{post_id}/like",
    response_model=LikeResponse,
    summary="Like a post",
)
async def like_post(
    post_id: str,
    current_user_id: ObjectId = Depends(get_current_user_id),
    like_service: LikeService = Depends(get_like_service),
) -> LikeResponse:
    if not ObjectId.is_valid(post_id):
        raise BadRequestException(f"Invalid post ID format: {post_id}")
    return await like_service.like_post(ObjectId(post_id), current_user_id)


@router.delete(
    "/posts/{post_id}/like",
    response_model=LikeResponse,
    summary="Unlike a post",
)
async def unlike_post(
    post_id: str,
    current_user_id: ObjectId = Depends(get_current_user_id),
    like_service: LikeService = Depends(get_like_service),
) -> LikeResponse:
    if not ObjectId.is_valid(post_id):
        raise BadRequestException(f"Invalid post ID format: {post_id}")
    return await like_service.unlike_post(ObjectId(post_id), current_user_id)
