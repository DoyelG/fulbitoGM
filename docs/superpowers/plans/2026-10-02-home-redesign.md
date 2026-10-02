# Rediseño de la home web — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la home estática de `apps/web` por una home mixta con un tablero «estadio de noche» del último partido, la CTA «Preparar el próximo partido», los widgets En racha y Carrera al campeonato, y accesos rápidos.

**Architecture:** `app/page.tsx` sigue siendo un server component que compone piezas cliente chicas en `src/components/home/`. Las piezas leen los stores de Zustand que ya llena `AppBootstrap`. La lógica derivada son funciones puras nuevas en `packages/utils/src/home.ts`, reutilizables desde mobile. El estado de carga combinado se expone desde un hook `use-home-status.ts`.

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS v4 (`@theme inline`, `@utility`), Zustand v5, `@heroicons/react`, `next/image`, `@fulbito/utils` y `@fulbito/types`.

**Spec:** `docs/superpowers/specs/2026-10-02-home-redesign-design.md`

## Global Constraints

- **Rama:** todo se hace en `feat/home-redesign`. No se crean otras ramas ni worktrees.
- **Gestor de paquetes:** se usa `pnpm`. No se agregan dependencias.
- **Sin tests unitarios** (decisión explícita del usuario). La verificación de cada tarea es lint, typecheck y una revisión manual en el navegador.
- **Sin comentarios en el código:** la regla de lint `fulbito/no-comments` está en `error`.
- **Prettier:** `singleQuote`, sin `semi`, `trailingComma: all`, `printWidth: 120`, `tabWidth: 2`.
- **Exports:** los componentes van con `export default` y los tipos y utilidades con exports con nombre.
- **Archivos:** componentes en PascalCase y hooks/utilidades en kebab-case.
- **Colores:** no se usan hex sueltos en componentes, solo tokens (`brand`, `brand-dark`, `accent`, `night`) o la paleta de Tailwind.
- **Token nuevo:** `--color-night: #0b0b1a`.
- **Contraste de la CTA:** `bg-accent` con `text-night`, nunca texto blanco.
- **Foco:** todo link o botón lleva `focus-visible:outline-2 focus-visible:outline-offset-2` con un color visible para su fondo (`outline-white` sobre night y `outline-brand` sobre blanco).
- **Área táctil:** los elementos interactivos tienen al menos `min-h-11` (44px).
- **Textos en español rioplatense:** «Preparar el próximo partido», «Armá el primero», «Ver historial», «Reintentar».
- **Fechas:** nunca se usa `new Date(match.date)`. Se usa `parseMatchDate` o `formatMatchDate` (`Match.date` es `YYYY-MM-DD`).
- **Avatares:** `alt=""`, porque el nombre siempre está escrito al lado.

## Comandos de verificación (se repiten en cada tarea)

```bash
pnpm --filter @fulbito/utils lint
pnpm --filter @fulbito/web lint
pnpm --filter @fulbito/web exec tsc --noEmit
```

Los tres tienen que terminar con exit code 0 y sin errores. `tsc` en web también chequea `packages/utils` y `packages/types`, porque web los importa desde el código fuente.

Servidor de desarrollo para la revisión visual: `pnpm --filter @fulbito/web dev` y abrir `http://localhost:3000/`.

## Review Focus

1. **Fecha corrida un día:** con `Match.date = '2025-09-27'` en un navegador en UTC-3, el tablero tiene que decir «sábado, 27 de septiembre», no viernes 26. Se verifica en la Task 3, contra la fecha cruda de Firestore.
2. **Borrador más nuevo que el último final:** si existe un partido `status: 'draft'` con fecha más reciente, el tablero lo ignora y muestra el último final. Las rachas tampoco lo cuentan. Se verifica en las Tasks 3 y 4.
3. **Dos partidos el mismo día:** el tablero muestra el de `createdAt` más reciente. Se verifica en la Task 3.
4. **Partido sin MVP, sin goles o empatado:** desaparece el segmento «MVP» o «⚽» (sin separadores colgando), ningún equipo se resalta como ganador y el texto para lector de pantalla dice «Empate 2 a 2». Se verifica en la Task 3.
5. **Nombres largos y viewport de 375px:** los nombres de equipos y jugadores se truncan sin romper la grilla del tablero ni empujar la píldora de racha fuera de la card. Se verifica en las Tasks 3, 4 y 6.

Como no hay tests unitarios, cada punto se fija con un paso de verificación manual en la tarea dueña del código. Para forzar casos (empate, sin MVP, borrador) se edita temporalmente el resultado de `pickLatestFinalMatch` dentro del componente, se mira y **se revierte antes del commit**.

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `packages/utils/src/home.ts` | Create | Funciones puras de la home: fecha, último partido, goleadores, MVP, resumen de equipo y líderes de racha. |
| `packages/utils/src/index.ts` | Modify | Re-exportar `./home`. |
| `apps/web/src/app/globals.css` | Modify | Token `--color-night` y utilidades `bg-scoreboard` y `text-glow-brand`. |
| `apps/web/src/hooks/use-home-status.ts` | Create | Estado combinado `loading`, `error` o `ready` de los dos stores, más `retry`. |
| `apps/web/src/components/home/PlayerAvatar.tsx` | Create | Foto o iniciales en dos tamaños. |
| `apps/web/src/components/home/WidgetCard.tsx` | Create | Contenedor `<section>` con título y link «Ver … →». |
| `apps/web/src/components/home/WidgetSkeleton.tsx` | Create | Skeleton de filas con avatar. |
| `apps/web/src/components/home/WidgetError.tsx` | Create | Mensaje de error con botón «Reintentar». |
| `apps/web/src/components/home/ScoreboardHero.tsx` | Create | Tablero con sus estados y la CTA. |
| `apps/web/src/components/home/ScoreboardResult.tsx` | Create | Marcador, equipos, MVP y goleadores de un partido. |
| `apps/web/src/components/home/ScoreboardSkeleton.tsx` | Create | Skeleton oscuro del tablero. |
| `apps/web/src/components/home/StreaksWidget.tsx` | Create | Widget En racha. |
| `apps/web/src/components/home/StreakGroup.tsx` | Create | Lista «Ganando» o «Perdiendo». |
| `apps/web/src/components/home/ChampionshipWidget.tsx` | Create | Widget Carrera al campeonato. |
| `apps/web/src/components/home/ChampionshipTrack.tsx` | Create | Track de N segmentos con `role="progressbar"`. |
| `apps/web/src/components/home/QuickLinks.tsx` | Create | `<nav>` con los 4 accesos. |
| `apps/web/src/app/page.tsx` | Modify (reescritura) | Compone la home. |

---

### Task 1: Funciones puras de la home en `@fulbito/utils`

**Files:**
- Create: `packages/utils/src/home.ts`
- Modify: `packages/utils/src/index.ts`

**Interfaces:**
- Consumes: `onlyFinalMatches` (`packages/utils/src/match.ts`), `calculateAllCurrentStreaks` (`packages/utils/src/playerStats.ts`) y los tipos `Match`, `MatchPlayer` y `Player` de `@fulbito/types`.
- Produces:
  - `parseMatchDate(date: string): Date`
  - `formatMatchDate(date: string, locale?: string): string`
  - `pickLatestFinalMatch(matches: Match[]): Match | null`
  - `getMatchScorers(match: Pick<Match, 'teamA' | 'teamB'>): MatchPlayer[]`
  - `getMatchMvpName(match: Pick<Match, 'teamA' | 'teamB' | 'mvpId'>): string | null`
  - `summarizeTeam(team: MatchPlayer[], visible?: number): string`
  - `type StreakLeader = { playerId: string; playerName: string; playerPhotoUrl?: string; count: number }`
  - `type StreakLeaders = { winning: StreakLeader[]; losing: StreakLeader[] }`
  - `MIN_HOME_STREAK = 2`
  - `pickStreakLeaders(players: Player[], matches: Match[], opts: { winLimit: number; lossLimit: number }): StreakLeaders`

- [ ] **Step 1: Crear `packages/utils/src/home.ts`**

```ts
import type { Match, MatchPlayer, Player } from '@fulbito/types'
import { onlyFinalMatches } from './match'
import { calculateAllCurrentStreaks } from './playerStats'

export const MIN_HOME_STREAK = 2

export type StreakLeader = {
  playerId: string
  playerName: string
  playerPhotoUrl?: string
  count: number
}

export type StreakLeaders = { winning: StreakLeader[]; losing: StreakLeader[] }

export function parseMatchDate(date: string): Date {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatMatchDate(date: string, locale = 'es-AR'): string {
  return parseMatchDate(date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
}

export function pickLatestFinalMatch(matches: Match[]): Match | null {
  let latest: Match | null = null
  for (const m of onlyFinalMatches(matches)) {
    if (!latest || m.date > latest.date || (m.date === latest.date && m.createdAt > latest.createdAt)) {
      latest = m
    }
  }
  return latest
}

export function getMatchScorers(match: Pick<Match, 'teamA' | 'teamB'>): MatchPlayer[] {
  return [...match.teamA, ...match.teamB]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
}

export function getMatchMvpName(match: Pick<Match, 'teamA' | 'teamB' | 'mvpId'>): string | null {
  if (!match.mvpId) return null
  return [...match.teamA, ...match.teamB].find((p) => p.id === match.mvpId)?.name ?? null
}

export function summarizeTeam(team: MatchPlayer[], visible = 3): string {
  const names = team.slice(0, visible).map((p) => p.name.split(/\s+/)[0])
  const rest = team.length - names.length
  return rest > 0 ? `${names.join(', ')} +${rest}` : names.join(', ')
}

function byCountThenName(a: StreakLeader, b: StreakLeader): number {
  return b.count - a.count || a.playerName.localeCompare(b.playerName)
}

export function pickStreakLeaders(
  players: Player[],
  matches: Match[],
  opts: { winLimit: number; lossLimit: number },
): StreakLeaders {
  const streaks = calculateAllCurrentStreaks(onlyFinalMatches(matches))
  const winning: StreakLeader[] = []
  const losing: StreakLeader[] = []

  for (const p of players) {
    const s = streaks[p.id]
    if (!s || s.count < MIN_HOME_STREAK) continue
    const leader: StreakLeader = { playerId: p.id, playerName: p.name, playerPhotoUrl: p.photoUrl, count: s.count }
    if (s.kind === 'win') winning.push(leader)
    else if (s.kind === 'loss') losing.push(leader)
  }

  return {
    winning: winning.sort(byCountThenName).slice(0, opts.winLimit),
    losing: losing.sort(byCountThenName).slice(0, opts.lossLimit),
  }
}
```

- [ ] **Step 2: Re-exportar desde `packages/utils/src/index.ts`**

Agregar una línea al final del archivo, después de `export * from './search'`:

```ts
export * from './home'
```

- [ ] **Step 3: Verificar**

Run:
```bash
pnpm --filter @fulbito/utils lint
pnpm --filter @fulbito/web exec tsc --noEmit
```
Expected: ambos exit 0 y sin errores. Si `tsc` marca `year`, `month` o `day` como `number | undefined` (`noUncheckedIndexedAccess`), reemplazar la desestructuración por `const [year = 1970, month = 1, day = 1] = ...`.

- [ ] **Step 4: Commit**

```bash
git add packages/utils/src/home.ts packages/utils/src/index.ts
git commit -m "feat(utils): add pure helpers for the home dashboard"
```

---

### Task 2: Tokens, hook de estado y piezas base de los widgets

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Create: `apps/web/src/hooks/use-home-status.ts`
- Create: `apps/web/src/components/home/PlayerAvatar.tsx`
- Create: `apps/web/src/components/home/WidgetCard.tsx`
- Create: `apps/web/src/components/home/WidgetSkeleton.tsx`
- Create: `apps/web/src/components/home/WidgetError.tsx`

**Interfaces:**
- Consumes: `useMatchStore` (`matchesInit`, `initLoad`) y `usePlayerStore` (`playersInit`, `initLoad`).
- Produces:
  - Clases Tailwind `bg-night`, `text-night`, `bg-scoreboard` y `text-glow-brand`.
  - `type HomeStatus = 'loading' | 'error' | 'ready'` y `useHomeStatus(): { status: HomeStatus; retry: () => void }`.
  - `<PlayerAvatar name: string photoUrl?: string size?: 'sm' | 'md' />`
  - `<WidgetCard id: string title: string emoji: string href?: string linkLabel?: string busy?: boolean>{children}</WidgetCard>`
  - `<WidgetSkeleton rows: number />`
  - `<WidgetError onRetry: () => void />`

- [ ] **Step 1: Agregar el token y las utilidades en `globals.css`**

Dentro del bloque `@theme inline`, debajo de `--color-brand-contrast: #ffffff;`, agregar:

```css
  --color-night: #0b0b1a;
```

Al final del archivo, después de la regla `button { ... }`, agregar:

```css
@utility bg-scoreboard {
  background:
    radial-gradient(640px 240px at 50% -30%, color-mix(in oklab, var(--color-brand) 60%, transparent), transparent),
    var(--color-night);
}

@utility text-glow-brand {
  text-shadow: 0 0 18px color-mix(in oklab, var(--color-brand) 60%, transparent);
}
```

- [ ] **Step 2: Crear `apps/web/src/hooks/use-home-status.ts`**

```ts
'use client'

import { useCallback } from 'react'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'

export type HomeStatus = 'loading' | 'error' | 'ready'

export function useHomeStatus(): { status: HomeStatus; retry: () => void } {
  const matchesInit = useMatchStore((s) => s.matchesInit)
  const playersInit = usePlayerStore((s) => s.playersInit)
  const loadMatches = useMatchStore((s) => s.initLoad)
  const loadPlayers = usePlayerStore((s) => s.initLoad)

  const status: HomeStatus =
    matchesInit === 'error' || playersInit === 'error'
      ? 'error'
      : matchesInit === 'loaded' && playersInit === 'loaded'
        ? 'ready'
        : 'loading'

  const retry = useCallback(() => {
    void loadMatches()
    void loadPlayers()
  }, [loadMatches, loadPlayers])

  return { status, retry }
}
```

- [ ] **Step 3: Crear `apps/web/src/components/home/PlayerAvatar.tsx`**

```tsx
import Image from 'next/image'

export type PlayerAvatarProps = {
  name: string
  photoUrl?: string
  size?: 'sm' | 'md'
}

const SIZES = {
  sm: { px: 28, className: 'h-7 w-7 text-[11px]' },
  md: { px: 44, className: 'h-11 w-11 text-sm' },
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

export default function PlayerAvatar({ name, photoUrl, size = 'sm' }: PlayerAvatarProps) {
  const { px, className } = SIZES[size]
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt=""
        width={px}
        height={px}
        className={`${className} shrink-0 rounded-full object-cover ring-1 ring-gray-200`}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={`${className} grid shrink-0 place-items-center rounded-full bg-brand/10 font-bold text-brand`}
    >
      {initials(name)}
    </span>
  )
}
```

- [ ] **Step 4: Crear `apps/web/src/components/home/WidgetCard.tsx`**

```tsx
import Link from 'next/link'
import type { ReactNode } from 'react'

export type WidgetCardProps = {
  id: string
  title: string
  emoji: string
  href?: string
  linkLabel?: string
  busy?: boolean
  children: ReactNode
}

export default function WidgetCard({ id, title, emoji, href, linkLabel, busy = false, children }: WidgetCardProps) {
  const titleId = `${id}-title`
  return (
    <section
      aria-labelledby={titleId}
      aria-busy={busy}
      className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-base font-bold text-gray-900">
          <span aria-hidden className="mr-1.5">
            {emoji}
          </span>
          {title}
        </h2>
        {href && linkLabel && (
          <Link
            href={href}
            className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {linkLabel}
            <span aria-hidden className="ml-1">
              →
            </span>
          </Link>
        )}
      </header>
      <div aria-live="polite">{children}</div>
    </section>
  )
}
```

- [ ] **Step 5: Crear `apps/web/src/components/home/WidgetSkeleton.tsx`**

```tsx
export default function WidgetSkeleton({ rows }: { rows: number }) {
  return (
    <div>
      <span className="sr-only">Cargando…</span>
      <div aria-hidden className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Crear `apps/web/src/components/home/WidgetError.tsx`**

```tsx
export default function WidgetError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-700">No pudimos cargar los datos.</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Reintentar
      </button>
    </div>
  )
}
```

- [ ] **Step 7: Verificar**

Run:
```bash
pnpm --filter @fulbito/web lint
pnpm --filter @fulbito/web exec tsc --noEmit
```
Expected: ambos exit 0. Todavía no hay cambio visual porque nada consume estas piezas.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/app/globals.css apps/web/src/hooks/use-home-status.ts apps/web/src/components/home/PlayerAvatar.tsx apps/web/src/components/home/WidgetCard.tsx apps/web/src/components/home/WidgetSkeleton.tsx apps/web/src/components/home/WidgetError.tsx
git commit -m "feat(web): add home tokens, status hook and widget building blocks"
```

---

### Task 3: Tablero «estadio de noche» y página base

**Files:**
- Create: `apps/web/src/components/home/ScoreboardSkeleton.tsx`
- Create: `apps/web/src/components/home/ScoreboardResult.tsx`
- Create: `apps/web/src/components/home/ScoreboardHero.tsx`
- Modify (reescritura completa): `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `pickLatestFinalMatch`, `formatMatchDate`, `getMatchScorers`, `getMatchMvpName` y `summarizeTeam` (Task 1); `useHomeStatus` y las clases `bg-scoreboard`, `text-glow-brand` y `text-night` (Task 2); `useMatchStore((s) => s.matches)`.
- Produces: `<ScoreboardHero />` sin props, y `page.tsx` con la estructura en la que las Tasks 4–6 insertan widgets.

- [ ] **Step 1: Crear `apps/web/src/components/home/ScoreboardSkeleton.tsx`**

```tsx
export default function ScoreboardSkeleton() {
  return (
    <div>
      <span className="sr-only">Cargando el último partido…</span>
      <div aria-hidden className="mx-auto grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
        <div className="mx-auto h-5 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-16 w-36 animate-pulse rounded-xl bg-white/10" />
        <div className="mx-auto h-5 w-24 animate-pulse rounded bg-white/10" />
      </div>
      <div aria-hidden className="mx-auto mt-4 h-4 w-56 animate-pulse rounded bg-white/10" />
    </div>
  )
}
```

- [ ] **Step 2: Crear `apps/web/src/components/home/ScoreboardResult.tsx`**

```tsx
import type { Match } from '@fulbito/types'
import { getMatchMvpName, getMatchScorers, summarizeTeam } from '@fulbito/utils'

type TeamColumnProps = { label: string; summary: string; isWinner: boolean }

function TeamColumn({ label, summary, isWinner }: TeamColumnProps) {
  return (
    <div className="min-w-0">
      <p className={`truncate text-sm font-bold sm:text-lg ${isWinner ? 'text-orange-300' : 'text-white'}`}>{label}</p>
      <p className="hidden truncate text-xs text-gray-300 sm:block">{summary}</p>
    </div>
  )
}

function srSummary(a: number, b: number): string {
  if (a === b) return `Empate ${a} a ${b}`
  return a > b ? `Ganó Equipo A ${a} a ${b}` : `Ganó Equipo B ${b} a ${a}`
}

export default function ScoreboardResult({ match }: { match: Match }) {
  const { teamAScore: a, teamBScore: b } = match
  const mvpName = getMatchMvpName(match)
  const scorers = getMatchScorers(match)
  const details = [
    mvpName ? `⭐ MVP ${mvpName}` : null,
    scorers.length > 0 ? `⚽ ${scorers.map((p) => (p.goals > 1 ? `${p.name} ×${p.goals}` : p.name)).join(', ')}` : null,
  ].filter((d): d is string => d !== null)

  return (
    <div>
      <p className="sr-only">{srSummary(a, b)}</p>
      <div aria-hidden className="mx-auto grid max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
        <TeamColumn label="Equipo A" summary={summarizeTeam(match.teamA)} isWinner={a > b} />
        <p className="text-glow-brand text-6xl leading-none font-black tabular-nums sm:text-7xl">
          {a}
          <span className="mx-2 text-white/35">:</span>
          {b}
        </p>
        <TeamColumn label="Equipo B" summary={summarizeTeam(match.teamB)} isWinner={b > a} />
      </div>
      {details.length > 0 && <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-300">{details.join(' · ')}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Crear `apps/web/src/components/home/ScoreboardHero.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { formatMatchDate, pickLatestFinalMatch } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import ScoreboardResult from './ScoreboardResult'
import ScoreboardSkeleton from './ScoreboardSkeleton'

const FOCUS_ON_DARK = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

export default function ScoreboardHero() {
  const matches = useMatchStore((s) => s.matches)
  const { status, retry } = useHomeStatus()
  const latest = useMemo(() => pickLatestFinalMatch(matches), [matches])
  const isEmpty = status === 'ready' && !latest

  return (
    <section
      aria-labelledby="scoreboard-title"
      aria-busy={status === 'loading'}
      className="bg-scoreboard rounded-3xl px-4 py-8 text-center text-white shadow-xl sm:px-10 sm:py-10"
    >
      <h2 id="scoreboard-title" className="text-xs font-bold tracking-[0.14em] text-violet-300 uppercase">
        {status === 'ready' && latest
          ? `Último partido · ${formatMatchDate(latest.date)}${latest.isFriendly ? ' · amistoso' : ''}`
          : 'Último partido'}
      </h2>

      <div aria-live="polite" className="mt-5">
        {status === 'loading' && <ScoreboardSkeleton />}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-300">No pudimos cargar los partidos.</p>
            <button
              type="button"
              onClick={retry}
              className={`min-h-11 rounded-lg border border-white/30 px-4 text-sm font-semibold hover:bg-white/10 ${FOCUS_ON_DARK}`}
            >
              Reintentar
            </button>
          </div>
        )}
        {isEmpty && <p className="text-lg text-gray-300">Todavía no hay partidos</p>}
        {status === 'ready' && latest && <ScoreboardResult match={latest} />}
      </div>

      <div className="mt-7 flex flex-col items-center gap-2">
        <Link
          href="/match"
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-extrabold text-night shadow-lg shadow-accent/35 transition hover:brightness-110 sm:w-auto ${FOCUS_ON_DARK}`}
        >
          <span aria-hidden>⚽</span>
          {isEmpty ? 'Armá el primero' : 'Preparar el próximo partido'}
        </Link>
        {status === 'ready' && latest && (
          <Link
            href="/history"
            className={`inline-flex min-h-11 items-center rounded px-2 text-sm text-violet-300 underline underline-offset-4 hover:text-white ${FOCUS_ON_DARK}`}
          >
            Ver historial
          </Link>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Reescribir `apps/web/src/app/page.tsx`**

El layout raíz ya envuelve `children` en `<main>`, así que la página **no** debe tener otro `<main>`.

```tsx
import ScoreboardHero from '@/components/home/ScoreboardHero'

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="sr-only">Inicio</h1>
      <ScoreboardHero />
    </div>
  )
}
```

- [ ] **Step 5: Verificar lint y tipos**

Run:
```bash
pnpm --filter @fulbito/web lint
pnpm --filter @fulbito/web exec tsc --noEmit
```
Expected: ambos exit 0.

- [ ] **Step 6: Verificación visual (Review Focus 1–5)**

Run: `pnpm --filter @fulbito/web dev` y abrir `http://localhost:3000/`.

Comprobar:
- Mientras cargan los datos aparece el skeleton oscuro. Después se ve el último partido con marcador, «Equipo A/B», resumen de jugadores en desktop, MVP y goleadores.
- **Fecha (RF1):** buscar el partido más reciente con el MCP `mcp__fulbito__list_matches` o en la consola de Firestore y confirmar que el día de la semana y el número coinciden con su `date` crudo.
- **Borrador (RF2) y mismo día (RF3):** confirmar en esa misma lista que el partido mostrado es el `final` más reciente y no un `draft`.
- **Empate y sin MVP (RF4):** cambiar temporalmente `ScoreboardHero.tsx` para renderizar `<ScoreboardResult match={{ ...latest, teamAScore: 2, teamBScore: 2, mvpId: null, teamA: latest.teamA.map((p) => ({ ...p, goals: 0 })), teamB: latest.teamB.map((p) => ({ ...p, goals: 0 })) }} />`. Ningún equipo debe verse en naranja ni debe quedar una línea de detalles vacía. Con VoiceOver, o inspeccionando el `sr-only`, tiene que decir «Empate 2 a 2». **Revertir el cambio.**
- **Vacío:** cambiar temporalmente `pickLatestFinalMatch(matches)` por `pickLatestFinalMatch([])`. Tiene que aparecer «Todavía no hay partidos», la CTA tiene que decir «Armá el primero» y no tiene que haber link al historial. **Revertir el cambio.**
- **Mobile (RF5):** en DevTools a 375px, el marcador entra sin scroll horizontal, la CTA ocupa todo el ancho y los resúmenes de equipo están ocultos.
- **Teclado:** con Tab se llega a la CTA y después a «Ver historial», ambos con un outline blanco visible.

Volver a correr `git diff` y confirmar que solo quedan los 4 archivos de esta tarea, sin cambios temporales.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/home/ScoreboardSkeleton.tsx apps/web/src/components/home/ScoreboardResult.tsx apps/web/src/components/home/ScoreboardHero.tsx apps/web/src/app/page.tsx
git commit -m "feat(web): replace home hero with night-stadium scoreboard"
```

---

### Task 4: Widget «En racha»

**Files:**
- Create: `apps/web/src/components/home/StreakGroup.tsx`
- Create: `apps/web/src/components/home/StreaksWidget.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `pickStreakLeaders` y `type StreakLeader` (Task 1); `WidgetCard`, `WidgetSkeleton`, `WidgetError`, `PlayerAvatar` y `useHomeStatus` (Task 2).
- Produces: `<StreaksWidget />` sin props.

- [ ] **Step 1: Crear `apps/web/src/components/home/StreakGroup.tsx`**

```tsx
import type { StreakLeader } from '@fulbito/utils'
import PlayerAvatar from './PlayerAvatar'

export type StreakGroupProps = {
  title: string
  kind: 'win' | 'loss'
  leaders: StreakLeader[]
}

const PILL_CLASS = {
  win: 'bg-orange-100 text-orange-800',
  loss: 'bg-sky-100 text-sky-800',
}

export default function StreakGroup({ title, kind, leaders }: StreakGroupProps) {
  if (leaders.length === 0) return null
  return (
    <div>
      <h3 className="mb-1 text-xs font-bold tracking-wider text-gray-600 uppercase">{title}</h3>
      <ul className="divide-y divide-gray-100">
        {leaders.map((l) => (
          <li key={l.playerId} className="flex min-h-11 items-center gap-3 py-1.5">
            <PlayerAvatar name={l.playerName} photoUrl={l.playerPhotoUrl} />
            <span className="min-w-0 truncate font-medium text-gray-900">{l.playerName}</span>
            <span className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${PILL_CLASS[kind]}`}>
              {l.count} seguidas
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Crear `apps/web/src/components/home/StreaksWidget.tsx`**

```tsx
'use client'

import { useMemo } from 'react'
import { pickStreakLeaders } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import StreakGroup from './StreakGroup'
import WidgetCard from './WidgetCard'
import WidgetError from './WidgetError'
import WidgetSkeleton from './WidgetSkeleton'

const LIMITS = { winLimit: 3, lossLimit: 2 }

export default function StreaksWidget() {
  const players = usePlayerStore((s) => s.players)
  const matches = useMatchStore((s) => s.matches)
  const { status, retry } = useHomeStatus()
  const { winning, losing } = useMemo(() => pickStreakLeaders(players, matches, LIMITS), [players, matches])
  const isEmpty = winning.length === 0 && losing.length === 0

  return (
    <WidgetCard
      id="streaks"
      emoji="🔥"
      title="En racha"
      href="/statistics"
      linkLabel="Ver estadísticas"
      busy={status === 'loading'}
    >
      {status === 'loading' && <WidgetSkeleton rows={3} />}
      {status === 'error' && <WidgetError onRetry={retry} />}
      {status === 'ready' && isEmpty && <p className="text-sm text-gray-600">Nadie está en racha por ahora.</p>}
      {status === 'ready' && !isEmpty && (
        <div className="space-y-4">
          <StreakGroup title="Ganando" kind="win" leaders={winning} />
          <StreakGroup title="Perdiendo" kind="loss" leaders={losing} />
        </div>
      )}
    </WidgetCard>
  )
}
```

- [ ] **Step 3: Agregar la grilla de widgets en `apps/web/src/app/page.tsx`**

Reemplazar el archivo completo por:

```tsx
import ScoreboardHero from '@/components/home/ScoreboardHero'
import StreaksWidget from '@/components/home/StreaksWidget'

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="sr-only">Inicio</h1>
      <ScoreboardHero />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:order-1">
          <StreaksWidget />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar lint y tipos**

Run:
```bash
pnpm --filter @fulbito/web lint
pnpm --filter @fulbito/web exec tsc --noEmit
```
Expected: ambos exit 0.

- [ ] **Step 5: Verificación visual**

Con `pnpm --filter @fulbito/web dev` en `http://localhost:3000/`:
- Aparecen hasta 3 jugadores en «Ganando» y hasta 2 en «Perdiendo», con píldora naranja y celeste y el texto «N seguidas».
- Contrastar con `mcp__fulbito__get_streaks`. Los jugadores que aparecen tienen que tener racha ≥ 2 y estar ordenados de mayor a menor. Los amistosos y borradores no cuentan (RF2).
- Si un grupo queda vacío, desaparece su subtítulo. Si los dos quedan vacíos, aparece «Nadie está en racha por ahora.».
- **RF5:** a 375px, un nombre largo se trunca con «…» y la píldora queda dentro de la card.
- El link «Ver estadísticas →» lleva a `/statistics` y tiene un outline violeta con Tab.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/home/StreakGroup.tsx apps/web/src/components/home/StreaksWidget.tsx apps/web/src/app/page.tsx
git commit -m "feat(web): add streaks widget to the home"
```

---

### Task 5: Widget «Carrera al campeonato»

**Files:**
- Create: `apps/web/src/components/home/ChampionshipTrack.tsx`
- Create: `apps/web/src/components/home/ChampionshipWidget.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `pickChampionshipProgress`, `CHAMPIONSHIP_THRESHOLD` y `onlyFinalMatches` (`@fulbito/utils`, ya existentes); `WidgetCard`, `WidgetSkeleton`, `WidgetError`, `PlayerAvatar` y `useHomeStatus` (Task 2).
- Produces: `<ChampionshipWidget />` sin props y `<ChampionshipTrack streak: number label: string />`.

- [ ] **Step 1: Crear `apps/web/src/components/home/ChampionshipTrack.tsx`**

```tsx
import { CHAMPIONSHIP_THRESHOLD } from '@fulbito/utils'

export default function ChampionshipTrack({ streak, label }: { streak: number; label: string }) {
  const filled = Math.min(streak, CHAMPIONSHIP_THRESHOLD)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={CHAMPIONSHIP_THRESHOLD}
      aria-valuenow={filled}
      className="flex gap-1.5"
    >
      {Array.from({ length: CHAMPIONSHIP_THRESHOLD }, (_, i) => (
        <span key={i} className={`h-2.5 flex-1 rounded-full ${i < filled ? 'bg-brand' : 'bg-brand/15'}`} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Crear `apps/web/src/components/home/ChampionshipWidget.tsx`**

```tsx
'use client'

import { useMemo } from 'react'
import { CHAMPIONSHIP_THRESHOLD, onlyFinalMatches, pickChampionshipProgress } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useHomeStatus } from '@/hooks/use-home-status'
import ChampionshipTrack from './ChampionshipTrack'
import PlayerAvatar from './PlayerAvatar'
import WidgetCard from './WidgetCard'
import WidgetError from './WidgetError'
import WidgetSkeleton from './WidgetSkeleton'

function streakLabel(streak: number): string {
  return streak === 1 ? '1 victoria seguida' : `${streak} victorias seguidas`
}

function remainingLabel(streak: number): string {
  const left = CHAMPIONSHIP_THRESHOLD - streak
  if (left <= 0) return '¡Salió campeón!'
  return left === 1 ? 'Le falta 1 victoria para salir campeón' : `Le faltan ${left} victorias para salir campeón`
}

export default function ChampionshipWidget() {
  const players = usePlayerStore((s) => s.players)
  const matches = useMatchStore((s) => s.matches)
  const { status, retry } = useHomeStatus()
  const progress = useMemo(() => pickChampionshipProgress(players, onlyFinalMatches(matches)), [players, matches])
  const trackLabel = `Progreso al campeonato: ${progress?.streak ?? 0} de ${CHAMPIONSHIP_THRESHOLD} victorias`

  return (
    <WidgetCard
      id="championship"
      emoji="🏆"
      title="Carrera al campeonato"
      href="/awards"
      linkLabel="Ver premios"
      busy={status === 'loading'}
    >
      {status === 'loading' && <WidgetSkeleton rows={1} />}
      {status === 'error' && <WidgetError onRetry={retry} />}
      {status === 'ready' && (
        <div className="space-y-3">
          {progress ? (
            <div className="flex min-w-0 items-center gap-3">
              <PlayerAvatar name={progress.playerName} photoUrl={progress.playerPhotoUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-gray-900">{progress.playerName}</p>
                <p className="text-sm text-gray-600">{streakLabel(progress.streak)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Nadie viene ganando seguido todavía.</p>
          )}
          <ChampionshipTrack streak={progress?.streak ?? 0} label={trackLabel} />
          {progress && (
            <p className="text-sm text-gray-700">
              {progress.isChampion ? <strong>{remainingLabel(progress.streak)}</strong> : remainingLabel(progress.streak)}
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
```

- [ ] **Step 3: Agregar el widget en `apps/web/src/app/page.tsx`**

En el DOM, Carrera al campeonato va **antes** que En racha, porque en mobile va primero según el spec. Con `md:order-*` se invierte en desktop. Reemplazar el archivo completo por:

```tsx
import ChampionshipWidget from '@/components/home/ChampionshipWidget'
import ScoreboardHero from '@/components/home/ScoreboardHero'
import StreaksWidget from '@/components/home/StreaksWidget'

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="sr-only">Inicio</h1>
      <ScoreboardHero />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:order-2">
          <ChampionshipWidget />
        </div>
        <div className="md:order-1">
          <StreaksWidget />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar lint y tipos**

Run:
```bash
pnpm --filter @fulbito/web lint
pnpm --filter @fulbito/web exec tsc --noEmit
```
Expected: ambos exit 0.

- [ ] **Step 5: Verificación visual**

Con `pnpm --filter @fulbito/web dev` en `http://localhost:3000/`:
- El líder coincide con el que muestra la sección de campeonato de `/awards`.
- El track tiene 7 segmentos y la cantidad pintada es igual a la racha (como máximo 7).
- Con racha 6 el texto dice «Le falta 1 victoria…». Con racha 1 dice «1 victoria seguida». Para comprobarlo, cambiar temporalmente `progress` por `{ ...progress, streak: 6 }` y después `1`, y con `null` ver el estado vacío. **Revertir el cambio.**
- En desktop, En racha queda a la izquierda y Carrera a la derecha. A 375px, Carrera aparece primero.
- Con VoiceOver o el inspector de accesibilidad, el track se anuncia como barra de progreso con «Progreso al campeonato: N de 7 victorias».

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/home/ChampionshipTrack.tsx apps/web/src/components/home/ChampionshipWidget.tsx apps/web/src/app/page.tsx
git commit -m "feat(web): add championship race widget to the home"
```

---

### Task 6: Accesos rápidos y verificación final

**Files:**
- Create: `apps/web/src/components/home/QuickLinks.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `ChartBarIcon`, `ClockIcon`, `TrophyIcon` y `UserGroupIcon` de `@heroicons/react/24/outline`.
- Produces: `<QuickLinks />` sin props, y la home final.

- [ ] **Step 1: Crear `apps/web/src/components/home/QuickLinks.tsx`**

```tsx
import Link from 'next/link'
import { ChartBarIcon, ClockIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const LINKS = [
  { href: '/players', label: 'Jugadores', Icon: UserGroupIcon },
  { href: '/statistics', label: 'Estadísticas', Icon: ChartBarIcon },
  { href: '/history', label: 'Historial', Icon: ClockIcon },
  { href: '/awards', label: 'Premios', Icon: TrophyIcon },
]

export default function QuickLinks() {
  return (
    <nav aria-label="Accesos rápidos">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {LINKS.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-14 items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 font-semibold text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 2: Versión final de `apps/web/src/app/page.tsx`**

```tsx
import ChampionshipWidget from '@/components/home/ChampionshipWidget'
import QuickLinks from '@/components/home/QuickLinks'
import ScoreboardHero from '@/components/home/ScoreboardHero'
import StreaksWidget from '@/components/home/StreaksWidget'

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="sr-only">Inicio</h1>
      <ScoreboardHero />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:order-2">
          <ChampionshipWidget />
        </div>
        <div className="md:order-1">
          <StreaksWidget />
        </div>
      </div>
      <QuickLinks />
    </div>
  )
}
```

- [ ] **Step 3: Lint, tipos y build**

Run:
```bash
pnpm --filter @fulbito/utils lint
pnpm --filter @fulbito/web lint
pnpm --filter @fulbito/web exec tsc --noEmit
pnpm --filter @fulbito/web build
```
Expected: los cuatro exit 0, y `next build` lista la ruta `/` sin errores ni warnings nuevos.

- [ ] **Step 4: Verificación visual final contra el mockup aprobado**

Con `pnpm --filter @fulbito/web dev`:
- **Desktop (≥1024px):** tablero arriba, En racha a la izquierda y Carrera a la derecha, accesos en 4 columnas. Comparar con `.superpowers/brainstorm/*/content/full-page.html`.
- **Mobile (375px, RF5):** tablero → Carrera → En racha → accesos en 2 columnas, sin scroll horizontal.
- **Teclado:** el recorrido con Tab desde el header es CTA → Ver historial → Ver premios → Ver estadísticas → los 4 accesos, todos con foco visible.
- **Sin login:** abrir en una ventana de incógnito. La home carga los datos igual.
- **Contraste:** en DevTools (Inspect → Accessibility → Contrast), el texto de la CTA y el violeta claro sobre el fondo night dan ≥ 4.5:1.
- `git status` muestra solo los archivos de esta tarea y ningún cambio temporal de verificación.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/home/QuickLinks.tsx apps/web/src/app/page.tsx
git commit -m "feat(web): add quick links and finish home redesign"
```
