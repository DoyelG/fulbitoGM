# Claude Code Instructions — Fulbito GM

## Branching
Always work directly on the current branch. **Never under any circumstance create worktree branches, shadow branches, or any other branch** — not even temporarily. Apply all changes directly to the branch the user is on.
If the user is on `master`, recommend creating a new feature branch before making changes, but do not create it automatically.

---

## Monorepo Structure

```
apps/
  web/       → Next.js (App Router) — Tailwind CSS, Zustand, NextAuth
  mobile/    → Expo + React Native — Expo Router, StyleSheet API
  backend/   → Next.js (API only) — Prisma + PostgreSQL (Neon)
packages/
  types/     → Shared domain types (Player, Match, Team, Skills)
  utils/     → Shared business logic (teamUtils, playerStats, shirtDuty)
```

Package manager: **pnpm**. Always use `pnpm` — never `npm` or `yarn`.
Run tasks with `turbo` from the root, or per-app scripts from within each app.

---

## Code Conventions (all apps)

- **TypeScript strict mode** everywhere — never use `any`, prefer `unknown` if type is truly unknown
- **File naming**: kebab-case for hooks and utilities (`use-auth.ts`, `player-stats.ts`), PascalCase for components (`PlayerCard.tsx`)
- **Exports**: default exports for components/screens, named exports for types and utilities
- **Imports**: use path aliases (`@/` for web/backend, `@/*` for mobile, `@fulbito/types`, `@fulbito/utils`)
- **No unused imports** — remove them immediately
- **No `console.log`** in committed code — use proper error handling instead
- **Prettier** is the source of truth for formatting: `singleQuote`, no `semi`, `trailingComma: all`, `printWidth: 120`, `tabWidth: 2`

---

## Web App (`apps/web`)

### Stack
- Next.js 15 App Router — use server components by default, add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Tailwind CSS v4 — utility classes only, no inline `style=` props unless dynamic values require it
- Zustand v5 for global state (`src/store/`)
- NextAuth v4 for authentication

### Component rules
- Keep components small and focused — extract when a component exceeds ~100 lines
- Co-locate component types in the same file, export them as named types
- Use `@heroicons/react` or `react-icons` for icons — don't add SVGs inline unless absolutely necessary
- Always add `"use client"` when using `useState`, `useEffect`, event handlers, or browser APIs

### Styling
- Use Tailwind utility classes — follow existing patterns in the codebase
- Use CSS custom properties for brand colors: `var(--color-brand)` (#7c3aed), `var(--color-accent)` (#f97316)
- Never hardcode color hex values directly in components — use the design tokens

### Data fetching
- Server components fetch directly (no `useEffect` + `fetch`)
- Client components use Zustand store actions for mutations and reads
- Backend URL via `process.env.NEXT_PUBLIC_API_URL` — never hardcode URLs

### Accessibility (web)
- All interactive elements must be keyboard-navigable (`button`, `a`, or explicit `tabIndex`)
- Use semantic HTML: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>` for layout
- Every image needs an `alt` attribute — empty string `alt=""` for decorative images
- Form inputs must have associated `<label>` elements (via `htmlFor` + `id`) or `aria-label`
- Use `aria-label`, `aria-describedby`, `aria-live` when semantic HTML is not enough
- Color contrast must meet WCAG AA (4.5:1 for text, 3:1 for UI components)
- Focus styles must be visible — never `outline: none` without a custom focus style
- Loading states must communicate status to screen readers (use `aria-busy`, `aria-live="polite"`)
- Error messages must be associated with their input via `aria-describedby`

---

## Mobile App (`apps/mobile`)

### Stack
- Expo 54 + React Native 0.81 — Expo Router for file-based navigation
- `StyleSheet.create()` for all styles — **always in a separate `*.styles.ts` file**, never inline in the view file
- Custom theme system via `constants/theme.ts` and `useAppTheme()` hook
- `react-native-reanimated` v4 for animations

### Component & screen rules
- Screens live in `app/` (Expo Router convention), reusable components in `components/`
- Every screen must be wrapped in `<SafeAreaView>` from `react-native-safe-area-context`
- Use `<KeyboardAvoidingView>` on forms with `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`
- Use `Platform.select()` or `Platform.OS` for platform-specific values — never hardcode iOS-only or Android-only values without a fallback

### Styles
- **Always separate styles from views**: create a `ComponentName.styles.ts` file next to the component
- Use `constants/theme.ts` tokens (Colors, Radii, Spacing, Shadows, Fonts) — never hardcode colors, spacing, or border radius values
- Access theme via `useAppTheme()` hook for dynamic light/dark values
- Use `StyleSheet.create()` — never pass plain objects as styles

### Accessibility (mobile)
- Every touchable element needs `accessibilityLabel` describing its action
- Use `accessibilityRole` on interactive elements: `button`, `link`, `image`, `text`, `header`
- Use `accessibilityHint` when the action result is not obvious from the label
- `accessibilityState` for stateful elements: `{ disabled, selected, checked, busy }`
- Minimum touch target size: 44×44 points (Apple HIG) — enforce with `minWidth`/`minHeight`
- Images need `accessible={true}` and `accessibilityLabel` unless decorative (`accessible={false}`)
- Loading states: use `accessibilityLiveRegion="polite"` on containers that update dynamically
- Never rely on color alone to convey information

---

## Backend (`apps/backend`)

### Stack
- Next.js 15 Route Handlers — REST API only, no frontend pages
- Prisma v6 + PostgreSQL (Neon)
- NextAuth v4 (Credentials provider)
- bcryptjs for password hashing

### API rules
- Always validate request body shape before using it — never trust `req.json()` blindly
- Use `requireAdmin()` middleware for admin-only routes
- Return consistent JSON error shapes: `{ error: string }`
- HTTP status codes matter: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error
- All route handlers must include `runtime: 'nodejs'` directive
- Never expose password hashes or internal Prisma errors to the client

### Database
- All DB access goes through Prisma — never raw SQL unless Prisma cannot handle the query
- Use Prisma migrations for schema changes — never edit the DB directly
- Sensitive fields (passwords) must be excluded from SELECT via `select` or `omit` in Prisma queries

---

## Shared Packages

- **`@fulbito/types`**: domain types only — no logic, no side effects
- **`@fulbito/utils`**: pure functions only — no framework imports, must work in any context (web, mobile, backend)
- When adding a type used in more than one app, add it to `packages/types`
- When adding a utility used in more than one app, add it to `packages/utils`

---

## Security

- Never commit secrets, API keys, or `.env` files
- Passwords must always be hashed with bcryptjs before storing
- JWT secrets must come from environment variables
- Sanitize and validate all user input on the backend before DB operations
- No `dangerouslySetInnerHTML` in React unless content is explicitly sanitized

---

## What NOT to do

- Don't add `// eslint-disable` comments — fix the underlying issue
- Don't use `@ts-ignore` or `@ts-expect-error` — fix the types
- Don't create new files without checking if the logic already exists in `packages/utils`
- Don't add new dependencies without checking if the functionality is already available in the existing stack
- Don't write comments that explain WHAT the code does — only WHY if it's non-obvious
