/**
 * VibeGram MongoDB Schema & Index Definitions
 *
 * Use this file with `mongosh` to initialize collections, validation rules, and indexes.
 * Example: mongosh mongodb://127.0.0.1:27017/vibegram_db schema.js
 */

// 1. Users Collection
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password_hash", "display_name", "created_at"],
      properties: {
        username: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9_]{3,30}$",
          description: "Must be alphanumeric + underscores, 3-30 characters"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "Must be a valid email address"
        },
        password_hash: {
          bsonType: "string",
          description: "Bcrypt salted password hash"
        },
        display_name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50
        },
        bio: {
          bsonType: "string",
          maxLength: 150
        },
        avatar_url: {
          bsonType: "string"
        },
        followers_count: {
          bsonType: "int",
          minimum: 0
        },
        following_count: {
          bsonType: "int",
          minimum: 0
        },
        posts_count: {
          bsonType: "int",
          minimum: 0
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.users.createIndex({ username: 1 }, { unique: true, name: "idx_users_username_unique" });
db.users.createIndex({ email: 1 }, { unique: true, name: "idx_users_email_unique" });
db.users.createIndex({ display_name: "text", username: "text" }, { name: "idx_users_text" });

// 2. Posts Collection
db.createCollection("posts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["author_id", "image_url", "created_at"],
      properties: {
        author_id: {
          bsonType: "objectId",
          description: "Reference to user _id"
        },
        image_url: {
          bsonType: "string",
          description: "Public URL of the photo"
        },
        caption: {
          bsonType: "string",
          maxLength: 2200
        },
        likes_count: {
          bsonType: "int",
          minimum: 0
        },
        comments_count: {
          bsonType: "int",
          minimum: 0
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.posts.createIndex({ author_id: 1, created_at: -1 }, { name: "idx_posts_author_created" });
db.posts.createIndex({ created_at: -1 }, { name: "idx_posts_created_desc" });

// 3. Comments Collection
db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["post_id", "author_id", "content", "created_at"],
      properties: {
        post_id: {
          bsonType: "objectId"
        },
        author_id: {
          bsonType: "objectId"
        },
        content: {
          bsonType: "string",
          minLength: 1,
          maxLength: 500
        },
        created_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.comments.createIndex({ post_id: 1, created_at: 1 }, { name: "idx_comments_post_created" });
db.comments.createIndex({ author_id: 1 }, { name: "idx_comments_author" });

// 4. Likes Collection (Compound unique constraint prevents duplicate reactions)
db.createCollection("likes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["post_id", "user_id", "created_at"],
      properties: {
        post_id: {
          bsonType: "objectId"
        },
        user_id: {
          bsonType: "objectId"
        },
        created_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.likes.createIndex({ post_id: 1, user_id: 1 }, { unique: true, name: "idx_likes_post_user_unique" });
db.likes.createIndex({ user_id: 1 }, { name: "idx_likes_user" });

// 5. Follows Collection (Compound unique constraint prevents duplicate follow relations)
db.createCollection("follows", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["follower_id", "following_id", "created_at"],
      properties: {
        follower_id: {
          bsonType: "objectId"
        },
        following_id: {
          bsonType: "objectId"
        },
        created_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.follows.createIndex({ follower_id: 1, following_id: 1 }, { unique: true, name: "idx_follows_pair_unique" });
db.follows.createIndex({ following_id: 1 }, { name: "idx_follows_following" });

// 6. Bookmarks Collection (Compound unique constraint prevents duplicate bookmarks)
db.createCollection("bookmarks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "post_id", "created_at"],
      properties: {
        user_id: {
          bsonType: "objectId"
        },
        post_id: {
          bsonType: "objectId"
        },
        created_at: {
          bsonType: "date"
        }
      }
    }
  }
});

db.bookmarks.createIndex({ user_id: 1, post_id: 1 }, { unique: true, name: "idx_bookmarks_user_post_unique" });
db.bookmarks.createIndex({ user_id: 1, created_at: -1 }, { name: "idx_bookmarks_user_created" });

print("VibeGram collections and indexes initialized successfully.");
