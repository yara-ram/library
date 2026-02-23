# Mini Library Management System
Full-stack JS mini library management system with SSO auth, roles/permissions, book CRUD, check-in/out, search, and optional AI enrichment.

## Features
- SSO authentication (Google and GitHub)
- Roles: `admin`, `librarian`, `member` (RBAC enforced on API + reflected in UI)
- Books: add/edit/delete + metadata (title, author, ISBN, genre, year, description)
- Check-out / check-in (borrow/return) with borrower tracking + due date
- Search across title/author/ISBN/genre/description
- AI enrichment (optional): suggest genre/description/tags for a book

## Tech
- Backend: Node.js + Express + PostgreSQL + Passport (OAuth) + sessions
- Frontend: React (Vite) + Tailwind
- Deployment: Render (single web service + Postgres)

## Local setup
### 1) Install
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2) Configure env
Copy `.env.example` to `.env` and fill values:
```bash
cp .env.example .env
```

Required for local login via SSO:
- `SESSION_SECRET`
- `CLIENT_URL` (default `http://localhost:5173`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and/or `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` and/or `GITHUB_CALLBACK_URL` (defaults in `.env.example` match local dev)

Optional:
- `OPENAI_API_KEY` for AI enrichment
- `ADMIN_EMAILS` (comma-separated) to auto-assign `admin` role on first SSO login
- `VITE_API_BASE_URL` (leave empty for Vite proxy in dev; keep empty in production)
- `VITE_DEV_LOGIN_ENABLED` (UI toggle for the local dev login form)

### 3) Run
```bash
npm run dev
```
- Client: `http://localhost:5173`
- API: `http://localhost:3001`

## Deployment (Render)
This repo includes `render.yaml` for a Blueprint deploy, but note: **the “database” is in-memory only** (no external persistence). On Render, data resets whenever the service restarts or redeploys.

High-level steps:
1. Create a new Render Blueprint from your GitHub repo.
2. Render provisions a web service.
3. Set env vars in the Render dashboard:
   - `SESSION_SECRET`
   - `CLIENT_URL` (your Render app URL, e.g. `https://your-app.onrender.com`)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and/or `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL` / `GITHUB_CALLBACK_URL` (match the values configured in your OAuth apps)
   - `COOKIE_SECURE=true` and `COOKIE_SAMESITE=lax`
   - (optional) `OPENAI_API_KEY`, `ADMIN_EMAILS`

## Links
- GitHub repo: (you’ll paste your repo URL after pushing)
- Live deployment: (you’ll paste your Render URL after deploying)
Note: this app uses the common convention **check-out = borrowed** and **check-in = returned/available**.
