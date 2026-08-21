import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_follow_and_unfollow_flow(
    async_client: AsyncClient,
    test_user_1,
    test_user_2,
    auth_headers_user_1,
):
    target_user_id = str(test_user_2["_id"])

    # 1. User 1 follows User 2
    follow_res = await async_client.post(
        f"/api/v1/users/{target_user_id}/follow",
        headers=auth_headers_user_1,
    )
    assert follow_res.status_code == 200
    assert follow_res.json()["is_following"] is True
    assert follow_res.json()["followers_count"] == 1

    # 2. Check profile shows is_following=True
    profile_res = await async_client.get(
        f"/api/v1/users/{test_user_2['username']}",
        headers=auth_headers_user_1,
    )
    assert profile_res.json()["is_following"] is True
    assert profile_res.json()["followers_count"] == 1

    # 3. Check followers list
    followers_res = await async_client.get(
        f"/api/v1/users/{target_user_id}/followers",
        headers=auth_headers_user_1,
    )
    assert followers_res.status_code == 200
    assert followers_res.json()["total"] >= 1
    follower_usernames = [u["username"] for u in followers_res.json()["users"]]
    assert test_user_1["username"] in follower_usernames

    # 4. User 1 unfollows User 2
    unfollow_res = await async_client.delete(
        f"/api/v1/users/{target_user_id}/follow",
        headers=auth_headers_user_1,
    )
    assert unfollow_res.status_code == 200
    assert unfollow_res.json()["is_following"] is False
    assert unfollow_res.json()["followers_count"] == 0


@pytest.mark.asyncio
async def test_self_follow_prevented(
    async_client: AsyncClient,
    test_user_1,
    auth_headers_user_1,
):
    user_id = str(test_user_1["_id"])
    res = await async_client.post(
        f"/api/v1/users/{user_id}/follow",
        headers=auth_headers_user_1,
    )
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "BAD_REQUEST"
