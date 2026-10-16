# FulbitoGM

Monorepo for managing football matches. Includes web app, mobile app, and an MCP server for Claude.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Web:** Next.js 15 (App Router) + Tailwind CSS + Zustand
- **Mobile:** Expo (React Native)
- **Data & auth:** Firebase (Auth, Firestore, Storage)
- **MCP server:** @modelcontextprotocol/sdk over stdio

## Prerequisites

- [Node.js](https://nodejs.org/) 20.12+
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- Xcode + iOS Simulator (only for iOS mobile development)

> **Important:** This monorepo uses `pnpm workspaces`. Do not run `npm install` directly inside any sub-package — internal packages (`@fulbito/types`, `@fulbito/utils`, `@fulbito/firebase`) use the `workspace:*` protocol which only pnpm understands.

## Initial Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Each app reads the public Firebase client config from its own env file (values from Firebase console → Project settings → Your apps):

- `apps/web/.env` — `NEXT_PUBLIC_FIREBASE_*` (see `apps/web/README.md`)
- `apps/mobile/.env` — `EXPO_PUBLIC_FIREBASE_*` (copy from `apps/mobile/.env.example`)
- `apps/mcp/.env` — `FIREBASE_*` (copy from `apps/mcp/.env.example`)

## Running the project

```bash
# Web dev server (mobile and the MCP server run separately, below)
pnpm dev

# Web only (port 3000)
pnpm --filter @fulbito/web dev

# Mobile only
pnpm --filter @fulbito/mobile start

# MCP server (stdio — meant to be launched by an MCP client)
pnpm --silent --filter @fulbito/mcp start
```

## Apps

| App           | Port  | Description                                      |
| ------------- | ----- | ------------------------------------------------ |
| `apps/web`    | 3000  | Web frontend (Next.js)                           |
| `apps/mobile` | —     | Mobile app (Expo)                                |
| `apps/mcp`    | stdio | Read-only MCP server for Claude (see its README) |

See each app's README for more details.
