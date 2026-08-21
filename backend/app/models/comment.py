from datetime import datetime, timezone

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field


class CommentModel(BaseModel):
    id: ObjectId | None = Field(default=None, alias="_id")
    post_id: ObjectId
    author_id: ObjectId
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )


class LikeModel(BaseModel):
    id: ObjectId | None = Field(default=None, alias="_id")
    post_id: ObjectId
    user_id: ObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )


class FollowModel(BaseModel):
    id: ObjectId | None = Field(default=None, alias="_id")
    follower_id: ObjectId
    following_id: ObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
