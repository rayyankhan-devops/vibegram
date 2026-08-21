from bson import ObjectId
from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.user import (
    UserProfileResponse,
    UserResponse,
    UserSearchItem,
    UserUpdateRequest,
)
from app.security.dependencies import get_current_user_id, get_current_user_id_optional
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/suggestions", response_model=list[UserSearchItem])
async def get_suggested_users(
    limit: int = Query(5, ge=1, le=20),
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = UserService(db)
    return await service.get_suggested_users(current_user_id=current_user_id, limit=limit)


@router.get("/search", response_model=list[UserSearchItem])
async def search_users(
    q: str = Query(..., min_length=1, description="Search query string"),
    limit: int = Query(20, ge=1, le=50),
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = UserService(db)
    return await service.search_users(query=q, current_user_id=current_user_id, limit=limit)


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    req: UserUpdateRequest,
    current_user_id: ObjectId = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = UserService(db)
    return await service.update_profile(user_id=current_user_id, req=req)


@router.get("/{username}", response_model=UserProfileResponse)
async def get_user_profile(
    username: str,
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = UserService(db)
    return await service.get_profile(username=username, current_user_id=current_user_id)
