import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from app.config import get_settings

logger = logging.getLogger("vibegram.database")


class DatabaseManager:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


db_manager = DatabaseManager()


def get_database() -> AsyncIOMotorDatabase:
    if db_manager.db is None:
        raise RuntimeError("Database is not initialized. Ensure app startup event ran.")
    return db_manager.db


async def connect_to_mongo() -> None:
    settings = get_settings()
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI} (db: {settings.MONGODB_DATABASE})...")
    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            maxPoolSize=50,
            minPoolSize=10,
            serverSelectionTimeoutMS=5000,
        )
        db_manager.db = db_manager.client[settings.MONGODB_DATABASE]
        # Ping the server
        await db_manager.client.admin.command("ping")
        logger.info("Connected to MongoDB successfully!")
        await init_db_indexes(db_manager.db)
    except PyMongoError as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise e


async def close_mongo_connection() -> None:
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection pool...")
        db_manager.client.close()
        logger.info("MongoDB connection closed.")


# Convenience aliases for lifecycle hooks
init_db = connect_to_mongo
close_db = close_mongo_connection


async def init_db_indexes(db: AsyncIOMotorDatabase) -> None:
    """
    Idempotently creates all required collection indexes for optimal performance and uniqueness.
    """
    try:
        # Create users indexes
        await db.users.create_index([("username", 1)], unique=True, name="idx_users_username_unique")
        await db.users.create_index([("email", 1)], unique=True, name="idx_users_email_unique")
        await db.users.create_index([("display_name", "text"), ("username", "text")], name="idx_users_text")

        # Create posts indexes
        await db.posts.create_index([("author_id", 1), ("created_at", -1)], name="idx_posts_author_created")
        await db.posts.create_index([("created_at", -1)], name="idx_posts_created_desc")

        # Create comments indexes
        await db.comments.create_index([("post_id", 1), ("created_at", 1)], name="idx_comments_post_created")
        await db.comments.create_index([("author_id", 1)], name="idx_comments_author")

        # Create likes indexes (compound unique constraint)
        await db.likes.create_index([("post_id", 1), ("user_id", 1)], unique=True, name="idx_likes_post_user_unique")
        await db.likes.create_index([("user_id", 1)], name="idx_likes_user")

        # Create follows indexes (compound unique constraint)
        await db.follows.create_index(
            [("follower_id", 1), ("following_id", 1)], unique=True, name="idx_follows_pair_unique"
        )
        await db.follows.create_index([("following_id", 1)], name="idx_follows_following")

        # Create bookmarks indexes (compound unique constraint)
        await db.bookmarks.create_index(
            [("user_id", 1), ("post_id", 1)], unique=True, name="idx_bookmarks_user_post_unique"
        )
        await db.bookmarks.create_index([("user_id", 1), ("created_at", -1)], name="idx_bookmarks_user_created")

        logger.info("MongoDB indexes verified & created successfully.")
    except Exception as e:
        logger.warning(f"Error initializing indexes: {e}")
