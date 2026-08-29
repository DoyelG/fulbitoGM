# Web Annual Awards Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the mobile "Premios del Año" (annual awards) feature to a new `/awards` route in `apps/web`, sharing the stat-aggregation and award-picking logic with mobile via `packages/utils` instead of duplicating it.

**Architecture:** Move the pure calculation (per-player stat aggregation, award-winner tie-break picking) that today lives only inside two mobile React hooks into a new framework-free module in `packages/utils`. Refactor the two existing mobile hooks to thin wrappers around it (no behavior change — same 6 awards, same tie-break rule). Then build the web side on top of the same shared functions: a server component that fetches real data, a small client hook for year-filtering state (mirroring the mobile hook's shape but web-only, since hooks aren't allowed in `packages/utils`), and new presentational components using this repo's existing web conventions (Tailwind, `next/image`, `@heroicons/react` + `react-icons`).

**Tech Stack:** TypeScript strict mode, `@fulbito/types`, `@fulbito/utils` (pure functions, no framework imports), Next.js 15 App Router (server + client components), Tailwind CSS v4, `@heroicons/react`, `react-icons`, `@fulbito/firebase` (`getPlayers`/`getMatches`).

**Spec:** `docs/superpowers/specs/2026-08-28-web-annual-awards-design.md`

## Global Constraints

- No `any`, TypeScript strict mode (already enforced by both `apps/mobile/tsconfig.json` and `apps/web/tsconfig.json`).
- `packages/utils` code must have zero framework imports (no `react`, no RN, no Next) — pure functions and types only, so it works identically in both apps.
- Every new web component/page uses the brand tokens already defined in `apps/web/src/app/globals.css` (`--color-brand` `#7c3aed`, `--color-accent` `#f97316`) via Tailwind's auto-generated `bg-brand`/`text-accent`-style utilities or `bg-[var(--color-brand)]` arbitrary values — never a new hardcoded hex.
- No test runner exists anywhere in this repo (verified: no `jest`/`vitest` in any `package.json`, no `*.test.ts` files). This plan does not introduce one. The one new pure-logic surface (`packages/utils/src/awards.ts`) is verified with a throwaway `node`-executed script — Node 24 runs `.ts` files directly and erases type-only imports, so this needs no new dependency — written, run, and deleted within Task 1; not committed.
- Type-check gate for every task:
  - Mobile: `pnpm --filter @fulbito/mobile exec tsc --noEmit`. **Known pre-existing baseline failure, unrelated to this plan:** `hooks/use-video-clips-data.ts(8,10)` and `(8,14)` — `Module '"@/lib/firebase"' has no exported member 'db'/'storage'`. A task's type-check passes if it shows only exactly those two lines.
  - Web: `pnpm --filter @fulbito/web exec tsc --noEmit`. **Verified clean baseline** — this command currently produces zero output on this branch before any of this plan's changes. Any output after a task's changes is a new problem to fix, not a pre-existing one to ignore.
- Server-side Firestore reads from a Next.js Server Component are a verified pattern for this repo, not an assumption: a throwaway route was built and run locally during spec review, confirming `getPlayers()`/`getMatches()` work from an `async` Server Component with no "no Firebase App '[DEFAULT]' has been created" crash, *provided* the file explicitly does `import '@/lib/firebase'` itself (rather than relying on `AuthProvider.tsx`'s client-side module having already run first — that ordering isn't guaranteed). Task 6 replicates this exact working pattern.

---

### Task 1: Shared awards logic in `packages/utils`

**Files:**
- Create: `packages/utils/src/awards.ts`
- Modify: `packages/utils/src/index.ts`

**Interfaces:**
- Consumes: `Match`/`Player`/`MatchLike` from `@fulbito/types`; `getMvpCountsByPlayerId` from `./mvp` (existing); `getShirtDutiesByPlayerId` from `./shirtDuty` (existing); `calculateAllLongestWinStreaks` from `./playerStats` (existing).
- Produces: `PlayerStatRow` type, `computePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[]`, `AwardAccent`, `AwardKey`, `AwardDef`, `AWARD_DEFS: AwardDef[]`, `AwardWinner`, `pickAwardWinners(rows: PlayerStatRow[]): AwardWinner[]` — all consumed by Task 2 (mobile refactor) and Task 6 (web hook).

- [ ] **Step 1: Write the failing verification script**

Create a scratch file (not committed) at `/tmp/verify-awards.ts`:

```ts
import assert from 'node:assert'
import { computePlayerStatRows, pickAwardWinners } from '/Users/mtonello/Desktop/fulbitoGM/packages/utils/src/awards.ts'

const players = [
  { id: 'p1', name: 'Ana', skill: 5, position: 'FWD', createdAt: new Date(), updatedAt: new Date() },
  { id: 'p2', name: 'Beto', skill: 5, position: 'DEF', createdAt: new Date(), updatedAt: new Date() },
]

const matches = [
  {
    id: 'm1', date: '2026-01-01', type: 'friendly', teamAScore: 3, teamBScore: 1,
    teamA: [{ id: 'p1', name: 'Ana', goals: 2, performance: 8 }],
    teamB: [{ id: 'p2', name: 'Beto', goals: 1, performance: 6 }],
    mvpId: 'p1', shirtsResponsibleId: 'p2',
  },
  {
    id: 'm2', date: '2026-01-08', type: 'friendly', teamAScore: 0, teamBScore: 2,
    teamA: [{ id: 'p1', name: 'Ana', goals: 0, performance: 4 }],
    teamB: [{ id: 'p2', name: 'Beto', goals: 2, performance: 9 }],
    mvpId: 'p2', shirtsResponsibleId: 'p2',
  },
]

const rows = computePlayerStatRows(players as any, matches as any)
const ana = rows.find((r) => r.id === 'p1')!
const beto = rows.find((r) => r.id === 'p2')!

assert.strictEqual(ana.matches, 2)
assert.strictEqual(ana.goals, 2)
assert.strictEqual(ana.wins, 1)
assert.strictEqual(ana.losses, 1)
assert.strictEqual(beto.mvps, 1)
assert.strictEqual(beto.shirts, 2)
assert.strictEqual(beto.streak, 1) // won the most recent match only

const winners = pickAwardWinners(rows)
const mvpAward = winners.find((w) => w.def.key === 'mvps')
assert.ok(mvpAward)
assert.strictEqual(mvpAward!.row.id, 'p1') // Ana and Beto both have 1 MVP — tie-break by name: "Ana" < "Beto"

console.log('ok')
```

- [ ] **Step 2: Run it, confirm it fails**

Run: `node /tmp/verify-awards.ts`
Expected: fails with a module-resolution/export error — `packages/utils/src/awards.ts` doesn't exist yet.

- [ ] **Step 3: Implement `packages/utils/src/awards.ts`**

```ts
import type { Match, Player } from '@fulbito/types'
import { getMvpCountsByPlayerId } from './mvp'
import { getShirtDutiesByPlayerId } from './shirtDuty'
import { calculateAllLongestWinStreaks } from './playerStats'

export type PlayerStatRow = {
  id: string
  name: string
  photoUrl?: string
  matches: number
  goals: number
  totalPerformance: number
  wins: number
  losses: number
  draws: number
  shirts: number
  mvps: number
  streak: number
}

export function computePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[] {
  const map: Record<string, PlayerStatRow> = {}
  const shirtCountById = getShirtDutiesByPlayerId(matches)
  const mvpCountById = getMvpCountsByPlayerId(matches)
  const streakById = calculateAllLongestWinStreaks(matches)
  const photoById = new Map(players.map((p) => [p.id, p.photoUrl ?? undefined]))

  for (const m of matches) {
    const process =
      (team: 'A' | 'B') =>
      (p: { id: string; name: string; goals: number; performance: number }) => {
        if (!map[p.id]) {
          map[p.id] = {
            id: p.id,
            name: p.name,
            photoUrl: photoById.get(p.id),
            matches: 0,
            goals: 0,
            totalPerformance: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            shirts: shirtCountById.get(p.id) ?? 0,
            mvps: mvpCountById.get(p.id) ?? 0,
            streak: streakById[p.id] ?? 0,
          }
        }

        map[p.id].matches++
        map[p.id].goals += p.goals
        map[p.id].totalPerformance += p.performance

        const a = m.teamAScore
        const b = m.teamBScore
        if (team === 'A') {
          if (a > b) map[p.id].wins++
          else if (a < b) map[p.id].losses++
          else map[p.id].draws++
        } else {
          if (b > a) map[p.id].wins++
          else if (b < a) map[p.id].losses++
          else map[p.id].draws++
        }
      }

    m.teamA.forEach(process('A'))
    m.teamB.forEach(process('B'))
  }

  for (const row of Object.values(map)) {
    row.totalPerformance = row.matches > 0 ? row.totalPerformance / row.matches : 0
  }

  return Object.values(map)
}

export type AwardAccent = 'brand' | 'secondary' | 'muted'
export type AwardKey = 'matches' | 'wins' | 'losses' | 'shirts' | 'mvps' | 'streak'

export type AwardDef = {
  key: AwardKey
  title: string
  subtitle: string
  unitLabel: string
  accent: AwardAccent
  getValue: (row: PlayerStatRow) => number
}

export const AWARD_DEFS: AwardDef[] = [
  {
    key: 'matches',
    title: 'Most Matches Played',
    subtitle: 'The Iron Man',
    unitLabel: 'MATCHES',
    accent: 'brand',
    getValue: (row) => row.matches,
  },
  {
    key: 'wins',
    title: 'Most Wins',
    subtitle: 'The Ultimate Winner',
    unitLabel: 'WINS',
    accent: 'brand',
    getValue: (row) => row.wins,
  },
  {
    key: 'losses',
    title: 'Fighting Spirit',
    subtitle: 'Most Losses (We still love you)',
    unitLabel: 'LOSSES',
    accent: 'muted',
    getValue: (row) => row.losses,
  },
  {
    key: 'shirts',
    title: 'Kit Washer of the Year',
    subtitle: 'Unsung Hero',
    unitLabel: 'WASHES',
    accent: 'secondary',
    getValue: (row) => row.shirts,
  },
  {
    key: 'mvps',
    title: 'Most MVPs',
    subtitle: 'The undeniable star of the pitch this season.',
    unitLabel: 'MVPS',
    accent: 'brand',
    getValue: (row) => row.mvps,
  },
  {
    key: 'streak',
    title: 'Racha Ganadora',
    subtitle: 'On Fire',
    unitLabel: 'VICTORIAS SEGUIDAS',
    accent: 'secondary',
    getValue: (row) => row.streak,
  },
]

export type AwardWinner = { def: AwardDef; row: PlayerStatRow; value: number }

function pickWinner(stats: PlayerStatRow[], def: AwardDef): AwardWinner | null {
  let top: PlayerStatRow | undefined
  for (const row of stats) {
    if (!top) {
      top = row
      continue
    }
    const diff = def.getValue(row) - def.getValue(top)
    if (diff > 0 || (diff === 0 && row.name.localeCompare(top.name) < 0)) {
      top = row
    }
  }
  if (!top) return null

  const value = def.getValue(top)
  if (value <= 0) return null

  return { def, row: top, value }
}

export function pickAwardWinners(rows: PlayerStatRow[]): AwardWinner[] {
  return AWARD_DEFS.map((def) => pickWinner(rows, def)).filter((w): w is AwardWinner => w !== null)
}
```

- [ ] **Step 4: Export it from the package root**

In `packages/utils/src/index.ts`, add a line alongside the existing exports:

```ts
export * from './awards'
```

- [ ] **Step 5: Run the verification script again, confirm it passes**

Run: `node /tmp/verify-awards.ts`
Expected: prints `ok`.

- [ ] **Step 6: Type-check both apps and delete the scratch file**

Run: `pnpm --filter @fulbito/mobile exec tsc --noEmit` — expect only the known pre-existing `use-video-clips-data.ts` baseline (mobile doesn't consume this new file yet, so this just confirms nothing broke).
Run: `pnpm --filter @fulbito/web exec tsc --noEmit` — expect zero output.
Run: `rm /tmp/verify-awards.ts`

- [ ] **Step 7: Commit**

```bash
git add packages/utils/src/awards.ts packages/utils/src/index.ts
git commit -m "feat(utils): add shared player-stat aggregation and award-picking logic"
```

---

### Task 2: Refactor mobile's `usePlayerStatRows` to the shared function

**Files:**
- Modify: `apps/mobile/hooks/use-player-stat-rows.ts` (full rewrite — currently 79 lines, all of which move to `packages/utils/src/awards.ts` in Task 1)

**Interfaces:**
- Consumes: `computePlayerStatRows`, `PlayerStatRow` from `@fulbito/utils` (Task 1).
- Produces: `usePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[]` — same signature as before, and `PlayerStatRow` is still importable from `@/hooks/use-player-stat-rows` (re-exported) so no other file needs an import-path change. **New:** `PlayerStatRow` now includes a `streak: number` field it didn't have before (harmless additive change — existing consumers that don't read `streak` are unaffected).

- [ ] **Step 1: Rewrite the file**

```ts
import type { Match, Player } from '@fulbito/types'
import { computePlayerStatRows, type PlayerStatRow } from '@fulbito/utils'
import { useMemo } from 'react'

export type { PlayerStatRow }

export function usePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[] {
  return useMemo(() => computePlayerStatRows(players, matches), [players, matches])
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @fulbito/mobile exec tsc --noEmit`
Expected: only the known pre-existing baseline.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/hooks/use-player-stat-rows.ts
git commit -m "refactor(mobile): usePlayerStatRows delegates to shared computePlayerStatRows"
```

---

### Task 3: Refactor mobile's `useAnnualAwards` to the shared functions

**Files:**
- Modify: `apps/mobile/hooks/use-annual-awards.ts` (full rewrite — currently 141 lines with a local `AWARD_DEFS`/`pickWinner`/`StatRowWithStreak`, all superseded by Task 1's shared versions)

**Interfaces:**
- Consumes: `computePlayerStatRows`, `pickAwardWinners`, `AwardAccent`, `AwardWinner` from `@fulbito/utils` (Task 1).
- Produces: `useAnnualAwards(players, matches)` returns the same shape as before — `{ currentYear, availableYears, onSelectYear, winners }` — where `winners: AwardWinner[]` now comes from `@fulbito/utils`. Re-exports `AwardAccent`/`AwardWinner` as types (so `award-card.tsx`/`awards-list.tsx` keep importing them from `@/hooks/use-annual-awards` unchanged). Keeps its own local `AwardIcon` type (mobile-only — never shared, since web uses different icon components) for Task 4 to build a lookup table against.

- [ ] **Step 1: Rewrite the file**

```ts
import type { Match, Player } from '@fulbito/types'
import { computePlayerStatRows, pickAwardWinners, type AwardAccent, type AwardWinner } from '@fulbito/utils'
import { useMemo, useState } from 'react'

export type { AwardAccent, AwardWinner }

export type AwardIcon =
  | { lib: 'ionicons'; name: 'ribbon' | 'star' }
  | { lib: 'mci'; name: 'run' | 'emoticon-sad-outline' | 'washing-machine' | 'fire' }

export function useAnnualAwards(players: Player[], matches: Match[]) {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  const availableYears = useMemo(() => {
    const years = new Set(matches.map((m) => new Date(m.date).getFullYear()))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [matches])

  const yearMatches = useMemo(
    () => matches.filter((m) => new Date(m.date).getFullYear() === selectedYear),
    [matches, selectedYear],
  )

  const winners = useMemo(
    () => pickAwardWinners(computePlayerStatRows(players, yearMatches)),
    [players, yearMatches],
  )

  return {
    currentYear: selectedYear,
    availableYears,
    onSelectYear: setSelectedYear,
    winners,
  }
}
```

Note: this drops the separate `statsWithStreak` merge step the old version needed — `computePlayerStatRows` now includes `streak` directly, so `pickAwardWinners` can be called straight on its output.

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @fulbito/mobile exec tsc --noEmit`
Expected: a **new** error in `apps/mobile/components/awards/award-card.tsx` and/or `apps/mobile/components/awards/awards-list.tsx` — they still read `item.def.icon` / import `AwardDef`, which no longer has an `icon` field (it moved out in Task 1, since icons are mobile/web-specific). This is expected and gets fixed in Task 4. Confirm no *other* new errors appear.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/hooks/use-annual-awards.ts
git commit -m "refactor(mobile): useAnnualAwards delegates to shared award-picking logic"
```

---

### Task 4: Mobile icon lookup + fix the two broken call sites

**Files:**
- Create: `apps/mobile/constants/award-icons.ts`
- Modify: `apps/mobile/components/awards/awards-list.tsx:1-11,58-70` (imports + the `AwardCard` render)

**Interfaces:**
- Consumes: `AwardIcon` type from `@/hooks/use-annual-awards` (Task 3), `AwardKey` from `@fulbito/utils` (Task 1).
- Produces: `AWARD_ICONS: Record<AwardKey, AwardIcon>` — consumed by `awards-list.tsx` in this task, and available for any future mobile award UI.

- [ ] **Step 1: Write the icon lookup**

```ts
import type { AwardKey } from '@fulbito/utils'
import type { AwardIcon } from '@/hooks/use-annual-awards'

export const AWARD_ICONS: Record<AwardKey, AwardIcon> = {
  matches: { lib: 'mci', name: 'run' },
  wins: { lib: 'ionicons', name: 'ribbon' },
  losses: { lib: 'mci', name: 'emoticon-sad-outline' },
  shirts: { lib: 'mci', name: 'washing-machine' },
  mvps: { lib: 'ionicons', name: 'star' },
  streak: { lib: 'mci', name: 'fire' },
}
```

- [ ] **Step 2: Fix `awards-list.tsx`**

Add the import (alongside the existing `import type { AwardWinner } from '@/hooks/use-annual-awards'` at line 11):

```ts
import { AWARD_ICONS } from '@/constants/award-icons'
```

Change the `AwardCard` render (currently line 62, `icon={item.def.icon}`) to:

```tsx
icon={AWARD_ICONS[item.def.key]}
```

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @fulbito/mobile exec tsc --noEmit`
Expected: only the known pre-existing baseline — the errors from Task 3's step 2 are now gone.

- [ ] **Step 4: Manual verification**

Run `pnpm --filter @fulbito/mobile start`, open the app, go to Estadísticas → AWARDS. Confirm all 6 award cards render with their correct icons (including the fire icon for "Racha Ganadora") and correct winners/values — this is a pure refactor, so the values must be identical to what they were before this plan.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/constants/award-icons.ts apps/mobile/components/awards/awards-list.tsx
git commit -m "feat(mobile): move award icon lookup out of AwardDef"
```

---

### Task 5: Web data-fetching hook

**Files:**
- Create: `apps/web/src/hooks/use-annual-awards.ts`

**Interfaces:**
- Consumes: `computePlayerStatRows`, `pickAwardWinners` from `@fulbito/utils` (Task 1).
- Produces: `useAnnualAwards(players: Player[], matches: Match[])` returning `{ currentYear: number, availableYears: number[], onSelectYear: (year: number) => void, winners: AwardWinner[] }` — consumed by Task 7 (`AwardsClient`).

- [ ] **Step 1: Write the hook**

```ts
'use client'

import type { Match, Player } from '@fulbito/types'
import { computePlayerStatRows, pickAwardWinners } from '@fulbito/utils'
import { useMemo, useState } from 'react'

export function useAnnualAwards(players: Player[], matches: Match[]) {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  const availableYears = useMemo(() => {
    const years = new Set(matches.map((m) => new Date(m.date).getFullYear()))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [matches])

  const yearMatches = useMemo(
    () => matches.filter((m) => new Date(m.date).getFullYear() === selectedYear),
    [matches, selectedYear],
  )

  const winners = useMemo(
    () => pickAwardWinners(computePlayerStatRows(players, yearMatches)),
    [players, yearMatches],
  )

  return {
    currentYear: selectedYear,
    availableYears,
    onSelectYear: setSelectedYear,
    winners,
  }
}
```

This is intentionally near-identical to the mobile hook from Task 3 (minus the mobile-only `AwardIcon` type) — the duplication is just the year-filtering `useState`/`useMemo` glue, which can't itself live in `packages/utils` (hooks require React, and `packages/utils` must stay framework-free per Global Constraints). Not worth abstracting further per YAGNI.

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: zero output.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/hooks/use-annual-awards.ts
git commit -m "feat(web): add useAnnualAwards hook"
```

---

### Task 6: Web `/awards` route — server component + page shell

**Files:**
- Create: `apps/web/src/app/awards/page.tsx`
- Create: `apps/web/src/app/awards/awardsClient.tsx` (shell only in this task — full award grid comes in Task 7 once `AwardCard` exists; this task renders the year picker and a placeholder count so the route is testable end-to-end early)

**Interfaces:**
- Consumes: `getPlayers`, `getMatches` from `@fulbito/firebase` (existing); `useAnnualAwards` from `@/hooks/use-annual-awards` (Task 5).
- Produces: the `/awards` route, and `AwardsClient({ players, matches }: { players: Player[]; matches: Match[] })` — Task 7 extends this same file to render `AwardCard`s instead of the placeholder.

- [ ] **Step 1: Write the server component**

```tsx
import '@/lib/firebase'
import { getPlayers, getMatches } from '@fulbito/firebase'
import { AwardsClient } from './awardsClient'

export default async function AwardsPage() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  return <AwardsClient players={players} matches={matches} />
}
```

- [ ] **Step 2: Write the client shell**

```tsx
'use client'

import type { Match, Player } from '@fulbito/types'
import { useAnnualAwards } from '@/hooks/use-annual-awards'

type Props = { players: Player[]; matches: Match[] }

export function AwardsClient({ players, matches }: Props) {
  const { currentYear, availableYears, onSelectYear, winners } = useAnnualAwards(players, matches)

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Premios del Año</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="award-year" className="text-sm font-medium">
            Temporada
          </label>
          <select
            id="award-year"
            value={currentYear}
            onChange={(e) => onSelectYear(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-gray-600">{winners.length} premios este año.</p>
    </main>
  )
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: zero output.

- [ ] **Step 4: Manual verification**

Run `pnpm --filter @fulbito/web dev`, visit `http://localhost:3000/awards`. Confirm the page loads (no crash, no "Firebase App" error), shows "Premios del Año", a year `<select>` populated with at least the current year, and the placeholder count text. Changing the year in the dropdown should update the count (it may show 0 if there are no matches in that year, or if this environment has no network access to Firestore — in that case, confirm at minimum that switching years doesn't throw and the UI updates without error).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/awards/page.tsx apps/web/src/app/awards/awardsClient.tsx
git commit -m "feat(web): add /awards route with server-side data fetch and year picker"
```

---

### Task 7: Web `AwardCard` + icon lookup + full grid

**Files:**
- Create: `apps/web/src/constants/award-icons.ts`
- Create: `apps/web/src/components/AwardCard.tsx`
- Modify: `apps/web/src/app/awards/awardsClient.tsx` (replace the placeholder count with the real grid)

**Interfaces:**
- Consumes: `AwardKey` from `@fulbito/utils` (Task 1); `AwardWinner` from `@fulbito/utils` (Task 1, via `useAnnualAwards`'s return in Task 5).
- Produces: `AWARD_ICONS: Record<AwardKey, React.ComponentType<{ className?: string }>>`; `AwardCard(props)` — a presentational component with no further consumers in this plan.

- [ ] **Step 1: Write the icon lookup**

```ts
import { FaceFrownIcon, FireIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { FaRunning } from 'react-icons/fa'
import { GiWashingMachine } from 'react-icons/gi'
import type { AwardKey } from '@fulbito/utils'
import type { ComponentType } from 'react'

export const AWARD_ICONS: Record<AwardKey, ComponentType<{ className?: string }>> = {
  matches: FaRunning,
  wins: TrophyIcon,
  losses: FaceFrownIcon,
  shirts: GiWashingMachine,
  mvps: StarIcon,
  streak: FireIcon,
}
```

- [ ] **Step 2: Write `AwardCard`**

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { ComponentType } from 'react'

type Accent = 'brand' | 'secondary' | 'muted'

type Props = {
  title: string
  subtitle: string
  Icon: ComponentType<{ className?: string }>
  accent: Accent
  winnerName: string
  winnerPhotoUrl?: string
  value: number
  unitLabel: string
  href: string
}

const ACCENT_BG: Record<Accent, string> = {
  brand: 'bg-[var(--color-brand)]',
  secondary: 'bg-[var(--color-accent)]',
  muted: 'bg-gray-300',
}

export function AwardCard({ title, subtitle, Icon, accent, winnerName, winnerPhotoUrl, value, unitLabel, href }: Props) {
  return (
    <Link href={href} className="group">
      <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${ACCENT_BG[accent]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
          <Image
            src={winnerPhotoUrl ?? '/silhouette.svg'}
            alt={winnerName}
            width={40}
            height={40}
            className="object-cover w-10 h-10 rounded-full"
          />
          <span className="flex-1 font-semibold text-gray-900 truncate">{winnerName}</span>
          <div className="text-right">
            <div className="text-xl font-extrabold text-[var(--color-accent)] leading-tight">{value}</div>
            <div className="text-[10px] font-bold tracking-wide text-gray-500">{unitLabel}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Wire it into `AwardsClient`**

Replace the placeholder `<p className="text-gray-600">{winners.length} premios este año.</p>` in `apps/web/src/app/awards/awardsClient.tsx` with:

```tsx
{winners.length === 0 ? (
  <p className="text-gray-600 text-center py-16">Todavía no hay premios este año.</p>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {winners.map((winner) => (
      <AwardCard
        key={winner.def.key}
        title={winner.def.title}
        subtitle={winner.def.subtitle}
        Icon={AWARD_ICONS[winner.def.key]}
        accent={winner.def.accent}
        winnerName={winner.row.name}
        winnerPhotoUrl={winner.row.photoUrl}
        value={winner.value}
        unitLabel={winner.def.unitLabel}
        href={`/players/${winner.row.id}`}
      />
    ))}
  </div>
)}
```

And add the two new imports at the top of `awardsClient.tsx`:

```ts
import { AwardCard } from '@/components/AwardCard'
import { AWARD_ICONS } from '@/constants/award-icons'
```

- [ ] **Step 4: Type-check**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: zero output.

- [ ] **Step 5: Lint**

Run: `pnpm --filter @fulbito/web lint`
Expected: no new warnings/errors in the files this task touched.

- [ ] **Step 6: Manual verification**

Revisit `http://localhost:3000/awards`. Confirm each award (if any winners exist in the connected Firestore project) renders as a card with the right icon, accent color, avatar (or the `/silhouette.svg` fallback), name, value, and unit label, and that clicking a card navigates to `/players/<id>`. If this environment has no real network access to Firestore, confirm instead that the empty-state message ("Todavía no hay premios este año.") renders correctly with zero winners, and note that a full data-driven check needs to happen wherever this app is normally run against the real project.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/constants/award-icons.ts apps/web/src/components/AwardCard.tsx apps/web/src/app/awards/awardsClient.tsx
git commit -m "feat(web): render the annual awards grid with AwardCard"
```

---

### Task 8: Home page entry point

**Files:**
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: nothing new (just a heroicon and a route that now exists from Task 6).
- Produces: nothing consumed elsewhere — this is the last task.

- [ ] **Step 1: Add the import**

Change the icon import line (currently line 2):

```tsx
import { ChartBarIcon, UserGroupIcon, PlayIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline'
```

- [ ] **Step 2: Add the 5th card**

Add a new entry to the `cards` array (after the `history` entry, before the closing `]`):

```ts
{
  href: '/awards',
  title: 'Premios',
  desc: 'Mirá los premios del año',
  Icon: TrophyIcon,
  color: 'from-yellow-500/20 to-amber-500/20'
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: zero output.

- [ ] **Step 4: Manual verification**

Visit `http://localhost:3000/`. Confirm a 5th "Premios" card appears in the grid (wrapping to its own row on large screens, same as the existing cards already wrap on smaller screens) and clicking it navigates to `/awards`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat(web): add Premios entry point to the home menu grid"
```

---

### Task 9: Final full-repo verification

**Files:** none (verification only)

- [ ] **Step 1: Full type-check, both apps**

Run: `pnpm --filter @fulbito/mobile exec tsc --noEmit` — expect only the known pre-existing two-line baseline.
Run: `pnpm --filter @fulbito/web exec tsc --noEmit` — expect zero output.

- [ ] **Step 2: Lint, both apps**

Run: `pnpm --filter @fulbito/mobile lint` — expect only the known pre-existing warnings (unused-vars in `app/(tabs)/players/[id].tsx`, an unrelated eslint-disable warning in `.expo/types/router.d.ts`), nothing new in any file this plan touched.
Run: `pnpm --filter @fulbito/web lint` — expect zero new warnings/errors.

- [ ] **Step 3: Mobile manual regression check**

Run `pnpm --filter @fulbito/mobile start`, open Estadísticas → AWARDS. Confirm the 6 awards still render exactly as before this plan (this is a refactor — Tasks 2–4 must not have changed any value or ordering).

- [ ] **Step 4: Web manual check**

Run `pnpm --filter @fulbito/web dev`. Visit `/` and confirm the new "Premios" card, then `/awards` and confirm the year picker and grid (or empty state) render without error.
