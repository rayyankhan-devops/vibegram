# 📸 VibeGram — Production-Quality 3-Tier Social Media Platform

> **Express Your Aesthetic** — A modern, full-stack, production-grade 3-tier social media application built with React 18, FastAPI, and MongoDB.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg?style=flat&logo=mongodb)](https://www.mongodb.com)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED.svg?style=flat&logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🏛️ 1. Architecture Overview

VibeGram strictly follows a **3-Tier Monolithic Architecture**:

```text
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Tier                      │
│                                                             │
│       React 18 + TypeScript 5 + Vite + Design Tokens        │
│   (Central API client, Context state, Vitest + RTL tests)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP REST API (/api/v1/)
                               │ JSON + JWT Bearer Tokens
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Tier                       │
│                                                             │
│             Python 3.10+ + FastAPI + Pydantic v2            │
│  (Layered: Routers -> Services -> Repositories -> Security) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ AsyncIO MongoDB Driver
                               │ (Motor + PyMongo)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                          Data Tier                          │
│                                                             │
│                      MongoDB 6.0 / 7.0 / 8.0                │
│ (users, posts, comments, likes, follows, bookmarks)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 2. Technology Stack

| Tier | Technologies | Highlights |
| :--- | :--- | :--- |
| **Presentation** | React 18, TypeScript 5, Vite | React Router v6, Axios, Lucide Icons, Custom CSS Design Tokens |
| **Frontend Quality** | Vitest, React Testing Library | ESLint (0 warnings), Prettier, jsdom |
| **Application** | Python 3.10+, FastAPI, Pydantic v2 | Uvicorn ASGI, Motor (Async MongoDB), PyJWT, bcrypt |
| **Backend Quality** | Pytest, pytest-asyncio | Ruff (linter + formatter), httpx, mongomock-motor |
| **Data Tier** | MongoDB Community Server | mongosh, BSON ObjectIds, Compound Unique Indexes |
| **Containerization** | Multi-Stage Dockerfiles, Docker Compose | BusyBox HTTPD frontend, Python 3.12-slim backend, Auto-init DB |

---

## ✨ 3. Key Features

- **🔐 Authentication & Security**:
  - Salting & hashing passwords via standard `bcrypt` (12 rounds).
  - JWT tokens (`HS256`) with automatic Axios interceptor authorization header injection.
  - Strict ownership validation (users can only edit/delete their own profiles, posts, and comments).
- **📸 Posts & Feed**:
  - Clean, bounded single-column feed (`max-width: 470px`).
  - Image URL based post creation with rich caption support and fallback resilience.
  - Explore discovery gallery with responsive 3-column photo grid.
- **🔖 Bookmarks & Saved Collections**:
  - Instant bookmark/save post action with dedicated **"SAVED"** tab on profile pages.
- **❤️ Interactive Micro-Interactions**:
  - Floating double-click / double-tap heart animation on post images.
  - Heart and bookmark pulse keyframe animations.
- **⭕ Stories Carousel**:
  - Horizontal creator stories / vibe circles row with gradient rings.
- **💬 Engagement & Comments**:
  - Instant like/unlike with atomic counters and duplicate prevention.
  - Comment threads with quick emoji shortcut reactions (`❤️`, `🔥`, `✨`, `😍`, `👏`, `🙌`, `🚀`).
- **🔍 Discovery & Search**:
  - Debounced real-time creator search across usernames and display names.
  - Explore category filter pills (`✨ All`, `🎨 Design`, `📸 Photography`, `💻 Tech`, `🏔️ Travel`, `🎧 Music`).
  - Followers and following relationship modals.

---

## 🚀 4. Quick Start with Docker Compose (Recommended)

Run the entire 3-tier application stack with a single command:

```bash
docker compose up -d
```

### 🌐 Accessing the Services
* **Frontend Web App**: [http://localhost:8080](http://localhost:8080)
* **Backend Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 🔑 Demo Accounts (Password: `password123`)
* `@alex_design`
* `@sarah_codes`
* `@mike_lens`
* `@elena_wander`
* `@david_beats`

### 🛑 Stop Containers
```bash
docker compose down
```
*(To wipe database data volume and re-seed from scratch, use `docker compose down -v`)*

---

## 💻 5. Local Development Setup (Without Docker)

### Prerequisites
* **Node.js**: v18.0.0+ (v20+ recommended) & `npm`
* **Python**: 3.10+ (3.11 / 3.12 recommended) & `pip`
* **MongoDB**: Community Server (running on `mongodb://127.0.0.1:27017`)

### Step 1: Environment Configuration
```bash
cp .env.example .env
```

### Step 2: Seed Database
```bash
# Using Python async seeder:
backend/.venv/bin/python database/seed_py.py

# Or using mongosh:
mongosh mongodb://127.0.0.1:27017/vibegram_db database/schema.js
mongosh mongodb://127.0.0.1:27017/vibegram_db database/seed.js
```

### Step 3: Start Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 4: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 6. Testing & Code Quality

### Backend Test Suite (Pytest + Ruff)
```bash
cd backend
source .venv/bin/activate

# Run 27 automated unit & integration tests
pytest -v

# Run Ruff linter and formatting checks
ruff check .
ruff format --check .
```

### Frontend Test Suite (Vitest + ESLint + Prettier)
```bash
cd frontend

# Run 14 component and utility tests
npm run test

# Run ESLint & Prettier
npm run lint
npm run format:check

# Production build verification
npm run build
```

---

## 📁 7. Project Structure

```text
VibeGram/
├── .env.example              # Full 4-tier master environment template
├── .env                      # Local development environment configuration
├── .gitignore                # Git exclusions (virtualenvs, node_modules, cache)
├── docker-compose.yml        # Multi-container orchestration (DB + Backend + Frontend)
├── README.md                 # Project documentation
│
├── database/                 # Data Tier (MongoDB)
│   ├── README.md             # Schema & index documentation
│   ├── schema.js             # Validation rules & compound unique indexes
│   ├── seed.js               # mongosh & docker entrypoint seeder
│   └── seed_py.py            # Python async motor database seeder
│
├── backend/                  # Application Tier (FastAPI)
│   ├── Dockerfile            # Multi-stage production Dockerfile
│   ├── .dockerignore         # Docker context exclusions
│   ├── app/
│   │   ├── api/              # Route handlers (/auth, /users, /posts, /comments, /likes, /follows)
│   │   ├── models/           # MongoDB BSON document models
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   ├── repositories/     # Data access layer
│   │   ├── services/         # Business logic layer
│   │   ├── security/         # JWT, password hashing, route dependencies
│   │   ├── utils/            # Logging and custom exceptions
│   │   ├── config.py         # Pydantic settings management
│   │   ├── database.py       # Motor async connection & startup index verification
│   │   └── main.py           # FastAPI app factory, CORS, exception handlers, /health
│   ├── tests/                # Pytest integration & unit test suite
│   ├── pyproject.toml        # Tool configurations (Ruff, Pytest)
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # Presentation Tier (React 18 + TypeScript)
    ├── Dockerfile            # Multi-stage production Nginx Dockerfile
    ├── Dockerfile.busybox    # Ultra-lightweight BusyBox HTTPD Dockerfile
    ├── .dockerignore         # Docker context exclusions
    ├── src/
    │   ├── api/              # Central Axios client and endpoint APIs
    │   ├── components/       # Reusable components (common, layout, posts, feed, profile, search)
    │   ├── context/          # React contexts (AuthContext, ToastContext)
    │   ├── hooks/            # Custom hooks (useAuth, useToast, useDebounce)
    │   ├── pages/            # Route pages (Home, Explore, Profile, Login, Register, PostDetail)
    │   ├── styles/           # Modular CSS design system (tokens, layout, components, pages)
    │   ├── types/            # TypeScript data contracts
    │   ├── utils/            # Date and text helper utilities
    │   ├── App.tsx           # Application route configuration
    │   └── main.tsx          # React application entrypoint
    ├── tests/                # Vitest test suite
    ├── vite.config.ts        # Vite and Vitest configuration
    ├── tsconfig.json         # TypeScript compiler configuration
    └── package.json          # Node dependencies and scripts
```

---

## 📜 8. License

This project is licensed under the **MIT License**.
