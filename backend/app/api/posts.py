from bson import ObjectId
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.schemas.bookmark import BookmarkResponse
from app.schemas.common import SuccessMessageResponse
from app.schemas.post import PostCreateRequest, PostListResponse, PostResponse
from app.security.dependencies import get_current_user_id, get_current_user_id_optional
from app.services.bookmark_service import BookmarkService
from app.services.post_service import PostService
from app.utils.exceptions import BadRequestException

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    req: PostCreateRequest,
    current_user_id: ObjectId = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = PostService(db)
    return await service.create_post(author_id=current_user_id, req=req)


@router.get("/feed", response_model=PostListResponse)
async def get_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user_id: ObjectId = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = PostService(db)
    return await service.get_feed(current_user_id=current_user_id, page=page, limit=limit)


@router.get("/explore", response_model=PostListResponse)
async def get_explore(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=50),
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = PostService(db)
    return await service.get_explore(current_user_id=current_user_id, page=page, limit=limit)


@router.get("/saved", response_model=PostListResponse)
async def get_saved_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=50),
    current_user_id: ObjectId = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = PostService(db)
    return await service.get_saved_posts(current_user_id=current_user_id, page=page, limit=limit)


@router.get("/user/{username}", response_model=PostListResponse)
async def get_user_posts(
    username: str,
    page: int = Query(1, ge=1),
    limit: int = Query(30, ge=1, le=50),
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    service = PostService(db)
    return await service.get_user_posts(username=username, current_user_id=current_user_id, page=page, limit=limit)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post_by_id(
    post_id: str,
    current_user_id: ObjectId | None = Depends(get_current_user_id_optional),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not ObjectId.is_valid(post_id):
        raise BadRequestException("Invalid post ID format")
    service = PostService(db)
    return await service.get_post(post_id=ObjectId(post_id), current_user_id=current_user_id)


@router.delete("/{post_id}", response_model=SuccessMessageResponse)
async def delete_post(
    post_id: str,
    current_user_id: ObjectId = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not ObjectId.is_valid(post_id):
        raise BadRequestException("Invalid post ID format")
    service = PostService(db)
    await service.delete_post(post_id=ObjectId(post_id), current_user_id=current_user_id)
    return SuccessMessageResponse(success=True, message="Post deleted successfully")


@router.post("/{post_id}/bookmark", response_model=BookmarkResponse)
async def bookmark_post(
    post_id: str,
    current_user_id: ObjectId = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not ObjectId.is_valid(post_id):
        raise BadRequestException("Invalid post ID format")
    service = BookmarkService(db)
    return await service.bookmark_post(user_id=current_user_id, post_id=ObjectId(post_id))


@router.delete("/{post_id}/bookmark", response_model=BookmarkResponse)
async def unbookmark_post(
    post_id: str,
    current_user_id: ObjectId = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if not ObjectId.is_valid(post_id):
        raise BadRequestException("Invalid post ID format")
    service = BookmarkService(db)
    return await service.unbookmark_post(user_id=current_user_id, post_id=ObjectId(post_id))
