from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, description="Unique alphanumeric username")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=100, description="Account password (min 6 chars)")
    display_name: str = Field(..., min_length=1, max_length=50, description="Full or display name")
    bio: str | None = Field(default="", max_length=150)
    avatar_url: str | None = Field(default="", max_length=500)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        clean = v.strip().lower()
        if not clean.replace("_", "").replace(".", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, underscores, and dots")
        return clean

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginRequest(BaseModel):
    username_or_email: str = Field(..., min_length=3, description="Username or email address")
    password: str = Field(..., min_length=1, description="Password")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"  # forward ref


# Import UserResponse for TokenResponse type resolution
from app.schemas.user import UserResponse  # noqa: E402

TokenResponse.model_rebuild()
