from bson import ObjectId

from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.security.jwt import create_access_token
from app.security.passwords import hash_password, verify_password
from app.utils.exceptions import ConflictException, UnauthorizedException


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register(self, req: RegisterRequest) -> TokenResponse:
        # Check existing username
        existing_username = await self.user_repo.get_by_username(req.username)
        if existing_username:
            raise ConflictException(message=f"Username '{req.username}' is already taken")

        # Check existing email
        existing_email = await self.user_repo.get_by_email(req.email)
        if existing_email:
            raise ConflictException(message=f"Email '{req.email}' is already registered")

        # Create user with hashed password
        hashed_pwd = hash_password(req.password)
        user_doc = {
            "username": req.username,
            "email": req.email,
            "password_hash": hashed_pwd,
            "display_name": req.display_name,
            "bio": req.bio or "",
            "avatar_url": req.avatar_url or "",
            "followers_count": 0,
            "following_count": 0,
            "posts_count": 0,
        }
        created_user = await self.user_repo.create(user_doc)

        user_id_str = str(created_user["_id"])
        token = create_access_token(
            subject=user_id_str,
            claims={"username": created_user["username"], "email": created_user["email"]},
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(created_user),
        )

    async def login(self, req: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_username_or_email(req.username_or_email)
        if not user:
            raise UnauthorizedException(message="Invalid username/email or password")

        if not verify_password(req.password, user.get("password_hash", "")):
            raise UnauthorizedException(message="Invalid username/email or password")

        user_id_str = str(user["_id"])
        token = create_access_token(
            subject=user_id_str,
            claims={"username": user["username"], "email": user["email"]},
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    async def get_me(self, user_id: ObjectId) -> UserResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException(message="User account no longer exists")
        return UserResponse.model_validate(user)
