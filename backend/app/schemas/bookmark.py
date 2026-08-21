from pydantic import BaseModel

from app.schemas.common import PyObjectId


class BookmarkResponse(BaseModel):
    post_id: PyObjectId
    is_bookmarked: bool
    message: str
