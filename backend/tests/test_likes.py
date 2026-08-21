import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_like_and_unlike_flow(
    async_client: AsyncClient,
    test_user_1,
    test_user_2,
    auth_headers_user_1,
    auth_headers_user_2,
):
    # 1. User 1 creates post
    post_res = await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/sunset.jpg", "caption": "Sunset vibe"},
        headers=auth_headers_user_1,
    )
    post_id = post_res.json()["_id"]

    # 2. User 2 likes post
    like_res = await async_client.post(
        f"/api/v1/posts/{post_id}/like",
        headers=auth_headers_user_2,
    )
    assert like_res.status_code == 200
    assert like_res.json()["is_liked"] is True
    assert like_res.json()["likes_count"] == 1

    # 3. Duplicate like from User 2 does not increment count further
    dup_res = await async_client.post(
        f"/api/v1/posts/{post_id}/like",
        headers=auth_headers_user_2,
    )
    assert dup_res.status_code == 200
    assert dup_res.json()["likes_count"] == 1

    # 4. Check post detail shows is_liked=True for User 2
    detail_res = await async_client.get(
        f"/api/v1/posts/{post_id}",
        headers=auth_headers_user_2,
    )
    assert detail_res.json()["is_liked"] is True
    assert detail_res.json()["likes_count"] == 1

    # 5. User 2 unlikes post
    unlike_res = await async_client.delete(
        f"/api/v1/posts/{post_id}/like",
        headers=auth_headers_user_2,
    )
    assert unlike_res.status_code == 200
    assert unlike_res.json()["is_liked"] is False
    assert unlike_res.json()["likes_count"] == 0
