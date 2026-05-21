# Fulbito GM — Web

Next.js 15 (App Router) frontend for managing your group: players, matches, stats, and team generation.

## Stack

- **Next.js 15** — App Router, server + client components
- **Tailwind CSS v4** — utility-first styling
- **Zustand v5** — global state (players, matches)
- **Firebase** — Auth, Firestore (data), Storage (photos)

## Getting Started

Install dependencies from the monorepo root:

```bash
pnpm install
```

Set up environment variables in `apps/web/.env`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Run the dev server:

```bash
# from monorepo root
pnpm dev

# or from apps/web directly
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

Auth is handled entirely by Firebase. Two roles exist: `USER` (read-only) and `ADMIN` (full access).

- Sign up at `/login` — new accounts get `USER` role by default.
- To promote a user to `ADMIN`, update the `role` field in the `users` Firestore collection for that user's UID.

Admin-only actions: create, edit and delete players and matches, upload player photos.

## Deployment

Deployed to Vercel. The CI pipeline (GitHub Actions) lints, builds, and deploys automatically on push to `master`.
