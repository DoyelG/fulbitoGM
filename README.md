# FulbitoGM

Monorepo for managing football matches. Includes backend (API + admin), web, and mobile app.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Backend:** Next.js 15 + Prisma + PostgreSQL
- **Web:** Next.js 15
- **Mobile:** Expo (React Native)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [Docker](https://www.docker.com/) (for the database)
- Xcode + iOS Simulator (only for iOS mobile development)

> **Important:** This monorepo uses `pnpm workspaces`. Do not run `npm install` directly inside any sub-package — internal packages (`@fulbito/types`, `@fulbito/utils`) use the `workspace:*` protocol which only pnpm understands.

## Initial Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the database

```bash
cd apps/web
docker compose up -d
cd ../..
```

This starts a PostgreSQL instance on port `5432` with user `fulbito`, password `fulbito`, and database `fulbito`.

> If you already have a PostgreSQL instance running on `:5432`, create the database manually:
> ```bash
> psql -U <superuser> -c "CREATE USER fulbito WITH PASSWORD 'fulbito';"
> psql -U <superuser> -c "CREATE DATABASE fulbito OWNER fulbito;"
> ```

### 3. Configure environment variables

Create `apps/backend/.env`:

```bash
echo 'DATABASE_URL="postgresql://fulbito:fulbito@localhost:5432/fulbito"' > apps/backend/.env
echo 'NEXTAUTH_SECRET="fulbito-secret-local"' >> apps/backend/.env
```

Create `apps/web/.env`:

```bash
echo 'NEXTAUTH_SECRET="fulbito-secret-local"' > apps/web/.env
echo 'NEXTAUTH_URL="http://localhost:3000"' >> apps/web/.env
```

> **Important:** Both apps must share the same `NEXTAUTH_SECRET`, otherwise session JWTs created by one app cannot be decrypted by the other.

### 4. Run migrations

```bash
cd apps/backend
pnpm prisma migrate deploy
cd ../..
```

### 5. (Optional) Seed sample data

```bash
cd apps/backend
pnpm prisma db seed
cd ../..
```

## Running the project

```bash
# All apps together
pnpm dev

# Backend only (port 3001)
pnpm --filter backend dev

# Web only (port 3000)
pnpm --filter web dev

# Mobile only
pnpm --filter mobile start
```

## Apps

| App | Port | Description |
|-----|------|-------------|
| `apps/backend` | 3001 | REST API + admin panel (Next.js) |
| `apps/web` | 3000 | Web frontend (Next.js) |
| `apps/mobile` | — | Mobile app (Expo) |

See each app's README for more details.
