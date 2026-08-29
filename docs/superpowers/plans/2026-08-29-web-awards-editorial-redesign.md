# Web Awards Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing `/awards` page in `apps/web` with a full-bleed "Camino al Campeonato" cover hero (based on current win streak, threshold 7) and `framer-motion`-driven animation (name reveal, count-up, staggered grid, year cross-fade).

**Architecture:** Add a new pure selection function (`pickChampionshipProgress`) to the existing web-only `use-annual-awards.ts` hook, reusing the already-shared `calculateAllCurrentStreaks` from `@fulbito/utils` — no changes to `packages/utils` or mobile. Add one new presentational component (`ChampionshipHero`) and wire animation into the existing `AwardsClient`/`AwardCard` without changing `AwardCard`'s props.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, `framer-motion` (new dependency, confirmed compatible with React 19: `peerDependencies: { react: "^18.0.0 || ^19.0.0" }`).

**Spec:** `docs/superpowers/specs/2026-08-29-web-awards-editorial-redesign-design.md`

## Global Constraints

- No `any` in committed code.
- `pnpm --filter @fulbito/web exec tsc --noEmit` must show zero output at the end of every task (verified clean baseline before this plan).
- `pnpm --filter @fulbito/web lint` must show no new warnings.
- Brand tokens only for the hero background (`var(--color-brand)`, no new hardcoded hex except the existing `#4c1d95` already used elsewhere in this app for a brand-adjacent gradient stop — see `apps/web/src/app/page.tsx`'s own hero for precedent).
- Must respect `prefers-reduced-motion`: when a user has it enabled, the hero's reveal/count-up must render final values immediately, no animation — this is a correctness requirement per this repo's CLAUDE.md accessibility rules, not optional polish.
- No test runner exists in this repo. The one new pure-logic function (`pickChampionshipProgress`) is verified with a throwaway `node`-executed script (Node 24 runs `.ts` files directly, type-only imports erased — no new dependency needed), written, run, and deleted before committing — never committed.
- `AwardCard`'s props are unchanged by this plan — animation is applied by wrapping it in `motion.div` at the call site in `AwardsClient`, not by modifying `AwardCard` itself.

---

### Task 1: Add the `framer-motion` dependency

**Files:**
- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml` (repo root — updated automatically by the install command)

**Interfaces:**
- Produces: the `framer-motion` package available to import from any file in `apps/web/src` — consumed by Tasks 3 and 4.

- [ ] **Step 1: Install**

Run from the repo root:
```bash
pnpm --filter @fulbito/web add framer-motion
```
Expected: `apps/web/package.json`'s `dependencies` gains a `"framer-motion": "^13.x.x"` entry (or whatever the latest compatible version resolves to — confirmed compatible with React 19 as of writing), and `pnpm-lock.yaml` updates.

- [ ] **Step 2: Verify the install resolved correctly**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: zero output (installing a new package alone shouldn't introduce type errors, since nothing imports it yet).

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore(web): add framer-motion dependency"
```

---

### Task 2: "Camino al Campeonato" data layer

**Files:**
- Modify: `apps/web/src/hooks/use-annual-awards.ts` (full rewrite — currently 33 lines)

**Interfaces:**
- Consumes: `calculateAllCurrentStreaks` from `@fulbito/utils` (existing, already used by mobile — no changes needed there).
- Produces: `ChampionshipProgress` type (`{ playerId: string; playerName: string; playerPhotoUrl?: string; streak: number; isChampion: boolean } | null`), `pickChampionshipProgress(players: Player[], matches: Match[]): ChampionshipProgress` (exported for the verification script and for reuse), and `useAnnualAwards`'s return value gains a `championship: ChampionshipProgress` field alongside the existing `currentYear`/`availableYears`/`onSelectYear`/`winners` — consumed by Task 4 (`AwardsClient`).

- [ ] **Step 1: Write the failing verification script**

Create a scratch file (not committed) at `/tmp/verify-championship.ts`:

```ts
import assert from 'node:assert'
import { pickChampionshipProgress } from '/Users/mtonello/Desktop/fulbitoGM/apps/web/src/hooks/use-annual-awards.ts'

const players = [
  { id: 'ana', name: 'Ana', skill: 5, position: 'FWD', createdAt: new Date(), updatedAt: new Date() },
  { id: 'beto', name: 'Beto', skill: 5, position: 'DEF', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cami', name: 'Cami', skill: 5, position: 'MID', createdAt: new Date(), updatedAt: new Date() },
]

// Ana: won her 3 most recent matches (current streak 3, not champion).
// Beto: lost his most recent match (excluded — current streak is a loss, not a win).
// Cami: has no matches at all (excluded).
const matches = [
  { id: 'm1', date: '2026-01-03', type: 'friendly', teamAScore: 2, teamBScore: 0,
    teamA: [{ id: 'ana', name: 'Ana', goals: 1, performance: 8 }],
    teamB: [{ id: 'beto', name: 'Beto', goals: 0, performance: 4 }] },
  { id: 'm2', date: '2026-01-02', type: 'friendly', teamAScore: 3, teamBScore: 1,
    teamA: [{ id: 'ana', name: 'Ana', goals: 2, performance: 9 }],
    teamB: [{ id: 'beto', name: 'Beto', goals: 1, performance: 5 }] },
  { id: 'm3', date: '2026-01-01', type: 'friendly', teamAScore: 1, teamBScore: 0,
    teamA: [{ id: 'ana', name: 'Ana', goals: 1, performance: 7 }],
    teamB: [{ id: 'beto', name: 'Beto', goals: 0, performance: 3 }] },
]

const result = pickChampionshipProgress(players, matches)
assert.ok(result, 'expected a result, not null')
assert.strictEqual(result.playerId, 'ana')
assert.strictEqual(result.streak, 3)
assert.strictEqual(result.isChampion, false)

// Nobody with a positive win streak -> null
const noWinnersMatches = [
  { id: 'm4', date: '2026-01-01', type: 'friendly', teamAScore: 0, teamBScore: 1,
    teamA: [{ id: 'ana', name: 'Ana', goals: 0, performance: 3 }],
    teamB: [{ id: 'beto', name: 'Beto', goals: 1, performance: 8 }] },
]
assert.strictEqual(pickChampionshipProgress([players[0]], noWinnersMatches), null, 'Ana just lost, no positive streak')

// Streak >= 7 -> champion
const championMatches = Array.from({ length: 7 }, (_, i) => ({
  id: `w${i}`,
  date: `2026-02-${String(i + 1).padStart(2, '0')}`,
  type: 'friendly',
  teamAScore: 1,
  teamBScore: 0,
  teamA: [{ id: 'ana', name: 'Ana', goals: 1, performance: 8 }],
  teamB: [{ id: 'beto', name: 'Beto', goals: 0, performance: 4 }],
}))
const championResult = pickChampionshipProgress([players[0]], championMatches)
assert.ok(championResult)
assert.strictEqual(championResult.streak, 7)
assert.strictEqual(championResult.isChampion, true)

console.log('ok')
```

- [ ] **Step 2: Run it, confirm it fails**

Run: `node /tmp/verify-championship.ts`
Expected: fails — `pickChampionshipProgress` is not exported yet (the module doesn't have that name).

- [ ] **Step 3: Rewrite `apps/web/src/hooks/use-annual-awards.ts`**

```ts
'use client'

import type { Match, Player } from '@fulbito/types'
import { calculateAllCurrentStreaks, computePlayerStatRows, pickAwardWinners } from '@fulbito/utils'
import { useMemo, useState } from 'react'

const CHAMPIONSHIP_THRESHOLD = 7

export type ChampionshipProgress = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string
  streak: number
  isChampion: boolean
} | null

export function pickChampionshipProgress(players: Player[], matches: Match[]): ChampionshipProgress {
  const streaks = calculateAllCurrentStreaks(matches)
  let best: { player: Player; streak: number } | null = null

  for (const p of players) {
    const s = streaks[p.id]
    if (s?.kind !== 'win' || s.count <= 0) continue
    if (!best || s.count > best.streak || (s.count === best.streak && p.name.localeCompare(best.player.name) < 0)) {
      best = { player: p, streak: s.count }
    }
  }

  if (!best) return null
  return {
    playerId: best.player.id,
    playerName: best.player.name,
    playerPhotoUrl: best.player.photoUrl,
    streak: best.streak,
    isChampion: best.streak >= CHAMPIONSHIP_THRESHOLD,
  }
}

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

  const championship = useMemo(
    () => pickChampionshipProgress(players, yearMatches),
    [players, yearMatches],
  )

  return {
    currentYear: selectedYear,
    availableYears,
    onSelectYear: setSelectedYear,
    winners,
    championship,
  }
}
```

Note: `streaks[p.id]` is read via optional chaining (`s?.kind`) even though `calculateAllCurrentStreaks`'s `Record<string, {...}>` return type isn't marked optional by TypeScript (no `noUncheckedIndexedAccess` in this repo's `tsconfig.json`) — a player with zero matches has no entry in that record at runtime, so this must not assume the lookup always succeeds.

- [ ] **Step 4: Run the verification script again, confirm it passes**

Run: `node /tmp/verify-championship.ts`
Expected: prints `ok`.

- [ ] **Step 5: Type-check and delete the scratch script**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: a new error in `apps/web/src/app/awards/awardsClient.tsx` — it destructures `useAnnualAwards`'s return but doesn't use the new `championship` field yet, which is fine (unused return values don't error) — actually expect **zero output**, since an unused destructured-away field isn't an error. If you see any other error, investigate before continuing.

Run: `rm /tmp/verify-championship.ts`

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/hooks/use-annual-awards.ts
git commit -m "feat(web): add Camino al Campeonato (current win-streak) selection logic"
```

---

### Task 3: `ChampionshipHero` component

**Files:**
- Create: `apps/web/src/components/ChampionshipHero.tsx`

**Interfaces:**
- Consumes: `ChampionshipProgress` type from `@/hooks/use-annual-awards` (Task 2); `motion`, `useReducedMotion`, `animate` from `framer-motion` (Task 1).
- Produces: `ChampionshipHero({ championship }: { championship: ChampionshipProgress })` — consumed by Task 4.

- [ ] **Step 1: Write the component**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { animate, motion, useReducedMotion } from 'framer-motion'
import type { ChampionshipProgress } from '@/hooks/use-annual-awards'

const THRESHOLD = 7

type Props = { championship: ChampionshipProgress }

function useCountUp(target: number, shouldAnimate: boolean): number {
  const [value, setValue] = useState(shouldAnimate ? 0 : target)

  useEffect(() => {
    if (!shouldAnimate) {
      setValue(target)
      return
    }
    const controls = animate(0, target, {
      duration: 1,
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [target, shouldAnimate])

  return value
}

export function ChampionshipHero({ championship }: Props) {
  const reducedMotion = useReducedMotion()
  const streak = championship?.streak ?? 0
  const displayedStreak = useCountUp(streak, !reducedMotion && championship !== null)

  return (
    <section className="w-full bg-gradient-to-br from-[var(--color-brand)] to-[#4c1d95] text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {championship === null ? (
          <p className="text-white/80">Todavía nadie está en racha ganadora este año.</p>
        ) : (
          <>
            <p className="text-xs tracking-[0.2em] text-white/70 mb-2">CAMINO AL CAMPEONATO</p>
            <div className="overflow-hidden">
              <motion.h1
                className="text-5xl font-black italic leading-none"
                initial={reducedMotion ? false : { y: '100%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {championship.playerName}
              </motion.h1>
            </div>
            <p className="mt-4 text-lg font-semibold">
              {championship.isChampion ? '🏆 CAMPEÓN' : `${displayedStreak}/${THRESHOLD} VICTORIAS SEGUIDAS`}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: zero output.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/ChampionshipHero.tsx
git commit -m "feat(web): add ChampionshipHero component"
```

---

### Task 4: Wire the hero and animations into `AwardsClient`

**Files:**
- Modify: `apps/web/src/app/awards/awardsClient.tsx` (full rewrite — currently 58 lines)

**Interfaces:**
- Consumes: `ChampionshipHero` (Task 3), the extended `useAnnualAwards` return (Task 2, now including `championship`), `motion`/`AnimatePresence` from `framer-motion` (Task 1). `AwardCard`'s props are unchanged from before this plan.
- Produces: the fully redesigned `/awards` page — nothing downstream depends on this file's internals.

- [ ] **Step 1: Rewrite `apps/web/src/app/awards/awardsClient.tsx`**

```tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { Match, Player } from '@fulbito/types'
import { AwardCard } from '@/components/AwardCard'
import { ChampionshipHero } from '@/components/ChampionshipHero'
import { AWARD_ICONS } from '@/constants/award-icons'
import { useAnnualAwards } from '@/hooks/use-annual-awards'

type Props = { players: Player[]; matches: Match[] }

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export function AwardsClient({ players, matches }: Props) {
  const { currentYear, availableYears, onSelectYear, winners, championship } = useAnnualAwards(players, matches)

  return (
    <>
      <ChampionshipHero championship={championship} />

      <div className="max-w-5xl mx-auto px-6 py-10">
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

        <AnimatePresence mode="wait">
          <motion.div
            key={currentYear}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {winners.length === 0 ? (
              <p className="text-gray-600 text-center py-16">Todavía no hay premios este año.</p>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                variants={gridVariants}
                initial="hidden"
                animate="visible"
              >
                {winners.map((winner) => (
                  <motion.div key={winner.def.key} variants={cardVariants}>
                    <AwardCard
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
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit`
Expected: zero output.

- [ ] **Step 3: Lint**

Run: `pnpm --filter @fulbito/web lint`
Expected: zero new warnings.

- [ ] **Step 4: Manual verification**

Start the dev server (`pnpm --filter @fulbito/web dev`) and visit `/awards`:
- Confirm the full-bleed gradient hero renders above the existing header/grid, with either real data (a player name + streak progress or "🏆 CAMPEÓN") or the empty state ("Todavía nadie está en racha ganadora este año.") if no player has a positive current win streak in the connected Firestore project.
- Confirm the hero's player name visibly slides up into place on load, and the streak number (if shown) visibly counts up from 0.
- Confirm the 6-award grid below fades/slides in card-by-card (staggered), not all at once.
- Change the season dropdown and confirm the content area cross-fades rather than jumping instantly.
- In your browser devtools, emulate `prefers-reduced-motion: reduce` (Chrome: Rendering tab → "Emulate CSS media feature prefers-reduced-motion"), reload `/awards`, and confirm the hero's name and streak number appear immediately with no slide/count-up animation.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/awards/awardsClient.tsx
git commit -m "feat(web): wire ChampionshipHero and animations into the awards page"
```

---

### Task 5: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full type-check and lint**

Run: `pnpm --filter @fulbito/web exec tsc --noEmit` — expect zero output.
Run: `pnpm --filter @fulbito/web lint` — expect zero new warnings.

- [ ] **Step 2: Confirm mobile is untouched**

Run: `git diff --stat <base-commit>..HEAD -- apps/mobile packages/utils` (where `<base-commit>` is the commit before Task 1) — expect no output, confirming this plan touched only `apps/web` (per the spec's "web-only" scope).

- [ ] **Step 3: Repeat the manual verification from Task 4, Step 4** once more end-to-end after all commits, to catch anything a later task's change might have shifted.
