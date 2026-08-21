import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_feed_and_explore(
    async_client: AsyncClient,
    test_user_1,
    test_user_2,
    auth_headers_user_1,
    auth_headers_user_2,
):
    # 1. User 1 creates post 1
    await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/user1.jpg", "caption": "User 1 caption"},
        headers=auth_headers_user_1,
    )

    # 2. User 2 creates post 2
    await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/user2.jpg", "caption": "User 2 caption"},
        headers=auth_headers_user_2,
    )

    # 3. User 1 initially doesn't follow User 2 -> feed should only have User 1's post
    feed_res_1 = await async_client.get("/api/v1/posts/feed", headers=auth_headers_user_1)
    assert feed_res_1.status_code == 200
    feed_posts_1 = feed_res_1.json()["posts"]
    assert len(feed_posts_1) == 1
    assert feed_posts_1[0]["author"]["username"] == test_user_1["username"]

    # 4. User 1 follows User 2
    await async_client.post(
        f"/api/v1/users/{str(test_user_2['_id'])}/follow",
        headers=auth_headers_user_1,
    )

    # 5. User 1 feed now contains both posts
    feed_res_2 = await async_client.get("/api/v1/posts/feed", headers=auth_headers_user_1)
    assert feed_res_2.status_code == 200
    assert feed_res_2.json()["total"] == 2
    assert len(feed_res_2.json()["posts"]) == 2

    # 6. Explore returns all posts
    explore_res = await async_client.get("/api/v1/posts/explore")
    assert explore_res.status_code == 200
    assert explore_res.json()["total"] >= 2

    # 7. User specific posts
    user2_posts_res = await async_client.get(f"/api/v1/posts/user/{test_user_2['username']}")
    assert user2_posts_res.status_code == 200
    assert user2_posts_res.json()["total"] == 1
    assert user2_posts_res.json()["posts"][0]["caption"] == "User 2 caption"
