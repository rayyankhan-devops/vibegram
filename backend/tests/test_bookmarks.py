import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_bookmark_and_saved_posts_flow(
    async_client: AsyncClient,
    test_user_1,
    test_user_2,
    auth_headers_user_1,
    auth_headers_user_2,
):
    # 1. User 1 creates post
    post_res = await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/art.jpg", "caption": "Abstract geometry vibes"},
        headers=auth_headers_user_1,
    )
    assert post_res.status_code == 201
    post_id = post_res.json()["_id"]

    # 2. User 2 bookmarks post
    bm_res = await async_client.post(
        f"/api/v1/posts/{post_id}/bookmark",
        headers=auth_headers_user_2,
    )
    assert bm_res.status_code == 200
    assert bm_res.json()["is_bookmarked"] is True

    # 3. User 2 checks saved posts list
    saved_res = await async_client.get(
        "/api/v1/posts/saved",
        headers=auth_headers_user_2,
    )
    assert saved_res.status_code == 200
    posts = saved_res.json()["posts"]
    assert len(posts) == 1
    assert posts[0]["_id"] == post_id
    assert posts[0]["is_bookmarked"] is True

    # 4. Duplicate bookmark is idempotent
    dup_bm = await async_client.post(
        f"/api/v1/posts/{post_id}/bookmark",
        headers=auth_headers_user_2,
    )
    assert dup_bm.status_code == 200
    assert dup_bm.json()["is_bookmarked"] is True

    # 5. User 2 unbookmarks post
    unbm_res = await async_client.delete(
        f"/api/v1/posts/{post_id}/bookmark",
        headers=auth_headers_user_2,
    )
    assert unbm_res.status_code == 200
    assert unbm_res.json()["is_bookmarked"] is False

    # 6. Saved list is now empty
    saved_empty = await async_client.get(
        "/api/v1/posts/saved",
        headers=auth_headers_user_2,
    )
    assert saved_empty.status_code == 200
    assert len(saved_empty.json()["posts"]) == 0
