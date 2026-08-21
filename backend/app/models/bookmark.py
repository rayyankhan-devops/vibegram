from datetime import datetime, timezone

from bson import ObjectId
from pydantic import BaseModel, ConfigDict, Field


class BookmarkModel(BaseModel):
    id: ObjectId | None = Field(default=None, alias="_id")
    user_id: ObjectId
    post_id: ObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
