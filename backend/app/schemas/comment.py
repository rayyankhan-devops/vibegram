from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import PyObjectId


class CommentAuthorSummary(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    username: str
    display_name: str
    avatar_url: str = ""

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class CommentCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=500, description="Comment text")

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Comment cannot be blank or contain only whitespace")
        return clean


class CommentResponse(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    post_id: PyObjectId
    author_id: PyObjectId
    author: CommentAuthorSummary | None = None
    content: str
    created_at: datetime
    is_owner: bool = False

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class CommentListResponse(BaseModel):
    comments: list[CommentResponse]
    total: int
