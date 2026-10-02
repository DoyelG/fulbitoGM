# Rediseño de la home web — Diseño

- **Fecha:** 2026-10-02
- **App:** `apps/web`
- **Rama:** `feat/home-redesign`
- **Estado:** aprobado en conversación, pendiente de revisión del spec

## Objetivo

La home actual (`apps/web/src/app/page.tsx`) es un hero estático con 5 cards de navegación y no muestra ningún dato del grupo. La nueva home es **mixta**:

1. Un hero que cuenta **qué pasó en el último partido** y empuja a **preparar el próximo** (acción principal).
2. Dos widgets con datos vivos: **En racha** y **Carrera al campeonato**.
3. **Accesos rápidos** al resto de las secciones, como navegación secundaria.

**Criterios de éxito**
- Al entrar se ve el último resultado sin hacer clic.
- «Preparar partido» es el elemento con más peso visual de la página.
- Funciona sin login, porque las lecturas de Firestore son públicas.
- Tiene estados de carga, error y vacío definidos, sin saltos de layout.
- Cumple WCAG AA y la navegación por teclado completa.

## Dirección visual (aprobada con mockups)

- **Layout B, «Marcador protagonista»:** el hero es un tablero de estadio a todo el ancho. Debajo, una grilla de 2 columnas con los widgets (1 columna en mobile) y al final la fila de accesos rápidos (4 columnas en desktop, 2 en mobile).
- **Estilo del tablero, «Estadio de noche»:**
  - Fondo `--color-night` (#0b0b1a) con un resplandor radial violeta (`--color-brand`) arriba.
  - Marcador grande en peso 900 con `tabular-nums` y un `text-shadow` violeta suave.
  - Etiqueta superior en mayúsculas con tracking amplio, en violeta claro.
  - El equipo ganador va resaltado en naranja claro.
  - CTA sólida en `--color-accent` con sombra naranja y **texto `--color-night`** (blanco sobre #f97316 da ~2.8:1 y no cumple AA; night sobre naranja da ~7:1).
- **Widgets:** cards blancas con `rounded-2xl`, borde `gray-200` y header con título + link «Ver … →» en `brand`.
- **Orden en mobile:** Tablero → Carrera al campeonato → En racha → Accesos rápidos.

Mockups de referencia: `.superpowers/brainstorm/*/content/full-page.html` (local, no versionado).

## Arquitectura

`app/page.tsx` sigue siendo un **server component**: solo compone el layout. Los datos ya los cargan en los stores de Zustand (`usePlayerStore`, `useMatchStore`) `AppBootstrap` y el layout raíz. La home no hace fetch propio.

### Componentes nuevos: `apps/web/src/components/home/`

| Archivo | Tipo | Responsabilidad |
|---|---|---|
| `ScoreboardHero.tsx` | client | Lee `matches` y `matchesInit` del store. Muestra el último partido final con fecha, marcador, nombres de muestra de cada equipo («Juan, Lucas, Nico +4»), MVP y goleadores, más la CTA → `/match` y el link «Ver historial» → `/history`. |
| `StreaksWidget.tsx` | client | Lista separada en «Ganando» (hasta 3) y «Perdiendo» (hasta 2), cada jugador con avatar, nombre y una píldora «N seguidas». Link → `/statistics`. |
| `ChampionshipWidget.tsx` | client | Muestra el líder de `pickChampionshipProgress` con avatar, nombre y «N victorias seguidas», un track de `CHAMPIONSHIP_THRESHOLD` segmentos y el texto «Le faltan N victorias para salir campeón» (o «¡Campeón!» si `isChampion`). Link → `/awards`. |
| `WidgetCard.tsx` | server | Contenedor común: `<section aria-labelledby>`, título `h2`, link opcional «Ver … →» y children. |
| `QuickLinks.tsx` | server | `<nav aria-label="Accesos rápidos">` con 4 links (Jugadores, Estadísticas, Historial, Premios) y sus íconos de `@heroicons/react/24/outline`. |
| `PlayerAvatar.tsx` | sin hooks | Muestra la foto (`photoUrl`) o las iniciales sobre un fondo `brand` suave. Es un componente nuevo porque `PlayerCard` es una card completa y no tiene un avatar chico reutilizable. |

Si algún componente pasa las ~100 líneas, sus estados (skeleton y vacío) se extraen a un archivo hermano.

### Lógica compartida: `packages/utils/src/home.ts`

Son funciones puras, sin imports de framework, exportadas desde `packages/utils/src/index.ts`:

- `pickLatestFinalMatch(matches: Match[]): Match | null`: aplica `onlyFinalMatches` y devuelve el de `date` más reciente. Si hay empate de fecha, gana el `createdAt` más reciente. Los amistosos cuentan y el tablero los marca con «· amistoso».
- `getMatchScorers(match: Match): MatchPlayer[]`: devuelve los jugadores de ambos equipos con `goals > 0`, ordenados por goles de mayor a menor y luego por nombre.
- `parseMatchDate(date: string): Date` y `formatMatchDate(date: string, locale = 'es-AR'): string`: `Match.date` es `YYYY-MM-DD`, y `new Date('YYYY-MM-DD')` lo interpreta como medianoche UTC, lo que en Argentina (UTC-3) muestra el día anterior. Por eso se parsea como fecha local.
- `summarizeTeam(team: MatchPlayer[], visible = 3): string`: arma textos como «Juan, Lucas, Nico +4».
- `getMatchMvpName(match: Match): string | null`: busca el nombre del `mvpId` entre los jugadores del partido.
- `pickStreakLeaders(players: Player[], matches: Match[], opts: { winLimit: number; lossLimit: number }): { winning: StreakLeader[]; losing: StreakLeader[] }`: usa `calculateAllCurrentStreaks`, que ya excluye amistosos, sobre los partidos finales. Filtra rachas con `count >= 2`, ordena por `count` de mayor a menor y luego por nombre, y cruza con `players` para obtener nombre y foto. `StreakLeader = { playerId, playerName, playerPhotoUrl?, count }`.

`isFinal` y `onlyFinalMatches` ya existen en `@fulbito/types` y `@fulbito/utils` y se reutilizan.

### Tokens

Se agrega `--color-night: #0b0b1a` en el bloque `@theme inline` de `globals.css`. Los componentes no usan hex sueltos: los colores salen de los tokens de marca o de la paleta de Tailwind (por ejemplo `violet-300`, `orange-300`, `gray-200`), igual que el resto del código.

## Estados

| Estado | Tablero | Widgets |
|---|---|---|
| `idle` / `loading` | Skeleton del mismo alto y forma con `aria-busy="true"`. | Skeleton de la card con `aria-busy="true"`. |
| `error` | Mensaje «No pudimos cargar los partidos» y botón «Reintentar», que llama a `initLoad`. | Mensaje corto dentro de la card. |
| Sin partidos finales | «Todavía no hay partidos» + CTA «Armá el primero» → `/match`. | — |
| Sin rachas ≥ 2 | — | «Nadie está en racha por ahora». |
| Sin líder | — | «Nadie viene ganando seguido todavía» con el track vacío. |

Los widgets no se ocultan en ningún estado, para que el layout no salte. Las regiones que cambian llevan `aria-live="polite"`.

## Accesibilidad

- Usa landmarks semánticos: `<main>` (layout), `<section>` por bloque, `<nav>` para los accesos y la jerarquía `h1` (sr-only «Inicio») → `h2`.
- El marcador tiene un `aria-label` legible («Equipo A 5, Equipo B 3»). Los números decorativos van con `aria-hidden`.
- La racha se comunica con texto («Ganando» / «Perdiendo», «N seguidas») y no solo con color.
- El track del campeonato es un `role="progressbar"` con `aria-valuenow`, `aria-valuemin`, `aria-valuemax` y `aria-label`.
- La CTA y los links tienen `focus-visible:ring` visible, con offset sobre el fondo oscuro.
- Los textos sobre `--color-night` usan blanco, `gray-300` o `violet-300`, todos ≥ 4.5:1. La CTA usa texto `night` sobre `accent`.
- Las fotos de jugadores llevan `alt=""` porque el nombre siempre está escrito al lado y así el lector de pantalla no lo repite. Los emojis decorativos llevan `aria-hidden`.

## Fuera de alcance

- Mobile (`apps/mobile`): solo se deja la lógica lista en `packages/utils`.
- Cambios en el NavBar o el header.
- Una ruta de detalle por partido.
- Tests unitarios y nuevas dependencias (decisión explícita).

## Verificación

- `pnpm turbo run lint` y typecheck (`tsc --noEmit` en `apps/web` y `packages/utils`).
- `pnpm --filter @fulbito/web build`.
- Revisión visual en el navegador: datos reales, desktop y mobile (375px), estado vacío (forzado temporalmente en local, sin commitear), navegación con teclado y foco visible.
