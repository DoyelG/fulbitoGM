# Web Awards Page — Editorial Redesign with Animation

## Context

Redesign the existing `/awards` page in `apps/web` (built in a prior plan — spec at `docs/superpowers/specs/2026-08-28-web-annual-awards-design.md`) to be visually more innovative, in an "editorial / sports-magazine" style, with animation. Scope is web-only — mobile's Awards screen is untouched.

Confirmed decisions:
- Layout: a full-bleed "cover" hero at the top (mockup variant A, approved), with the existing 6 awards shown as a smaller "index" grid below it — not all 6 treated equally.
- The cover is a **new** metric, not one of the existing 6 `AWARD_DEFS`: "Camino al Campeonato" — the player with the highest **current** win streak (not the existing "longest streak this year" award), showing progress toward a 7-win "championship" threshold. Chosen specifically because the *current* streak resets on a loss, so the cover can change from week to week — more dynamic than a static "always MVP" cover.
- Animation library: `framer-motion` (new dependency, web-only — mobile keeps using `react-native-reanimated`, unrelated).
- Animations: masked/slide text reveal for the cover name, a count-up for the streak number, staggered fade-in for the secondary grid, cross-fade transition when switching years.

## Data layer

New logic lives in `apps/web/src/hooks/use-annual-awards.ts` only (not `packages/utils`) — this metric is web-only for now; if mobile wants it later, extract then, per YAGNI.

```ts
import { calculateAllCurrentStreaks } from '@fulbito/utils'

const CHAMPIONSHIP_THRESHOLD = 7

export type ChampionshipProgress = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string
  streak: number
  isChampion: boolean
} | null

function pickChampionshipProgress(players: Player[], matches: Match[]): ChampionshipProgress {
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
```

`useAnnualAwards` calls `pickChampionshipProgress(players, yearMatches)` — the same year-filtered `yearMatches` already used for the 6 existing awards, so the cover respects the season selector exactly like everything else on the page — and adds `championship: ChampionshipProgress` to its returned object, alongside the existing `currentYear`/`availableYears`/`onSelectYear`/`winners`.

Uses `calculateAllCurrentStreaks` from `@fulbito/utils` (already exists, already used by mobile's ranking — no changes needed there). Tie-break by name, matching the convention already used by `pickAwardWinners` for the other 6 awards. A player with no matches, or whose current streak is a loss/draw or 0, is never eligible — matches the same "value <= 0 excluded" spirit as the other awards. If nobody has a positive current win streak, `championship` is `null` and the hero shows a neutral empty state instead of a misleading "0/7".

## Components

### `apps/web/src/components/ChampionshipHero.tsx` (new)

Props: `{ championship: ChampionshipProgress }`. A full-bleed section (`w-full`, gradient background using brand tokens: `bg-gradient-to-br from-[var(--color-brand)] to-[#4c1d95]`) with:

- Label: `"CAMINO AL CAMPEONATO"` (or `"CAMPEÓN 2026"` if `championship.isChampion`).
- Player name: large, bold-italic (`text-5xl font-black italic`), revealed via a masked slide-up animation on mount — an `overflow-hidden` wrapper around a `motion.h1` animating `initial={{ y: '100%' }}` to `animate={{ y: '0%' }}` (a reveal, not a literal `clip-path` animation — simpler and equally effective).
- Progress: `"{streak}/7 VICTORIAS SEGUIDAS"` if not champion, or a `"🏆 CAMPEÓN"` badge if `isChampion`. The number counts up from 0 to `streak` on mount over ~1s, using `framer-motion`'s imperative `animate()` driving a small `useState`, not a static number.
- Empty state (`championship === null`): neutral copy, e.g. `"Todavía nadie está en racha ganadora este año."`, same container, no count-up.
- Respects `prefers-reduced-motion` via framer-motion's `useReducedMotion()` hook: when true, skip the slide/count-up and render the final values immediately — this is a correctness requirement (CLAUDE.md's accessibility rules), not optional polish.

### `apps/web/src/components/AwardCard.tsx` (modified)

No prop changes. Wrapped by a `motion.div` at the call site (in `AwardsClient`) for the staggered entrance rather than modifying `AwardCard` itself, keeping this component purely presentational as it is today.

### `apps/web/src/app/awards/awardsClient.tsx` (modified)

- Renders `<ChampionshipHero championship={championship} />` above the existing year-picker header and the 6-award grid (the grid and header layout are otherwise unchanged, still inside the `max-w-5xl mx-auto` container below the full-bleed hero).
- The 6-award grid's parent becomes a `motion.div` with `variants` (`staggerChildren: 0.08`), each `AwardCard` wrapped in a `motion.div` with fade+slide-up variants (`initial: { opacity: 0, y: 12 }`, `animate: { opacity: 1, y: 0 }`).
- The whole below-hero content (year picker + grid/empty-state) is wrapped in `AnimatePresence mode="wait"` keyed by `currentYear`, with a simple opacity cross-fade (`initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}`) so switching seasons doesn't jump abruptly.

## Dependency

Add `framer-motion` to `apps/web/package.json` (latest stable — compatible with React 19/Next 15).

## Testing

No test runner exists in this repo (unchanged from the prior awards plan). Verification is `tsc --noEmit` + `lint` (both must stay clean) plus manual verification: start the dev server, visit `/awards`, confirm the hero renders (with real data if reachable, or the empty state), the reveal/count-up animations play once on load, the grid staggers in, and switching years cross-fades without a jarring jump. Also manually toggle OS-level "reduce motion" (or the browser's emulation of it in DevTools) and confirm the hero renders instantly with no slide/count-up.
