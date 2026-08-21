from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.follow_repository import FollowRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserProfileResponse, UserResponse, UserSearchItem, UserUpdateRequest
from app.utils.exceptions import NotFoundException


class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.user_repo = UserRepository(db)
        self.follow_repo = FollowRepository(db)

    async def get_profile(self, username: str, current_user_id: ObjectId | None = None) -> UserProfileResponse:
        user = await self.user_repo.get_by_username(username)
        if not user:
            raise NotFoundException("User", username)

        is_following = False
        is_self = False

        if current_user_id:
            if current_user_id == user["_id"]:
                is_self = True
            else:
                existing_follow = await self.follow_repo.get_follow(
                    follower_id=current_user_id, following_id=user["_id"]
                )
                is_following = existing_follow is not None

        return UserProfileResponse(
            _id=user["_id"],
            username=user["username"],
            email=user["email"],
            display_name=user["display_name"],
            bio=user.get("bio", ""),
            avatar_url=user.get("avatar_url", ""),
            followers_count=user.get("followers_count", 0),
            following_count=user.get("following_count", 0),
            posts_count=user.get("posts_count", 0),
            created_at=user["created_at"],
            is_following=is_following,
            is_self=is_self,
        )

    async def update_profile(self, user_id: ObjectId, req: UserUpdateRequest) -> UserResponse:
        update_data = req.model_dump(exclude_unset=True)
        if not update_data:
            user = await self.user_repo.get_by_id(user_id)
            if not user:
                raise NotFoundException("User", str(user_id))
            return UserResponse(**user)

        user = await self.user_repo.update_user(user_id, update_data)
        if not user:
            raise NotFoundException("User", str(user_id))
        return UserResponse(**user)

    async def search_users(
        self,
        query: str,
        current_user_id: ObjectId | None = None,
        limit: int = 20,
    ) -> list[UserSearchItem]:
        users = await self.user_repo.search(query=query, limit=limit)
        if not users:
            return []

        following_set: set[ObjectId] = set()
        if current_user_id:
            target_ids = [u["_id"] for u in users if u["_id"] != current_user_id]
            following_set = await self.follow_repo.get_following_set_for_user(current_user_id, target_ids)

        results: list[UserSearchItem] = []
        for u in users:
            is_following = u["_id"] in following_set
            is_self = (current_user_id == u["_id"]) if current_user_id else False
            results.append(
                UserSearchItem(
                    _id=u["_id"],
                    username=u["username"],
                    display_name=u["display_name"],
                    avatar_url=u.get("avatar_url", ""),
                    bio=u.get("bio", ""),
                    followers_count=u.get("followers_count", 0),
                    is_following=is_following,
                    is_self=is_self,
                )
            )
        return results

    async def get_suggested_users(
        self,
        current_user_id: ObjectId | None = None,
        limit: int = 5,
    ) -> list[UserSearchItem]:
        # Exclude self and followed users
        exclude_ids = [current_user_id] if current_user_id else []
        if current_user_id:
            following_ids = await self.follow_repo.get_following_ids(current_user_id)
            exclude_ids.extend(following_ids)

        cursor = self.user_repo.collection.find({"_id": {"$nin": exclude_ids}}).sort("followers_count", -1).limit(limit)
        users = await cursor.to_list(length=limit)

        results: list[UserSearchItem] = []
        for u in users:
            results.append(
                UserSearchItem(
                    _id=u["_id"],
                    username=u["username"],
                    display_name=u["display_name"],
                    avatar_url=u.get("avatar_url", ""),
                    bio=u.get("bio", ""),
                    followers_count=u.get("followers_count", 0),
                    is_following=False,
                    is_self=False,
                )
            )
        return results
