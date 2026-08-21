import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_comment_lifecycle(
    async_client: AsyncClient,
    test_user_1,
    test_user_2,
    auth_headers_user_1,
    auth_headers_user_2,
):
    # 1. User 1 creates post
    post_res = await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/art.jpg", "caption": "Art piece"},
        headers=auth_headers_user_1,
    )
    post_id = post_res.json()["_id"]

    # 2. User 2 comments on post
    comment_res = await async_client.post(
        f"/api/v1/posts/{post_id}/comments",
        json={"content": "Incredible colors and vibes!"},
        headers=auth_headers_user_2,
    )
    assert comment_res.status_code == 201
    comment_data = comment_res.json()
    assert comment_data["content"] == "Incredible colors and vibes!"
    assert comment_data["author"]["username"] == test_user_2["username"]
    comment_id = comment_data["_id"]

    # 3. List comments
    list_res = await async_client.get(f"/api/v1/posts/{post_id}/comments")
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 1
    assert list_res.json()["comments"][0]["_id"] == comment_id

    # 4. User 2 deletes their comment
    del_res = await async_client.delete(
        f"/api/v1/comments/{comment_id}",
        headers=auth_headers_user_2,
    )
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 5. List comments again
    list_res_after = await async_client.get(f"/api/v1/posts/{post_id}/comments")
    assert list_res_after.json()["total"] == 0


@pytest.mark.asyncio
async def test_empty_comment_rejected(async_client: AsyncClient, test_user_1, auth_headers_user_1):
    post_res = await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/art.jpg", "caption": "Art piece"},
        headers=auth_headers_user_1,
    )
    post_id = post_res.json()["_id"]

    # Post blank comment
    comment_res = await async_client.post(
        f"/api/v1/posts/{post_id}/comments",
        json={"content": "    "},
        headers=auth_headers_user_1,
    )
    assert comment_res.status_code == 422
