# VibeGram Application Tier (FastAPI Backend)

This directory contains the Python FastAPI backend service powering **VibeGram**.

---

## 1. Architecture

The backend strictly follows a layered 3-tier architecture with clean separation of concerns:

```
app/
├── api/            # Thin HTTP route handlers, request dispatching, parameter extraction
├── services/       # Core business logic, domain rules, orchestration
├── repositories/   # MongoDB database interactions & queries
├── models/         # Internal database document models
├── schemas/        # Pydantic v2 validation models and response serializers
├── security/       # JWT token lifecycle, password hashing (bcrypt), auth dependencies
├── utils/          # Exception types, logging masking, helper utilities
├── config.py       # Pydantic BaseSettings environment manager
├── database.py     # Motor async MongoDB client & index initialization
└── main.py         # FastAPI application factory, CORS, exception handlers, /health
```

---

## 2. API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register new account | No |
| `POST` | `/api/v1/auth/login` | Log in and receive JWT | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user | Yes |
| `GET` | `/api/v1/users/{username}` | Get public user profile | Optional |
| `PATCH`| `/api/v1/users/me` | Update personal profile | Yes |
| `GET` | `/api/v1/users/search?q=...` | Search users | Optional |
| `POST` | `/api/v1/posts` | Create new photo post | Yes |
| `GET` | `/api/v1/posts/{post_id}` | Get post details | Optional |
| `DELETE`| `/api/v1/posts/{post_id}` | Delete post (author only) | Yes |
| `GET` | `/api/v1/feed` | Home feed (followed creators + self) | Yes |
| `GET` | `/api/v1/explore` | Explore discovery feed | Optional |
| `GET` | `/api/v1/posts/user/{username}`| Fetch posts by specific user | Optional |
| `POST` | `/api/v1/posts/{post_id}/comments` | Add comment to post | Yes |
| `GET` | `/api/v1/posts/{post_id}/comments` | Get comments on post | Optional |
| `DELETE`| `/api/v1/comments/{comment_id}` | Delete comment (owner/author) | Yes |
| `POST` | `/api/v1/posts/{post_id}/like` | Like a post | Yes |
| `DELETE`| `/api/v1/posts/{post_id}/like` | Unlike a post | Yes |
| `POST` | `/api/v1/users/{user_id}/follow` | Follow a user | Yes |
| `DELETE`| `/api/v1/users/{user_id}/follow` | Unfollow a user | Yes |
| `GET` | `/api/v1/users/{user_id}/followers` | List user's followers | Optional |
| `GET` | `/api/v1/users/{user_id}/following` | List users followed | Optional |
| `GET` | `/health` | Health check & MongoDB status | No |

---

## 3. Local Setup & Execution

### 1. Virtual Environment & Dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Running the Development Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation will be available at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **OpenAPI JSON**: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## 4. Testing & Code Quality

```bash
# Run pytest test suite
pytest -v

# Run linting with Ruff
ruff check .

# Check formatting with Ruff
ruff format --check .
```
