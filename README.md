# Mini Library Management System (React + Node)

This is a mini Library Management System challenge implementation:

- Book management (add/edit/delete)
- Check-in / check-out (borrow/return)
- Search (title/author/ISBN/publisher/tags)
- Auth with SSO (GitHub + Google OAuth) + roles (ADMIN / STAFF / MEMBER)
- AI features (optional): metadata suggestions + “library assistant” (OpenAI if configured, with fallback)

## Tech

- Frontend: React (Vite) + TypeScript
- Backend: Node.js (Express) + TypeScript
- DB: Postgres + Prisma
- Auth: OAuth (Passport) + JWT cookie sessions

## Local setup

1) Create env file

```bash
cp .env.example .env
```

2) Set `DATABASE_URL` in `.env`

Use any Postgres instance (local Docker, Render Postgres external URL, etc.). Example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

3) Install dependencies

```bash
npm install
```

4) Set up database (migrate + seed)

```bash
npm -w server run prisma:generate
npm -w server run prisma:migrate
npm -w server run db:seed
```

5) Run the app (API + client)

```bash
npm run dev
```

- API: `http://localhost:3001/health`
- Client: `http://localhost:5173`

## Sign-in

### SSO (preferred)

Create OAuth apps and set these in `.env`:

- GitHub: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - Callback URL: `http://localhost:3001/auth/github/callback`
- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Callback URL: `http://localhost:3001/auth/google/callback`

### Dev login (local only)

If you don’t want to set up OAuth for local testing, the app includes a **dev login** endpoint that is **disabled in production**.

Seeded users:

- `admin@demo.local` (ADMIN)
- `staff@demo.local` (STAFF)
- `member@demo.local` (MEMBER)

## Roles & permissions

- MEMBER: search + check in/out books (self-service)
- STAFF: MEMBER permissions + AI cataloging tools
- ADMIN: full access (CRUD books + manage user roles)

## AI features (optional)

Set in `.env`:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4o-mini`)

If not set, the app uses a safe fallback (non-LLM) for both endpoints.

## Deployment (one simple approach)

### Render (recommended)

This repo includes a Render Blueprint at `/Users/yararammal/Desktop/work/library/render.yaml`.

1) Push this repo to GitHub.
2) In Render: **New > Blueprint** and select your repo.
3) During setup, set the `sync: false` variables (OAuth + OpenAI keys).

The Blueprint auto-wires `CLIENT_URL` and `VITE_API_BASE_URL` using Render’s `RENDER_EXTERNAL_HOSTNAME`.

OAuth callback URLs (use your actual API domain if you rename the service):

- GitHub: `https://mlms-api.onrender.com/auth/github/callback`
- Google: `https://mlms-api.onrender.com/auth/google/callback`

Notes:
- Free Render Postgres expires after ~30 days unless you upgrade.
- Free web services can’t use persistent disks (so Postgres is the simplest option).

### Backend (other hosts)

- Set `CLIENT_URL` to your deployed frontend URL
- Set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none` if frontend and backend are on different domains
- Use Postgres for a real production setup

### Frontend (Vercel / Netlify)

- Set `VITE_API_BASE_URL` to your deployed backend base URL

## Links (fill in after you deploy)

- GitHub repo: `<YOUR_GITHUB_REPO_URL>`
- Live app: `<YOUR_LIVE_URL>`
