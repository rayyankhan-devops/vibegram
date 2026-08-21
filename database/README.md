# VibeGram Database Tier (MongoDB)

This directory contains the database schema documentation, index definitions, and database seeding scripts for **VibeGram**.

---

## 1. Architecture & Design

VibeGram uses **MongoDB** as its primary document datastore. The schema is designed specifically for high-performance social networking queries:

- **Users (`users`)**: Core profile information, hashed credentials, and atomic follower/following counters.
- **Posts (`posts`)**: Image URLs, author references, captions, and aggregated reaction/comment counters.
- **Comments (`comments`)**: Multi-level user commentary referencing post and author ObjectIds.
- **Likes (`likes`)**: Compound-indexed records enforcing a strict 1-like-per-user-per-post constraint.
- **Follows (`follows`)**: Directional relationship collection enforcing unique `(follower_id, following_id)` edges and preventing self-follow.

---

## 2. Collections & Schema Definition

| Collection | Key Fields | Indexes | Description |
| :--- | :--- | :--- | :--- |
| `users` | `_id`, `username`, `email`, `password_hash`, `display_name`, `bio`, `avatar_url`, `followers_count`, `following_count`, `posts_count`, `created_at` | `{username: 1}` (Unique)<br>`{email: 1}` (Unique)<br>`{display_name: 'text', username: 'text'}` | User profile documents |
| `posts` | `_id`, `author_id`, `image_url`, `caption`, `likes_count`, `comments_count`, `created_at` | `{author_id: 1, created_at: -1}`<br>`{created_at: -1}` | User photo posts & feeds |
| `comments` | `_id`, `post_id`, `author_id`, `content`, `created_at` | `{post_id: 1, created_at: 1}`<br>`{author_id: 1}` | Post discussion threads |
| `likes` | `_id`, `post_id`, `user_id`, `created_at` | `{post_id: 1, user_id: 1}` (Unique)<br>`{user_id: 1}` | Like reactions |
| `follows` | `_id`, `follower_id`, `following_id`, `created_at` | `{follower_id: 1, following_id: 1}` (Unique)<br>`{following_id: 1}` | Follower graph edges |

---

## 3. Applying Schema and Seeding Data

### Option A: Using `mongosh`
```bash
# 1. Apply schema and create indexes
mongosh mongodb://127.0.0.1:27017/vibegram_db database/schema.js

# 2. Seed development records
mongosh mongodb://127.0.0.1:27017/vibegram_db database/seed.js
```

### Option B: Using Python Seeder
```bash
# Run python seed script (requires python environment with motor/pymongo/bcrypt)
python database/seed_py.py
```

---

## 4. Default Seed Accounts

All default test accounts share the password: `password123`

| Username | Display Name | Email | Bio / Theme |
| :--- | :--- | :--- | :--- |
| `alex_design` | Alex Rivera | `alex@vibegram.app` | UI & Product Design |
| `sarah_codes` | Sarah Chen | `sarah@vibegram.app` | Full-stack & Open Source |
| `mike_lens` | Mike Lens | `mike@vibegram.app` | Urban Street Photography |
| `elena_wander` | Elena Rostova | `elena@vibegram.app` | Mountain Peaks & Travel |
| `david_beats` | David Kim | `david@vibegram.app` | Synthesizers & Lo-Fi Beats |
