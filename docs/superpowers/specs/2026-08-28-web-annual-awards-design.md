# Web Annual Awards Page — Design

## Context

Port the mobile "Premios del Año" (annual awards) feature to `apps/web`. Scope is narrowed to just this feature — the broader web home redesign discussed earlier is deferred to a separate branch/task. Confirmed decisions:

- New standalone route `apps/web/src/app/awards/page.tsx` (not a tab inside `/statistics`, since web's `/statistics` already has its own separate, non-shared stat computation).
- Includes a year/season selector (parity with mobile).
- Entry point: a 5th card ("Premios") added to the existing menu grid in `apps/web/src/app/page.tsx`.
- Data fetched server-side directly in the route's server component (fixing the existing `players={[]} matches={[]}` anti-pattern used by `/statistics` and `/players`, not replicating it — this page has no existing consumers to keep compatible with).
- The pure calculation logic (stat aggregation, award-winner picking) moves to `packages/utils`, shared between mobile and web, instead of being duplicated. Mobile's existing `use-player-stat-rows.ts`/`use-annual-awards.ts` are refactored to consume the shared functions rather than left as-is, so there's a single source of truth for the award rules going forward.
- Brand color tokens (`--color-brand`/`--color-accent`) and the icon libraries already in use (`@heroicons/react`, `react-icons`) are used for this new page — no discussion needed there since it's new code, not a fix to existing inconsistent code (that fix is deferred along with the rest of the home redesign).

## Shared logic: `packages/utils`

New file `packages/utils/src/awards.ts`:

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

export function computePlayerStatRows(players: Player[], matches: Match[]): PlayerStatRow[]
// body: identical aggregation currently in apps/mobile/hooks/use-player-stat-rows.ts,
// plus merging in `streak` via calculateAllLongestWinStreaks(matches) (currently a
// separate merge step inside apps/mobile/hooks/use-annual-awards.ts — folding it into
// this single pure function removes that extra step from both callers).

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

export const AWARD_DEFS: AwardDef[] // the same 6 entries currently in AWARD_DEFS in
// apps/mobile/hooks/use-annual-awards.ts, minus the `icon` field (icons are UI/library-
// specific — heroicons+react-icons on web, ionicons+MaterialCommunityIcons on mobile —
// so each app keeps its own key→icon lookup table instead of a shared one).

export type AwardWinner = { def: AwardDef; row: PlayerStatRow; value: number }

export function pickAwardWinners(rows: PlayerStatRow[]): AwardWinner[]
// body: AWARD_DEFS.map(def => pickWinner(rows, def)).filter(non-null), where pickWinner
// is the existing tie-break-by-name logic from use-annual-awards.ts, moved here unchanged.
```

Exported from `packages/utils/src/index.ts` alongside the existing `export * from './playerStats'` etc.

**Why accent stays shared but icon doesn't:** `accent` is an abstract concept (`'brand' | 'secondary' | 'muted'`) that both apps already map to their own theme tokens the same way; `icon` requires a concrete icon component from a specific library, and mobile/web don't share one.

## Mobile refactor (no behavior change, only where the logic lives)

- `apps/mobile/hooks/use-player-stat-rows.ts`: becomes a thin wrapper — `export type { PlayerStatRow } from '@fulbito/utils'` and `usePlayerStatRows(players, matches) { return useMemo(() => computePlayerStatRows(players, matches), [players, matches]) }`.
- `apps/mobile/hooks/use-annual-awards.ts`: drops its local `AWARD_DEFS`/`pickWinner`/`StatRowWithStreak`, keeps only the year-filtering state (`selectedYear`, `availableYears`) and calls `pickAwardWinners(computePlayerStatRows(players, yearMatches))` from `@fulbito/utils` directly (no longer needs the separate streak-merge step, since `computePlayerStatRows` now includes `streak`). Re-exports `AwardDef`/`AwardWinner`/`AwardAccent` as type aliases from `@fulbito/utils` for existing consumers (`award-card.tsx`, `awards-list.tsx`, `home-awards-preview.tsx`) that import these types from `@/hooks/use-annual-awards` today, so those files don't need their import paths changed.
- `AwardIcon` type and the `key → icon` lookup move to a new small file `apps/mobile/constants/award-icons.ts` (mobile-only, keyed by the shared `AwardKey`). `apps/mobile/components/awards/awards-list.tsx` and `apps/mobile/components/home/home-awards-preview.tsx` change their `icon={item.def.icon}` / `icon={winner.def.icon}` reads to `icon={AWARD_ICONS[item.def.key]}` / `icon={AWARD_ICONS[winner.def.key]}` — a one-line change in each, since `AwardDef` no longer carries `icon`.

This refactor is behavior-preserving for mobile: same 6 awards, same tie-break rule, same values. It's included because the alternative (leaving mobile's logic untouched and writing a second, separate implementation for web) is exactly the duplication the user asked to avoid.

## Web: data layer

`apps/web/src/app/awards/page.tsx` — server component:

```tsx
import '@/lib/firebase'
import { getPlayers, getMatches } from '@fulbito/firebase'
import { AwardsClient } from './awardsClient'

export default async function AwardsPage() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  return <AwardsClient players={players} matches={matches} />
}
```

(mirrors the `getPlayers`/`getMatches` calls already used by `apps/mobile/hooks/use-players-data.ts` — same `@fulbito/firebase` functions, already shared).

**Verified, not assumed:** today `initFirebase(...)` only runs as a side effect of importing `@/lib/firebase` inside `AuthProvider.tsx` (a `'use client'` component in the root layout). A throwaway route was built and run locally (`next dev`) to confirm a server component can call `getPlayers()`/`getMatches()` directly without a "no Firebase App '[DEFAULT]' has been created" crash — it returned 200 with no init error (0 results, because this sandbox has no outbound network access to reach the real Firestore backend — a sandbox limitation, not a code problem: the Firestore SDK logged "Could not reach Cloud Firestore backend... operating in offline mode", the same limitation any fetching approach, client or server, would hit here). The route was deleted after the check. The explicit `import '@/lib/firebase'` at the top of `page.tsx` (rather than relying on `AuthProvider`'s module having already run first) is what makes this reliable regardless of render order.

`apps/web/src/hooks/use-annual-awards.ts` (new, web-only — analogous to the mobile hook but without any RN-specific dependency; both could theoretically merge into one shared hook later, but hooks aren't pure per `packages/utils`'s "no framework imports" rule, and small enough duplication here — just year-filtering state — isn't worth abstracting per YAGNI):

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

  return { currentYear: selectedYear, availableYears, onSelectYear: setSelectedYear, winners }
}
```

## Web: components

`apps/web/src/app/awards/awardsClient.tsx` (`'use client'`) — takes `players`/`matches` as props (from the server component), calls `useAnnualAwards`, renders:

- A page header ("Premios del Año") and a native `<select>` year picker (labelled, following the existing `<label>` + `<select className="border rounded px-3 py-2 w-full">` pattern already used in `historyClient.tsx`), bound to `currentYear`/`onSelectYear`.
- A responsive grid of `AwardCard` (new component, `apps/web/src/components/AwardCard.tsx`) — one per `AwardWinner`, or an empty-state message if `winners.length === 0`.

`apps/web/src/components/AwardCard.tsx`:

```tsx
type Props = {
  title: string
  subtitle: string
  Icon: React.ComponentType<{ className?: string }>
  accent: 'brand' | 'secondary' | 'muted'
  winnerName: string
  winnerPhotoUrl?: string
  value: number
  unitLabel: string
  href: string // links to the player's detail page, e.g. `/players/${id}`
}
```

Renders a card (Tailwind, `rounded-xl border bg-white p-5 shadow-sm`, matching the existing home-page card styling) with the icon in a colored badge (`bg-[var(--color-brand)]`/`bg-[var(--color-accent)]`/gray depending on `accent`), the winner's name (photo if available, else initials — a small `Avatar` inline, no new shared component needed for one usage), and the value + unit label. The whole card is a `<Link>` (per CLAUDE.md: use `<a>`/`Link` for navigation), `accessibilityLabel`-equivalent via visible text (web doesn't need the RN `accessibilityLabel` prop — the visible text already serves screen readers here).

`apps/web/src/constants/award-icons.ts` (web-only, mirrors the mobile one):

```ts
import { FireIcon, StarIcon, TrophyIcon, FaceFrownIcon } from '@heroicons/react/24/outline'
import { FaRunning } from 'react-icons/fa'
import { GiWashingMachine } from 'react-icons/gi'
import type { AwardKey } from '@fulbito/utils'

export const AWARD_ICONS: Record<AwardKey, React.ComponentType<{ className?: string }>> = {
  matches: FaRunning,
  wins: TrophyIcon,
  losses: FaceFrownIcon,
  shirts: GiWashingMachine,
  mvps: StarIcon,
  streak: FireIcon,
}
```

## Home page entry point

`apps/web/src/app/page.tsx`: add a 5th entry to the `cards` array:

```ts
{
  href: '/awards',
  title: 'Premios',
  desc: 'Mirá los premios del año',
  Icon: TrophyIcon, // new import from @heroicons/react/24/outline
  color: 'from-yellow-500/20 to-amber-500/20'
}
```

No other change to `page.tsx` — the grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) will show the 5th card wrapping to a new row on large screens, same as it already wraps on small/medium screens with 4 cards; not worth changing the grid's column count for one extra card.

## Testing

Same situation as the mobile plan: no test runner exists in this repo. The one new pure-logic surface (`computePlayerStatRows`/`pickAwardWinners` in `packages/utils`) is verified with a throwaway `node`-executed script (Node runs `.ts` directly, type-only imports erased — no new dependency), exactly like the mobile plan's Task 1. Everything else (the new web page, the mobile refactor not changing behavior) is verified via `tsc --noEmit` for both `apps/mobile` and `apps/web`, plus manual verification (`pnpm --filter @fulbito/web dev`, visit `/awards` and the updated home page) since there's no browser-automation tool available in this environment to do it automatically.
