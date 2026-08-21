# VibeGram — Production-Quality 3-Tier Social Media Platform

**VibeGram** is a modern, responsive, full-stack social media application engineered from scratch. Inspired by the core concepts of photo-sharing networks, it features an original visual brand identity, dark-mode design system, robust token security, and a strict **3-Tier Monolithic Architecture**.

---

## 1. 3-Tier Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Tier                      │
│                                                             │
│         React 18 + TypeScript + Vite + Modern CSS           │
│  (State: React Context, Routing: React Router, Tests: Vitest)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP REST API (/api/v1)
                               │ JSON + JWT Bearer Tokens
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Tier                       │
│                                                             │
│             Python 3.10+ + FastAPI + Pydantic v2            │
│ (Layered: Routers -> Services -> Repositories -> Security)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ AsyncIO MongoDB Driver
                               │ (Motor + PyMongo)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                          Data Tier                          │
│                                                             │
│                      MongoDB 6.0 / 7.0                      │
│   (Collections: users, posts, comments, likes, follows)     │
└─────────────────────────────────────────────────────────────┘
```

> **Design Principle**: Intentionally structured as a clean 3-tier monolithic application with zero unnecessary microservices, making it easy to understand, test, maintain, and containerize.

---

## 2. Technology Stack

| Layer | Technology | Key Libraries |
| :--- | :--- | :--- |
| **Presentation** | React 18, TypeScript 5, Vite | React Router v6, Axios, Lucide Icons, Modern CSS Design Tokens |
| **Frontend Quality** | Vitest, React Testing Library | ESLint, Prettier, jsdom |
| **Application** | Python 3.10+, FastAPI | Pydantic v2, Uvicorn, Motor (Async MongoDB), PyJWT, bcrypt |
| **Backend Quality** | Pytest, pytest-asyncio | Ruff (linter + formatter), httpx, mongomock-motor |
| **Data Tier** | MongoDB | mongosh, BSON ObjectIds, Compound Unique Indexes |

---

## 3. Core Application Features

- **Authentication & Security**:
  - Secure registration & login with salted `bcrypt` password hashing.
  - Signed JSON Web Tokens (`HS256`) with configurable expiration.
  - Strict route authorization guards (users can only edit/delete their own profiles, posts, or comments).
- **User Profiles**:
  - Username, display name, email, bio, avatar URL, follower/following metrics, and joined date.
  - Interactive profile editing and dynamic follow/unfollow capability.
- **Posts & Feed**:
  - Image URL based post creation with rich caption support.
  - Personalized home feed combining posts from followed creators and self, ordered chronologically.
  - Explore discovery gallery with responsive 3-column photo grid.
- **Engagement & Reactions**:
  - Instant like/unlike reaction with atomic database counters and duplicate reaction prevention.
  - Post comment threads with timestamps and author management.
- **Creator Discovery & Search**:
  - Debounced real-time user search across usernames and display names with live dropdown preview.
  - Detailed follower and following relationship modals.

---

## 4. Project Directory Structure

```text
VibeGram/
├── .env.example              # Master configuration template
├── .env                      # Local development environment configuration
├── .gitignore                # Git exclusions
├── README.md                 # Master project documentation
│
├── database/                 # Data Tier
│   ├── README.md             # Database documentation
│   ├── schema.js             # Collections schema & indexes for mongosh
│   ├── seed.js               # mongosh seeding script with realistic data
│   └── seed_py.py            # Python async motor seeding script
│
├── backend/                  # Application Tier (FastAPI)
│   ├── app/
│   │   ├── api/              # Thin HTTP route handlers (/auth, /users, /posts, /comments, /likes, /follows)
│   │   ├── models/           # Internal database document models
│   │   ├── schemas/          # Pydantic v2 schemas and validation models
│   │   ├── repositories/     # Database queries and collections access
│   │   ├── services/         # Business logic and domain rules
│   │   ├── security/         # Passwords, JWT, and FastAPI dependencies
│   │   ├── utils/            # Logging and exception classes
│   │   ├── config.py         # App configuration settings
│   │   ├── database.py       # Motor async client & index startup routines
│   │   └── main.py           # FastAPI app factory, CORS, exception handlers, /health
│   ├── tests/                # Pytest unit and integration test suite
│   ├── pyproject.toml        # Ruff and Pytest configuration
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # Backend documentation
│
└── frontend/                 # Presentation Tier (React + TypeScript)
    ├── src/
    │   ├── api/              # Central Axios client and endpoint services
    │   ├── components/       # UI components (common, layout, posts, profile, search)
    │   ├── context/          # React Context (AuthContext, ToastContext)
    │   ├── hooks/            # Custom hooks (useAuth, useToast, useDebounce)
    │   ├── pages/            # Route views (Home, Explore, Profile, Login, Register, PostDetail, 404)
    │   ├── styles/           # CSS design system (tokens, layout, components, pages)
    │   ├── types/            # TypeScript interfaces
    │   ├── utils/            # Date and text helper utilities
    │   ├── App.tsx           # Route definitions
    │   └── main.tsx          # React application entrypoint
    ├── tests/                # Vitest and React Testing Library tests
    ├── index.html            # Web entry HTML
    ├── vite.config.ts        # Vite and Vitest configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── .eslintrc.json        # ESLint rules
    ├── .prettierrc           # Prettier rules
    ├── package.json          # Node dependencies and scripts
    └── README.md             # Frontend documentation
```

---

## 5. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0+ (v20+ recommended) and `npm`
- **Python**: 3.10+ (3.11/3.12 recommended) and `pip`
- **MongoDB**: Community Server v6.0+ (running locally on port 27017)

---

## 6. Getting Started / Local Setup

### Step 1: Clone or Enter the Project
```bash
cd VibeGram
```

### Step 2: Configure Environment Variables
Copy the `.env.example` template to `.env`:
```bash
cp .env.example .env
```
Default configuration values:
```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=vibegram_db
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET=vibegram_dev_secret_key_change_in_production_9876543210_token_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

### Step 3: Database Setup & Seeding

Ensure MongoDB is running locally:
```bash
# Verify MongoDB connection
mongosh --eval "db.runCommand({ ping: 1 })"
```

Seed realistic development data (5 profiles, 10 aesthetic posts, comments, likes, and follows):

**Option A (Using mongosh):**
```bash
mongosh mongodb://127.0.0.1:27017/vibegram_db database/schema.js
mongosh mongodb://127.0.0.1:27017/vibegram_db database/seed.js
```

**Option B (Using Python):**
```bash
python database/seed_py.py
```

*Pre-seeded demo accounts (all passwords are `password123`):*
- `alex_design`
- `sarah_codes`
- `mike_lens`
- `elena_wander`
- `david_beats`

---

### Step 4: Backend Setup & Execution
```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now active at `http://127.0.0.1:8000`.

---

### Step 5: Frontend Setup & Execution
Open a new terminal tab:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 7. Testing, Linting & Validation

### Backend Testing & Code Quality
```bash
cd backend
source .venv/bin/activate

# 1. Run all pytest test suites
pytest -v

# 2. Run Ruff linter
ruff check .

# 3. Check code formatting
ruff format --check .
```

### Frontend Testing & Code Quality
```bash
cd frontend

# 1. Run Vitest component tests
npm run test

# 2. Run ESLint
npm run lint

# 3. Check code formatting
npm run format:check

# 4. Production build check
npm run build
```

---

## 8. Interactive API Documentation

FastAPI auto-generates comprehensive interactive OpenAPI docs:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **OpenAPI Schema**: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

---

## 9. Security & Best Practices

- **Zero Plaintext Passwords**: Hashed via standard salted `bcrypt` rounds.
- **Scoped JWT Access**: Bearer token authentication verified via FastAPI dependencies.
- **Strict Authorization**: User identity is extracted from validated tokens on the backend; request parameters cannot forge ownership.
- **Injection Protection**: Direct parameterized document queries prevent NoSQL injection.
- **Configurable CORS**: Origin filtering managed via environment variables.
- **Sensitive Data Filtering**: Passwords, hashes, and secrets are strictly filtered from logs.

---

## 10. Future Improvements

- Direct S3/GCS media bucket integration for raw asset uploads.
- WebSockets / Server-Sent Events (SSE) for real-time instant notifications.
- Activity feed caching with Redis.
- Advanced discovery algorithms and tagging taxonomy.
