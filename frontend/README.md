# VibeGram Presentation Tier (React Frontend)

This directory contains the modern React + TypeScript single-page application for **VibeGram**.

---

## 1. Architecture

The frontend follows a modular, component-driven design system with separated layers:

```
src/
├── api/          # Centralized API service functions and Axios interceptors
├── components/   # Atomic & reusable UI elements
│   ├── common/   # Buttons, Modals, Avatars, Spinners, Toasts, Inputs, ConfirmDialogs
│   ├── layout/   # Sidebar, TopNav, BottomNav, ProtectedRoute, AppLayout
│   ├── posts/    # PostCard, PostGrid, PostModal, CreatePostModal, CommentSection
│   ├── profile/  # ProfileHeader, EditProfileModal, FollowListModal
│   └── search/   # SearchBar with live debounced dropdown
├── context/      # AuthContext & ToastContext for global state
├── hooks/        # Custom hooks (useAuth, useToast, useDebounce)
├── pages/        # Route pages (Home, Explore, Profile, Login, Register, PostDetail, 404)
├── styles/       # CSS variables, design tokens, layout & responsive stylesheets
├── types/        # Comprehensive TypeScript interfaces & types
└── utils/        # Helper functions (time formatting, string sanitization)
```

---

## 2. Key Features & Visual Identity

- **Original Aesthetics**: Dark theme with rich violet, magenta, and cyan gradient accents.
- **Responsive Navigation**: Desktop sidebar, tablet compact mode, and mobile top bar + sticky bottom bar.
- **Micro-Interactions**: Optimistic heart like reactions, real-time comment thread updates, and instant search results.
- **State Management**: Zero bloated external dependencies; React Context + hooks manage auth and notifications cleanly.

---

## 3. Local Setup & Execution

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The app will run at [http://localhost:5173](http://localhost:5173).

---

## 4. Testing, Linting & Build

```bash
# Run Vitest unit & component test suite
npm run test

# Run ESLint validation
npm run lint

# Check formatting with Prettier
npm run format:check

# Format code
npm run format

# Production TypeScript compile & Vite bundle
npm run build
```
