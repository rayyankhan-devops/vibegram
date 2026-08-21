from bson import ObjectId
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_database
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse
from app.security.jwt import decode_access_token
from app.utils.exceptions import UnauthorizedException

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)


async def get_current_user_id(token: str | None = Depends(oauth2_scheme)) -> ObjectId:
    if not token:
        raise UnauthorizedException(message="Authentication credentials were not provided")
    payload = decode_access_token(token)
    user_id_str = payload.get("sub")
    if not user_id_str or not ObjectId.is_valid(user_id_str):
        raise UnauthorizedException(message="Invalid user ID in authentication token")
    return ObjectId(user_id_str)


async def get_current_user_id_optional(
    token: str | None = Depends(oauth2_scheme),
) -> ObjectId | None:
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id_str = payload.get("sub")
        if user_id_str and ObjectId.is_valid(user_id_str):
            return ObjectId(user_id_str)
    except Exception:
        return None
    return None


async def get_current_user(
    user_id: ObjectId = Depends(get_current_user_id),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> UserResponse:
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException(message="User account not found or deactivated")
    return UserResponse.model_validate(user)
