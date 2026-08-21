import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    response = await async_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "VibeGram API"


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient):
    payload = {
        "username": "new_creator",
        "email": "creator@vibegram.app",
        "password": "strongpassword123",
        "display_name": "New Creator",
        "bio": "Excited to share vibes!",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "new_creator"
    assert data["user"]["email"] == "creator@vibegram.app"
    assert data["user"]["display_name"] == "New Creator"
    assert "_id" in data["user"]


@pytest.mark.asyncio
async def test_register_duplicate_username(async_client: AsyncClient, test_user_1):
    payload = {
        "username": test_user_1["username"],
        "email": "different_email@vibegram.app",
        "password": "password123",
        "display_name": "Duplicate Username",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    data = response.json()
    assert data["error"]["code"] == "CONFLICT"


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient, test_user_1):
    payload = {
        "username": "unique_username_99",
        "email": test_user_1["email"],
        "password": "password123",
        "display_name": "Duplicate Email",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    data = response.json()
    assert data["error"]["code"] == "CONFLICT"


@pytest.mark.asyncio
async def test_register_validation_error(async_client: AsyncClient):
    payload = {
        "username": "ab",  # too short (min 3)
        "email": "not-an-email",
        "password": "123",  # too short (min 6)
        "display_name": "",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_login_success_with_username(async_client: AsyncClient, test_user_1):
    payload = {
        "username_or_email": test_user_1["username"],
        "password": "password123",
    }
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == test_user_1["username"]


@pytest.mark.asyncio
async def test_login_success_with_email(async_client: AsyncClient, test_user_1):
    payload = {
        "username_or_email": test_user_1["email"],
        "password": "password123",
    }
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_user_1["email"]


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient, test_user_1):
    payload = {
        "username_or_email": test_user_1["username"],
        "password": "wrongpassword",
    }
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_get_me_authenticated(async_client: AsyncClient, test_user_1, auth_headers_user_1):
    response = await async_client.get("/api/v1/auth/me", headers=auth_headers_user_1)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_user_1["username"]
    assert data["email"] == test_user_1["email"]


@pytest.mark.asyncio
async def test_get_me_unauthorized(async_client: AsyncClient):
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401
    data = response.json()
    assert data["error"]["code"] == "UNAUTHORIZED"
