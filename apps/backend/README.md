# FulbitoGM — Backend

REST API and admin panel. Next.js 15 + Prisma + PostgreSQL.

Runs on port **3001**.

## Setup

See the [root README](../../README.md) for the full monorepo setup (database, environment variables, migrations).

### Environment variables

Create `apps/backend/.env`:

```env
DATABASE_URL="postgresql://fulbito:fulbito@localhost:5432/fulbito"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="a-long-random-secret"
```

### Migrations

```bash
pnpm prisma migrate deploy
```

> **Troubleshooting:** If you get `permission denied to create database` when running `migrate dev`, it means the DB user can't create the shadow database. Use `db push` instead to sync the schema without needing that permission:
> ```bash
> pnpm prisma db push
> ```

### Seed (sample data)

```bash
pnpm prisma db seed
```

### Prisma Studio (browse the DB)

```bash
pnpm prisma studio
```

## Roles

| Role | Permissions |
|------|-------------|
| `USER` | Read-only |
| `ADMIN` | Create, edit and delete players and matches, upload images |

The first user is created at `/login` (Register tab) with the `USER` role. To promote to `ADMIN`, use Prisma Studio or run:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE username = 'your_username';
```

## Run

```bash
pnpm dev
```
