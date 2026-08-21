from bson import ObjectId
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.security.dependencies import get_current_user_id
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> AuthService:
    repo = UserRepository(db)
    return AuthService(repo)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    req: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return await auth_service.register(req)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and obtain JWT token",
)
async def login(
    req: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    return await auth_service.login(req)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Retrieve the authenticated current user",
)
async def get_me(
    current_user_id: ObjectId = Depends(get_current_user_id),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    return await auth_service.get_me(current_user_id)
