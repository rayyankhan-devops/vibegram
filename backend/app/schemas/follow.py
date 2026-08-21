from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PyObjectId


class FollowResponse(BaseModel):
    user_id: PyObjectId
    is_following: bool
    followers_count: int
    message: str


class FollowUserItem(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    username: str
    display_name: str
    avatar_url: str = ""
    is_following: bool = False
    is_self: bool = False

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class FollowListResponse(BaseModel):
    users: list[FollowUserItem]
    total: int
