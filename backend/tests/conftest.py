from datetime import datetime, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

from app.config import Settings, get_settings
from app.database import get_database
from app.main import create_app
from app.security.jwt import create_access_token
from app.security.passwords import hash_password


@pytest.fixture(scope="session")
def test_settings():
    return Settings(
        ENVIRONMENT="test",
        MONGODB_URI="mongodb://localhost:27017",
        MONGODB_DATABASE="vibegram_test_db",
        JWT_SECRET="test_secret_key_vibegram_test_123456789",
    )


@pytest.fixture
async def mock_db():
    client = AsyncMongoMockClient()
    db = client["vibegram_test_db"]
    yield db
    # Cleanup after test
    await db.users.drop()
    await db.posts.drop()
    await db.comments.drop()
    await db.likes.drop()
    await db.follows.drop()


@pytest.fixture
def app(mock_db, test_settings):
    application = create_app()

    # Override get_database dependency with in-memory mock_db
    async def override_get_database():
        return mock_db

    application.dependency_overrides[get_database] = override_get_database
    application.dependency_overrides[get_settings] = lambda: test_settings
    return application


@pytest.fixture
async def async_client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
async def test_user_1(mock_db):
    user_doc = {
        "username": "user1",
        "email": "user1@vibegram.app",
        "password_hash": hash_password("password123"),
        "display_name": "User One",
        "bio": "First test user",
        "avatar_url": "https://example.com/avatar1.jpg",
        "followers_count": 0,
        "following_count": 0,
        "posts_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await mock_db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


@pytest.fixture
async def test_user_2(mock_db):
    user_doc = {
        "username": "user2",
        "email": "user2@vibegram.app",
        "password_hash": hash_password("password123"),
        "display_name": "User Two",
        "bio": "Second test user",
        "avatar_url": "https://example.com/avatar2.jpg",
        "followers_count": 0,
        "following_count": 0,
        "posts_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await mock_db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


@pytest.fixture
def auth_headers_user_1(test_user_1, test_settings):
    token = create_access_token(
        subject=str(test_user_1["_id"]),
        claims={"username": test_user_1["username"], "email": test_user_1["email"]},
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_user_2(test_user_2, test_settings):
    token = create_access_token(
        subject=str(test_user_2["_id"]),
        claims={"username": test_user_2["username"], "email": test_user_2["email"]},
    )
    return {"Authorization": f"Bearer {token}"}
