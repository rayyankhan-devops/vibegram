from bson import ObjectId

from app.repositories.follow_repository import FollowRepository
from app.repositories.user_repository import UserRepository
from app.schemas.follow import FollowListResponse, FollowResponse, FollowUserItem
from app.utils.exceptions import BadRequestException, NotFoundException


class FollowService:
    def __init__(self, follow_repo: FollowRepository, user_repo: UserRepository):
        self.follow_repo = follow_repo
        self.user_repo = user_repo

    async def follow_user(self, follower_id: ObjectId, target_user_id: ObjectId) -> FollowResponse:
        if follower_id == target_user_id:
            raise BadRequestException("You cannot follow yourself")

        target_user = await self.user_repo.get_by_id(target_user_id)
        if not target_user:
            raise NotFoundException("User", str(target_user_id))

        created = await self.follow_repo.create_follow(
            follower_id=follower_id,
            following_id=target_user_id,
        )

        if created:
            await self.user_repo.increment_counts(follower_id, following_delta=1)
            await self.user_repo.increment_counts(target_user_id, followers_delta=1)
            updated_target = await self.user_repo.get_by_id(target_user_id)
            followers_count = updated_target.get("followers_count", target_user.get("followers_count", 0) + 1)
        else:
            followers_count = target_user.get("followers_count", 0)

        return FollowResponse(
            user_id=target_user_id,
            is_following=True,
            followers_count=followers_count,
            message="User followed successfully",
        )

    async def unfollow_user(self, follower_id: ObjectId, target_user_id: ObjectId) -> FollowResponse:
        if follower_id == target_user_id:
            raise BadRequestException("You cannot unfollow yourself")

        target_user = await self.user_repo.get_by_id(target_user_id)
        if not target_user:
            raise NotFoundException("User", str(target_user_id))

        deleted = await self.follow_repo.delete_follow(
            follower_id=follower_id,
            following_id=target_user_id,
        )

        if deleted:
            await self.user_repo.increment_counts(follower_id, following_delta=-1)
            await self.user_repo.increment_counts(target_user_id, followers_delta=-1)
            updated_target = await self.user_repo.get_by_id(target_user_id)
            followers_count = max(0, updated_target.get("followers_count", target_user.get("followers_count", 1) - 1))
        else:
            followers_count = target_user.get("followers_count", 0)

        return FollowResponse(
            user_id=target_user_id,
            is_following=False,
            followers_count=followers_count,
            message="User unfollowed successfully",
        )

    async def get_followers(
        self,
        user_id: ObjectId,
        current_user_id: ObjectId | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> FollowListResponse:
        target_user = await self.user_repo.get_by_id(user_id)
        if not target_user:
            raise NotFoundException("User", str(user_id))

        follow_docs = await self.follow_repo.get_followers(user_id, skip=skip, limit=limit)
        if not follow_docs:
            return FollowListResponse(users=[], total=0)

        follower_ids = [doc["follower_id"] for doc in follow_docs]
        users_map = await self.user_repo.get_many_by_ids(follower_ids)

        # Check which of these followers the current_user is following
        following_set = set()
        if current_user_id:
            following_set = await self.follow_repo.get_following_set_for_user(
                follower_id=current_user_id,
                target_ids=follower_ids,
            )

        items: list[FollowUserItem] = []
        for fid in follower_ids:
            u = users_map.get(fid)
            if u:
                items.append(
                    FollowUserItem(
                        _id=u["_id"],
                        username=u["username"],
                        display_name=u.get("display_name", ""),
                        avatar_url=u.get("avatar_url", ""),
                        is_following=u["_id"] in following_set,
                        is_self=current_user_id == u["_id"],
                    )
                )

        return FollowListResponse(users=items, total=target_user.get("followers_count", len(items)))

    async def get_following(
        self,
        user_id: ObjectId,
        current_user_id: ObjectId | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> FollowListResponse:
        target_user = await self.user_repo.get_by_id(user_id)
        if not target_user:
            raise NotFoundException("User", str(user_id))

        follow_docs = await self.follow_repo.get_following(user_id, skip=skip, limit=limit)
        if not follow_docs:
            return FollowListResponse(users=[], total=0)

        following_ids = [doc["following_id"] for doc in follow_docs]
        users_map = await self.user_repo.get_many_by_ids(following_ids)

        following_set = set()
        if current_user_id:
            following_set = await self.follow_repo.get_following_set_for_user(
                follower_id=current_user_id,
                target_ids=following_ids,
            )

        items: list[FollowUserItem] = []
        for fid in following_ids:
            u = users_map.get(fid)
            if u:
                items.append(
                    FollowUserItem(
                        _id=u["_id"],
                        username=u["username"],
                        display_name=u.get("display_name", ""),
                        avatar_url=u.get("avatar_url", ""),
                        is_following=u["_id"] in following_set,
                        is_self=current_user_id == u["_id"],
                    )
                )

        return FollowListResponse(users=items, total=target_user.get("following_count", len(items)))
