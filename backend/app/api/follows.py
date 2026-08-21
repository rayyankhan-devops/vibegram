from bson import ObjectId
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.repositories.follow_repository import FollowRepository
from app.repositories.user_repository import UserRepository
from app.schemas.follow import FollowListResponse, FollowResponse
from app.security.dependencies import get_current_user_id, get_current_user_id_optional
from app.services.follow_service import FollowService
from app.utils.exceptions import BadRequestException

router = APIRouter(prefix="/users", tags=["Follows & Relationships"])


def get_follow_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> FollowService:
    return FollowService(
        follow_repo=FollowRepository(db),
        user_repo=UserRepository(db),
    )


@router.post(
    "/{user_id}/follow",
    response_model=FollowResponse,
    summary="Follow a user",
)
async def follow_user(
    user_id: str,
    current_user_id: ObjectId = Depends(get_current_user_id),
    follow_service: FollowService = Depends(get_follow_service),
) -> FollowResponse:
    if not ObjectId.is_valid(user_id):
        raise BadRequestException(f"Invalid user ID format: {user_id}")
    return await follow_service.follow_user(current_user_id, ObjectId(user_id))


@router.delete(
    "/{user_id}/follow",
    response_model=FollowResponse,
    summary="Unfollow a user",
)
async def unfollow_user(
    user_id: str,
    current_user_id: ObjectId = Depends(get_current_user_id),
    follow_service: FollowService = Depends(get_follow_service),
) -> FollowResponse:
    if not ObjectId.is_valid(user_id):
        raise BadRequestException(f"Invalid user ID format: {user_id}")
    return await follow_service.unfollow_user(current_user_id, ObjectId(user_id))


@router.get(
    "/{user_id}/followers",
    response_model=FollowListResponse,
    summary="Get list of followers for a user",
)
async def get_followers(
    user_id: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    follow_service: FollowService = Depends(get_follow_service),
) -> FollowListResponse:
    if not ObjectId.is_valid(user_id):
        raise BadRequestException(f"Invalid user ID format: {user_id}")
    return await follow_service.get_followers(ObjectId(user_id), current_user_id, skip=skip, limit=limit)


@router.get(
    "/{user_id}/following",
    response_model=FollowListResponse,
    summary="Get list of users followed by a user",
)
async def get_following(
    user_id: str,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    follow_service: FollowService = Depends(get_follow_service),
) -> FollowListResponse:
    if not ObjectId.is_valid(user_id):
        raise BadRequestException(f"Invalid user ID format: {user_id}")
    return await follow_service.get_following(ObjectId(user_id), current_user_id, skip=skip, limit=limit)
