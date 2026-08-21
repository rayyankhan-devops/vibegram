from datetime import datetime, timezone

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field


class UserModel(BaseModel):
    id: ObjectId | None = Field(default=None, alias="_id")
    username: str
    email: str
    password_hash: str
    display_name: str
    bio: str = ""
    avatar_url: str = ""
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
