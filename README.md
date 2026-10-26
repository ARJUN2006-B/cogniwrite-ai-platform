# CogniWrite — AI-Powered Publishing & Knowledge Platform

CogniWrite is a production-style, full-stack blogging and engineering knowledge-sharing platform built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**. It features a modular, pluggable server-side **AI Provider Abstraction** enabling intelligent drafting, summarization, grounded article Q&A, and technical taxonomy generation both offline (zero external dependencies) and through cloud LLMs (OpenAI, Google Gemini).

---

## 1. Product Capabilities

### A. Authentication & User Profiles
- Secure registration, login, logout, and token session restoration (`JWT` + `bcryptjs`).
- Protected routes with server-side authorization enforcement.
- Users cannot grant themselves administrator privileges.
- Public author profile page with follower/following counts, bio, and published essays.
- Author follow/unfollow capability with database persistence.

### B. Blog & Content Management
- Comprehensive article CRUD (Create, Read, Update, Delete) with MongoDB persistence.
- Drafts vs. Published states (`status: 'draft' | 'published'`).
- Taxonomy: category classification (`Architecture`, `Systems`, `AI & ML`, `Backend`, `Frontend`, `Database`, `DevOps`, `General`) and multi-tagging.
- Real-time word count and reading-time estimation algorithm.
- Live markdown preview toggle.
- Strict server-side ownership authorization: only the original author (or staff admin) can modify or delete articles.

### C. Social & Interactive Features
- **Comments**: Full MongoDB-backed comments CRUD; comment authors can delete their own remarks.
- **Likes**: Atomic `$addToSet` and `$pull` like/unlike toggle ensuring no duplicate likes per user.
- **Bookmarks**: User reading list stored and synchronized across database and browser sessions.

### D. Discovery & Search
- Homepage feed featuring latest peer-reviewed engineering essays and interactive AI demo.
- Explore page with multi-field search across title, content, tags, and category filters.
- Real sorting: newest, popular (most liked), shortest read time.
- Related articles recommendation engine grouped by category and shared tags.

### E. Author Workspace & Admin Dashboard
- **Author Dashboard**: Real database metrics aggregated across user articles: Total Essays, Published Essays, Drafts, Actual Views, Real Likes, and Comments. Never displays fabricated or simulated numbers.
- **Admin & Telemetry**: Platform-wide metrics, system uptime, memory telemetry, MongoDB connection status, and user directory snapshot.

### F. Server-Side AI Capabilities (7 Integrated Features)
All AI requests run securely through the backend. Never exposes API keys on the client:
1. **AI Writing Assistant**: Grammar polish, simplification, expansion, condensing, and introduction/conclusion generation with configurable tone (`professional`, `academic`, `conversational`, `concise`). Preserves writer's original text until user clicks "Apply".
2. **AI Title & Metadata Generator**: Synthesizes 3 alternative titles, teaser excerpt, categories, and tags with one-click adoption.
3. **AI Executive Summary & TL;DR**: Generates concise executive summaries and core technical takeaways.
4. **AI Writing & Prose Analysis**: Evaluates readability score, structural cohesion, and repetition issues, labeled with a prominent estimate disclaimer.
5. **Grounded Article Chat (Q&A)**: Reader assistant strictly grounded in the article's text that admits when the article does not contain enough information.
6. **AI Article Ideas & Structured Outlines**: Converts a topic and target audience into an actionable markdown outline.
7. **Natural-Language AI Search Assist**: Translates conversational queries into precise search keywords and category recommendations.

---

## 2. Architecture & File Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Environment validation, MongoDB lifecycle, CORS
│   │   ├── controllers/     # Health, Auth, Articles, and AI route handlers
│   │   ├── middleware/      # Error handler, 404 handler, JWT auth, validation, rateLimiter
│   │   ├── models/          # User (with followers/bookmarks), Article, Comment
│   │   ├── routes/          # Express routers (/api/auth, /api/articles, /api/ai, /api/health)
│   │   ├── services/        # Business logic layer and AI Provider Abstraction
│   │   │   └── ai/          # Abstract AIProvider, MockProvider, OpenAI, Gemini factory
│   │   ├── utils/           # ApiResponse formatters, ApiError, logger, seed script
│   │   └── validators/      # Payload validation schemas
│   ├── tests/               # Automated unit, integration, and security test suites
│   ├── app.js               # Express app configuration & middleware pipeline
│   ├── server.js            # HTTP bootstrap and graceful termination hooks
│   ├── .env.example         # Documented backend environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common cards, live status badges, navbar, dialogs
│   │   │   ├── common/      # ArticleCard, StatusBadge
│   │   │   ├── domain/      # AuthorCard
│   │   │   ├── layout/      # Navbar, Footer
│   │   │   └── ui/          # Button, Input, Card, Badge, Dialog, ConfirmDialog, Tooltip, Avatar, SearchBar
│   │   ├── context/         # AuthContext, ThemeContext, ToastContext, BookmarkContext
│   │   ├── hooks/           # useAuth, useTheme
│   │   ├── layouts/         # RootLayout application shell
│   │   ├── pages/           # Home, Explore, ArticleDetail, Write, Edit, Dashboard, Bookmarks, Profile, Admin, Login, Register
│   │   ├── services/        # Axios clients (api, authService, articleService, aiService, healthService)
│   │   └── utils/           # Date formatters, constants
│   ├── index.html           # Google Fonts (Inter & Outfit) and metadata
│   ├── tailwind.config.js   # Tailored editorial tokens and prose styling
│   ├── vite.config.js       # Vite dev server with proxy to backend
│   ├── .env.example         # Documented frontend environment template
│   └── package.json
│
├── package.json             # Root orchestrator scripts (concurrent dev, install, build, test)
└── README.md
```

---

## 3. Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3.4, React Router 6, Axios, Lucide Icons |
| **Backend** | Node.js (v20+), Express 4, Mongoose 8 |
| **Database** | MongoDB (with connection pooling, indexes, and cascade deletion) |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs password hashing, strict CORS, rate limiting |
| **AI Layer** | Modular server-side abstraction layer supporting `mock` (local heuristic engine), `openai`, and `gemini` |

---

## 4. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ / v22 recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on port `27017` (`mongodb://127.0.0.1:27017/cogniwrite`) or MongoDB Atlas URI

---

## 5. Environment Configuration

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/cogniwrite

# Security & CORS (comma-separated allowed origins)
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
JWT_SECRET=replace_with_a_secure_jwt_secret_in_production
JWT_EXPIRES_IN=7d

# AI Service Configuration
# Set to "mock" for zero-dependency offline local development!
# Or set to "openai" or "gemini" and provide the corresponding API key.
AI_PROVIDER=mock
OPENAI_API_KEY=
GEMINI_API_KEY=
```

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
# API base endpoint (uses Vite proxy /api or direct http://localhost:5000/api)
VITE_API_URL=/api
```

---

## 6. Installation & Startup Commands

### Step 1: Install Dependencies
Install all root, backend, and frontend dependencies:

```bash
npm run install:all
```

### Step 2: Seed Demo Database
Populate test authors (`developer@cogniwrite.dev` and `marcus@cogniwrite.dev`), categorized essays, comments, and followers:

```bash
npm run seed
```

### Step 3: Run Development Servers
Start both backend (port 5000) and frontend (port 5173) concurrently:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 7. Pre-Configured Demo Credentials

The seed script creates two verified author accounts for testing authorization and social interactions:

| Account | Email | Password | Role |
|---|---|---|---|
| **Primary Author** | `developer@cogniwrite.dev` | `secret123` | Author |
| **Secondary Author** | `marcus@cogniwrite.dev` | `secret123` | Author |

*(A convenient one-click "Fill Demo Credentials" button is available on the `/login` page).*

---

## 8. Automated Testing

### Backend & API Security Test Suite
Runs 31 automated tests verifying registration, login, token authentication, ownership authorization (User 2 cannot edit User 1's article), comments CRUD, like deduplication, bookmarks persistence, dashboard metrics aggregation, and all 7 AI endpoints:

```bash
npm test
```
*(or inside `backend/`: `npm test`)*

### Production Frontend Build Verification
Verifies that the React + Vite frontend bundles with zero errors:

```bash
npm run build
```
*(or inside `frontend/`: `npm run build`)*

---

## 9. API Contract Reference

### Authentication & Profiles (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `PUT` | `/api/auth/profile` | Update display name, bio, or avatar | Yes (Bearer) |
| `GET` | `/api/auth/users/:id` | Get public author profile & follower stats | Optional |
| `POST` | `/api/auth/users/:id/follow` | Toggle follow/unfollow author | Yes (Bearer) |
| `GET` | `/api/auth/bookmarks` | Fetch user's persistent bookmarks | Yes (Bearer) |
| `POST` | `/api/auth/bookmarks/:id` | Toggle article bookmark | Yes (Bearer) |

### Articles & Interactions (`/api/articles`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/articles` | List articles with search, category, tag, and sort | Optional |
| `GET` | `/api/articles/:idOrSlug` | Get article details & increment view count | Optional |
| `GET` | `/api/articles/:idOrSlug/related` | Get related articles in same category | No |
| `POST` | `/api/articles` | Create article (draft or published) | Yes (Bearer) |
| `PUT` | `/api/articles/:id` | Update article (author/admin only) | Yes (Bearer) |
| `DELETE` | `/api/articles/:id` | Delete article & cascade comments (author/admin) | Yes (Bearer) |
| `POST` | `/api/articles/:id/like` | Toggle article like (no duplicates) | Yes (Bearer) |
| `GET` | `/api/articles/:id/comments` | List comments for an article | No |
| `POST` | `/api/articles/:id/comments` | Add comment to article | Yes (Bearer) |
| `DELETE` | `/api/articles/comments/:commentId` | Delete comment (comment author/admin) | Yes (Bearer) |
| `GET` | `/api/articles/dashboard/metrics` | Real author aggregated metrics & articles | Yes (Bearer) |
| `GET` | `/api/articles/admin/metrics` | Real platform-wide metrics & telemetry | Yes (Bearer) |

### AI Service Endpoints (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/improve` | Rewrite, simplify, or polish text with tone | Optional |
| `POST` | `/api/ai/titles-metadata` | Generate alternative titles, excerpt, tags | Optional |
| `POST` | `/api/ai/summarize` | Executive summary & core takeaways | Optional |
| `POST` | `/api/ai/analyze` | Writing structure & readability analysis | Optional |
| `POST` | `/api/ai/chat` | Grounded article Q&A reader assistant | Optional |
| `POST` | `/api/ai/ideas-outlines` | Generate ideas and structured outline | Optional |
| `POST` | `/api/ai/search-assist` | Natural-language query keyword assist | Optional |

---

## 10. Deployment Guide

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow your server IP (or `0.0.0.0/0`).
3. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/cogniwrite?retryWrites=true&w=majority`.

### Backend Deployment (Render / Railway / Fly.io)
1. Set the root directory to `backend/`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000` (or provider's `$PORT`)
   - `MONGO_URI=<your-atlas-uri>`
   - `CORS_ORIGIN=https://your-frontend.vercel.app`
   - `JWT_SECRET=<strong-random-secret>`
   - `AI_PROVIDER=mock` (or `openai` / `gemini` with corresponding API key)

### Frontend Deployment (Vercel / Netlify)
1. Set the root directory to `frontend/`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Configure Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api`

---

## 11. License

MIT License. Designed and built as a production-grade full-stack portfolio application.
