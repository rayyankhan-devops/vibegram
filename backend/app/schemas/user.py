from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PyObjectId


class UserCompactResponse(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    username: str
    display_name: str
    avatar_url: str = ""

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={PyObjectId: str},
    )


class UserResponse(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    username: str
    email: str
    display_name: str
    bio: str = ""
    avatar_url: str = ""
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={PyObjectId: str},
    )


class UserProfileResponse(UserResponse):
    is_following: bool = False
    is_self: bool = False


class UserUpdateRequest(BaseModel):
    display_name: str | None = Field(None, min_length=1, max_length=50)
    bio: str | None = Field(None, max_length=150)
    avatar_url: str | None = Field(None, max_length=500)


class UserSearchItem(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    username: str
    display_name: str
    avatar_url: str = ""
    bio: str = ""
    followers_count: int = 0
    is_following: bool = False
    is_self: bool = False

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={PyObjectId: str},
    )


class UserSearchResponse(BaseModel):
    users: list[UserSearchItem]
    total: int
