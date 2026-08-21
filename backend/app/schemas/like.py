from pydantic import BaseModel

from app.schemas.common import PyObjectId


class LikeResponse(BaseModel):
    post_id: PyObjectId
    likes_count: int
    is_liked: bool
    message: str
