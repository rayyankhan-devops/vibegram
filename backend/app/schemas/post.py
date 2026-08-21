from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PaginatedResponse, PyObjectId
from app.schemas.user import UserCompactResponse


class PostCreateRequest(BaseModel):
    image_url: str = Field(..., description="Public image URL")
    caption: str = Field(default="", max_length=2200, description="Post caption")


class PostUpdateRequest(BaseModel):
    caption: str | None = Field(default=None, max_length=2200)


class PostResponse(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    author_id: PyObjectId
    author: UserCompactResponse | None = None
    image_url: str
    caption: str
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False
    is_bookmarked: bool = False
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={PyObjectId: str},
    )


class PostListResponse(PaginatedResponse[PostResponse]):
    posts: list[PostResponse]
