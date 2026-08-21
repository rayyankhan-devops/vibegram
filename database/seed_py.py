"""
VibeGram Python Async Database Seeder
Seeds MongoDB with realistic profiles, posts, comments, likes, follows, and bookmarks.
"""

import asyncio
from datetime import datetime, timezone
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


async def seed():
    uri = "mongodb://127.0.0.1:27017"
    db_name = "vibegram_db"
    print(f"[VibeGram] Connecting to {uri} (db: {db_name})...")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]

    print("[VibeGram] Dropping existing collections...")
    await db.users.drop()
    await db.posts.drop()
    await db.comments.drop()
    await db.likes.drop()
    await db.follows.drop()
    await db.bookmarks.drop()

    # 1. Users
    password_hash = hash_password("password123")
    now = datetime.now(timezone.utc)

    users_data = [
        {
            "username": "alex_design",
            "email": "alex@vibegram.app",
            "password_hash": password_hash,
            "display_name": "Alex Rivera",
            "bio": "✨ Digital designer & creative technologist | Crafting minimalist interfaces & aesthetic dark modes.",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            "followers_count": 4,
            "following_count": 3,
            "posts_count": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "username": "sarah_codes",
            "email": "sarah@vibegram.app",
            "password_hash": password_hash,
            "display_name": "Sarah Chen",
            "bio": "⚡ Full-stack engineer | Open source contributor | Coffee enthusiast & mechanical keyboards.",
            "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
            "followers_count": 3,
            "following_count": 2,
            "posts_count": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "username": "mike_lens",
            "email": "mike@vibegram.app",
            "password_hash": password_hash,
            "display_name": "Mike Lens",
            "bio": "📸 Street & architectural photographer | Capturing neon nights and urban geometry across Tokyo & NYC.",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
            "followers_count": 2,
            "following_count": 4,
            "posts_count": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "username": "elena_wander",
            "email": "elena@vibegram.app",
            "password_hash": password_hash,
            "display_name": "Elena Rostova",
            "bio": "🏔️ Alpine nomad & trail runner | Chasing foggy mountain peaks, alpine lakes, and pine forests.",
            "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
            "followers_count": 2,
            "following_count": 2,
            "posts_count": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "username": "david_beats",
            "email": "david@vibegram.app",
            "password_hash": password_hash,
            "display_name": "David Kim",
            "bio": "🎧 Audio producer & synthesist | Crafting ambient lo-fi soundscapes and vintage tape vibes.",
            "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
            "followers_count": 1,
            "following_count": 1,
            "posts_count": 2,
            "created_at": now,
            "updated_at": now,
        },
    ]

    inserted_users = await db.users.insert_many(users_data)
    user_ids = inserted_users.inserted_ids
    u_alex, u_sarah, u_mike, u_elena, u_david = user_ids

    # 2. Posts
    posts_data = [
        {
            "author_id": u_alex,
            "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
            "caption": "Exploring iridescent typography and fluid mesh gradients for the new VibeGram design system ✨ #design #gradient #vibegram",
            "likes_count": 4,
            "comments_count": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_alex,
            "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
            "caption": "Retro tech aesthetic workspace setup. Amber CRT monitors and custom keycaps 💻 #workspace #retrotech #vibes",
            "likes_count": 3,
            "comments_count": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_sarah,
            "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
            "caption": "Deep focus coding session late into the night. Nothing beats clean architecture and elegant tests ⚡ #coding #fullstack #typescript",
            "likes_count": 5,
            "comments_count": 2,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_sarah,
            "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
            "caption": "Coffee + TypeScript = Maximum developer throughput ☕ #developerlife #coffee #vibes",
            "likes_count": 3,
            "comments_count": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_mike,
            "image_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
            "caption": "Tokyo rain reflections in Shinjuku. Neon lights hitting the asphalt ☔🏮 #tokyo #streetphotography #neonvibes",
            "likes_count": 4,
            "comments_count": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_mike,
            "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
            "caption": "Architectural symmetry in downtown Chicago. Concrete and steel towering into the twilight 🏙️ #architecture #urban #photography",
            "likes_count": 3,
            "comments_count": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_elena,
            "image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80",
            "caption": "Sunrise over the mountain ridge. 3,000 meters above sea level and feeling the alpine energy 🏔️☀️ #alps #hiking #wanderlust",
            "likes_count": 4,
            "comments_count": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_elena,
            "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80",
            "caption": "Morning mist moving through the pine forest. Nature is the ultimate canvas 🌲🍃 #forest #naturevibes #serenity",
            "likes_count": 3,
            "comments_count": 0,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_david,
            "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
            "caption": "Analog synth modular patch session. Warm filters and oscillating harmonics 🎧🎛️ #synth #modular #musicproduction",
            "likes_count": 3,
            "comments_count": 1,
            "created_at": now,
            "updated_at": now,
        },
        {
            "author_id": u_david,
            "image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80",
            "caption": "Live performance setup under purple and amber stage lighting 🎶💜 #electronicmusic #liveperformance #vibes",
            "likes_count": 2,
            "comments_count": 0,
            "created_at": now,
            "updated_at": now,
        },
    ]

    inserted_posts = await db.posts.insert_many(posts_data)
    post_ids = inserted_posts.inserted_ids

    # 3. Comments
    comments_data = [
        {
            "post_id": post_ids[0],
            "author_id": u_sarah,
            "content": "These gradients look phenomenal! Love the color palette.",
            "created_at": now,
        },
        {
            "post_id": post_ids[0],
            "author_id": u_mike,
            "content": "That lighting and texture is super sleek 🔥",
            "created_at": now,
        },
        {
            "post_id": post_ids[1],
            "author_id": u_david,
            "content": "Those amber CRT monitors are timeless.",
            "created_at": now,
        },
        {
            "post_id": post_ids[2],
            "author_id": u_alex,
            "content": "Clean code is definitely a piece of art 👏",
            "created_at": now,
        },
        {
            "post_id": post_ids[2],
            "author_id": u_david,
            "content": "Late night coding hits different with lo-fi beats in the background.",
            "created_at": now,
        },
        {
            "post_id": post_ids[3],
            "author_id": u_elena,
            "content": "Need that coffee right now!",
            "created_at": now,
        },
        {
            "post_id": post_ids[4],
            "author_id": u_alex,
            "content": "Stunning reflections! Tokyo at night is unbeatable.",
            "created_at": now,
        },
        {
            "post_id": post_ids[5],
            "author_id": u_sarah,
            "content": "Love the brutalist lines in this shot.",
            "created_at": now,
        },
        {
            "post_id": post_ids[6],
            "author_id": u_mike,
            "content": "Incredible golden hour light over the peaks.",
            "created_at": now,
        },
        {
            "post_id": post_ids[8],
            "author_id": u_alex,
            "content": "Those patch cables look wild! Excited to hear the new track.",
            "created_at": now,
        },
    ]
    await db.comments.insert_many(comments_data)

    # 4. Likes
    likes_data = [
        {"post_id": post_ids[0], "user_id": u_sarah, "created_at": now},
        {"post_id": post_ids[0], "user_id": u_mike, "created_at": now},
        {"post_id": post_ids[0], "user_id": u_elena, "created_at": now},
        {"post_id": post_ids[0], "user_id": u_david, "created_at": now},
        {"post_id": post_ids[1], "user_id": u_sarah, "created_at": now},
        {"post_id": post_ids[1], "user_id": u_mike, "created_at": now},
        {"post_id": post_ids[1], "user_id": u_david, "created_at": now},
        {"post_id": post_ids[2], "user_id": u_alex, "created_at": now},
        {"post_id": post_ids[2], "user_id": u_mike, "created_at": now},
        {"post_id": post_ids[2], "user_id": u_elena, "created_at": now},
        {"post_id": post_ids[2], "user_id": u_david, "created_at": now},
        {"post_id": post_ids[2], "user_id": u_sarah, "created_at": now},
        {"post_id": post_ids[3], "user_id": u_alex, "created_at": now},
        {"post_id": post_ids[3], "user_id": u_elena, "created_at": now},
        {"post_id": post_ids[3], "user_id": u_david, "created_at": now},
        {"post_id": post_ids[4], "user_id": u_alex, "created_at": now},
        {"post_id": post_ids[4], "user_id": u_sarah, "created_at": now},
        {"post_id": post_ids[4], "user_id": u_elena, "created_at": now},
        {"post_id": post_ids[4], "user_id": u_david, "created_at": now},
        {"post_id": post_ids[5], "user_id": u_alex, "created_at": now},
        {"post_id": post_ids[5], "user_id": u_sarah, "created_at": now},
        {"post_id": post_ids[5], "user_id": u_elena, "created_at": now},
        {"post_id": post_ids[6], "user_id": u_alex, "created_at": now},
        {"post_id": post_ids[6], "user_id": u_sarah, "created_at": now},
        {"post_id": post_ids[6], "user_id": u_mike, "created_at": now},
        {"post_id": post_ids[6], "user_id": u_david, "created_at": now},
        {"post_id": post_ids[7], "user_id": u_alex, "created_at": now},
        {"post_id": post_ids[7], "user_id": u_mike, "created_at": now},
        {"post_id": post_ids[7], "user_id": u_david, "created_at": now},
        {"post_id": post_ids[8], "user_id": u_alex, "created_at": now},
        {"post_id": post_ids[8], "user_id": u_sarah, "created_at": now},
        {"post_id": post_ids[8], "user_id": u_mike, "created_at": now},
        {"post_id": post_ids[9], "user_id": u_alex, "created_at": now},
        {"post_id": post_ids[9], "user_id": u_sarah, "created_at": now},
    ]
    await db.likes.insert_many(likes_data)

    # 5. Follows
    follows_data = [
        {"follower_id": u_alex, "following_id": u_sarah, "created_at": now},
        {"follower_id": u_alex, "following_id": u_mike, "created_at": now},
        {"follower_id": u_alex, "following_id": u_elena, "created_at": now},
        {"follower_id": u_sarah, "following_id": u_alex, "created_at": now},
        {"follower_id": u_sarah, "following_id": u_mike, "created_at": now},
        {"follower_id": u_mike, "following_id": u_alex, "created_at": now},
        {"follower_id": u_mike, "following_id": u_sarah, "created_at": now},
        {"follower_id": u_mike, "following_id": u_elena, "created_at": now},
        {"follower_id": u_mike, "following_id": u_david, "created_at": now},
        {"follower_id": u_elena, "following_id": u_alex, "created_at": now},
        {"follower_id": u_elena, "following_id": u_mike, "created_at": now},
        {"follower_id": u_david, "following_id": u_alex, "created_at": now},
    ]
    await db.follows.insert_many(follows_data)

    # 6. Bookmarks
    bookmarks_data = [
        {"user_id": u_alex, "post_id": post_ids[2], "created_at": now},
        {"user_id": u_alex, "post_id": post_ids[4], "created_at": now},
        {"user_id": u_sarah, "post_id": post_ids[0], "created_at": now},
        {"user_id": u_mike, "post_id": post_ids[6], "created_at": now},
    ]
    await db.bookmarks.insert_many(bookmarks_data)

    print("[VibeGram] Seed completed successfully:")
    print(f"  - Users: {len(users_data)}")
    print(f"  - Posts: {len(posts_data)}")
    print(f"  - Comments: {len(comments_data)}")
    print(f"  - Likes: {len(likes_data)}")
    print(f"  - Follows: {len(follows_data)}")
    print(f"  - Bookmarks: {len(bookmarks_data)}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
