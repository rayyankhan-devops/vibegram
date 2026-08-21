import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_post_success(async_client: AsyncClient, test_user_1, auth_headers_user_1):
    payload = {
        "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        "caption": "Exploring vibrant UI gradients #design",
    }
    response = await async_client.post("/api/v1/posts", json=payload, headers=auth_headers_user_1)
    assert response.status_code == 201
    data = response.json()
    assert "_id" in data
    assert data["image_url"] == payload["image_url"]
    assert data["caption"] == payload["caption"]
    assert data["likes_count"] == 0
    assert data["comments_count"] == 0
    assert data["author"]["username"] == test_user_1["username"]


@pytest.mark.asyncio
async def test_create_post_unauthorized(async_client: AsyncClient):
    payload = {
        "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        "caption": "Unauthorized post attempt",
    }
    response = await async_client.post("/api/v1/posts", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_post_by_id(async_client: AsyncClient, test_user_1, auth_headers_user_1):
    # Create post first
    create_res = await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/img.jpg", "caption": "Test post"},
        headers=auth_headers_user_1,
    )
    post_id = create_res.json()["_id"]

    # Get post by ID
    get_res = await async_client.get(f"/api/v1/posts/{post_id}")
    assert get_res.status_code == 200
    assert get_res.json()["_id"] == post_id
    assert get_res.json()["caption"] == "Test post"


@pytest.mark.asyncio
async def test_delete_own_post(async_client: AsyncClient, test_user_1, auth_headers_user_1):
    create_res = await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/delete_me.jpg", "caption": "Will be deleted"},
        headers=auth_headers_user_1,
    )
    post_id = create_res.json()["_id"]

    # Delete post
    del_res = await async_client.delete(f"/api/v1/posts/{post_id}", headers=auth_headers_user_1)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Check post is now 404
    get_res = await async_client.get(f"/api/v1/posts/{post_id}")
    assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_delete_other_user_post_forbidden(
    async_client: AsyncClient,
    test_user_1,
    test_user_2,
    auth_headers_user_1,
    auth_headers_user_2,
):
    create_res = await async_client.post(
        "/api/v1/posts",
        json={"image_url": "https://example.com/user1_post.jpg", "caption": "User 1 post"},
        headers=auth_headers_user_1,
    )
    post_id = create_res.json()["_id"]

    # User 2 attempts to delete User 1's post
    del_res = await async_client.delete(f"/api/v1/posts/{post_id}", headers=auth_headers_user_2)
    assert del_res.status_code == 403
    assert del_res.json()["error"]["code"] == "FORBIDDEN"
