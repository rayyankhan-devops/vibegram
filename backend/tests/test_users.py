import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_user_profile_anonymous(async_client: AsyncClient, test_user_1):
    response = await async_client.get(f"/api/v1/users/{test_user_1['username']}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user_1["username"]
    assert data["is_following"] is False
    assert data["is_self"] is False


@pytest.mark.asyncio
async def test_get_user_profile_self(async_client: AsyncClient, test_user_1, auth_headers_user_1):
    response = await async_client.get(
        f"/api/v1/users/{test_user_1['username']}",
        headers=auth_headers_user_1,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user_1["username"]
    assert data["is_self"] is True


@pytest.mark.asyncio
async def test_get_nonexistent_user_profile(async_client: AsyncClient):
    response = await async_client.get("/api/v1/users/non_existent_user_9999")
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_update_my_profile(async_client: AsyncClient, test_user_1, auth_headers_user_1):
    payload = {
        "display_name": "Updated Name",
        "bio": "Updated bio text for testing.",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169",
    }
    response = await async_client.patch(
        "/api/v1/users/me",
        json=payload,
        headers=auth_headers_user_1,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Updated Name"
    assert data["bio"] == "Updated bio text for testing."
    assert data["avatar_url"] == "https://images.unsplash.com/photo-1507003211169"


@pytest.mark.asyncio
async def test_search_users(async_client: AsyncClient, test_user_1, test_user_2):
    response = await async_client.get("/api/v1/users/search?q=user")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    usernames = [u["username"] for u in data]
    assert "user1" in usernames
    assert "user2" in usernames
