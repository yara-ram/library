# Mini Library Management System

A mini library management system (Next.js + Prisma + NextAuth SSO) with:

- **Book management**: add/edit/delete + archive/restore
- **Check-out / Check-in**: borrow/return books (with simple due dates + overdue display)
- **Search**: title, author, ISBN, tags
- **Auth + SSO**: GitHub and/or Google OAuth
- **Roles/permissions**: `ADMIN`, `LIBRARIAN`, `MEMBER`
- **AI feature**: “AI suggestions” for tags + summary (uses OpenAI if configured, otherwise a local fallback)

## Tech stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + SQLite
- NextAuth (SSO via OAuth providers)

## Local setup

1) Install dependencies

```bash
npm install
```

2) Create env file

```bash
cp .env.example .env
```

3) Configure SSO (recommended)

- For GitHub OAuth: set `GITHUB_ID` / `GITHUB_SECRET`
- For Google OAuth: set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- Ensure your OAuth callback URL includes:
  - `http://localhost:3000/api/auth/callback/github`
  - `http://localhost:3000/api/auth/callback/google`

4) Create DB + run migrations + seed

```bash
npx prisma migrate dev
npm run db:seed
```

5) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

### Roles

- The **first user who signs in** is automatically promoted to `ADMIN`.
- `ADMIN` can manage books + users.
- `LIBRARIAN` can manage books.
- `MEMBER` can borrow books and return **their own** loans.

## Deployment (Render + persistent disk)

This repo includes `render.yaml` + `Dockerfile` for a one-click-ish deployment.

1) Push this project to GitHub.
2) In Render, create a **Blueprint** from the repo.
3) Set environment variables in Render:
   - `NEXTAUTH_URL` to your Render URL (e.g. `https://your-app.onrender.com`)
   - `NEXTAUTH_SECRET` to a long random string
   - OAuth provider secrets (`GITHUB_*` and/or `GOOGLE_*`)
4) Update your OAuth provider callback URLs to match:
   - `https://your-app.onrender.com/api/auth/callback/github`
   - `https://your-app.onrender.com/api/auth/callback/google`

Optional AI:
- Set `OPENAI_API_KEY` to enable AI metadata suggestions.

## Notes

- Terminology: this app uses the standard convention **Check out = borrow**, **Check in = return**.

