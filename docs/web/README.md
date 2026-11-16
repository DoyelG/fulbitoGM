# Web

Vista general de la app web (`apps/web`): qué hay, cómo se levanta y dónde mirar.

## Estructura general

|           |                                                              |
| --------- | ------------------------------------------------------------ |
| Framework | Next.js 15 (App Router) y React 19                           |
| Estilos   | Tailwind CSS v4                                              |
| Estado    | Zustand 5                                                    |
| Backend   | Firebase: Auth, Firestore y Storage (no hay servidor propio) |
| Deploy    | GitHub Actions → Vercel                                      |

## Cómo está organizada

![Organización de la app web: de izquierda a derecha, Firebase, @fulbito/firebase, los stores y la sesión, las pantallas en src/app y el navegador; debajo, el código de apoyo y dónde se hace cada tipo de cambio](./img/web-flow.svg)

Arriba, el recorrido de un dato, de izquierda a derecha:

1. **Datos:** Firestore, Auth y Storage de Firebase.
2. **Acceso:** las lecturas y escrituras pasan por `@fulbito/firebase`, que se inicializa en `src/lib/firebase.ts` con las variables de `.env.local`. La excepción es `src/store/useVideoClipStore.ts`, que usa el SDK de Firebase directamente.
3. **Estado:** los stores de Zustand (`src/store/`, uno por colección) guardan los datos en memoria y exponen las acciones para modificarlos. Cargan solo los datos del torneo activo (`src/store/active-tournament.ts`), y `useTournamentStore` guarda los torneos del usuario. La sesión y el rol del usuario viven en `FirebaseAuthContext`.
4. **Pantalla:** `layout.tsx` monta la barra de navegación, el proveedor de sesión, la carga inicial (`shared/AppBootstrap`) y dos controles de acceso: `AuthGate` exige iniciar sesión y `ActiveTournamentGate` envía a `/tournaments` si no hay un torneo activo. Cada ruta tiene un `page.tsx` que renderiza su `<ruta>Client.tsx`, el componente cliente que lee los stores y arma la vista con `src/components/`.
5. **Navegador:** la app publicada en Vercel.

Los cálculos vienen de `@fulbito/utils` y los tipos de `@fulbito/types`. `src/hooks/` agrupa lógica que comparten varias pantallas, y `src/lib/` contiene la inicialización de Firebase y atajos a `@fulbito/utils`.

Abajo, dónde se hace cada tipo de cambio y qué otra parte suele requerir ajuste.

## Levantarla

```bash
nvm use                          # Node según .nvmrc
pnpm install                     # desde la raíz, siempre con pnpm
pnpm --filter @fulbito/web dev   # http://localhost:3000
```

Antes necesitás `apps/web/.env.local` (ver abajo). No hay tests: un cambio se comprueba con `pnpm --filter @fulbito/web lint`, `pnpm --filter @fulbito/web build`, `cd apps/web && pnpm exec tsc --noEmit` y probando a mano.

## Variables de entorno

Un único archivo, **`apps/web/.env.local`**, ignorado por git. Pedile los valores a alguien del equipo (no hay `.env.example`).

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false   # true para usar los emuladores de `pnpm emulators`
```

- Se leen solo en `apps/web/src/lib/firebase.ts`. Reiniciá `pnpm dev` al cambiarlas.
- `NEXT_PUBLIC_` las manda al navegador. No es un problema: la config web de Firebase no es secreta. Los datos los protegen `firestore.rules` y `storage.rules`.
- **Si falta la API key, la app no avisa:** falla después con errores de Firebase poco claros. Revisá este archivo primero.
- En producción van en el proyecto de Vercel. El CI usa además `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_FRONTEND_PROJECT_ID`.
- Con `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`, la app se conecta a los emuladores locales en lugar del proyecto real. Si no están levantados, falla con `auth/network-request-failed`.
- `NEXT_PUBLIC_LOCATIONIQ_TOKEN` es un resto: nadie la lee.
- Los scripts de `apps/web/scripts/` usan este archivo más `SEED_EMAIL`, `SEED_PASSWORD` y `NEON_DATABASE_URL`, y **escriben datos reales**.

## Mapa de la app

Cada pantalla pide los datos a un store de Zustand, que los trae de Firebase a través de `@fulbito/firebase`. La lógica de cálculo viene de `@fulbito/utils`. Salvo `/login`, todas las rutas exigen sesión, y las que muestran datos del juego exigen además un torneo activo.

| Ruta                        | Para qué sirve                                                    | Quién puede                      |
| --------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| `/`                         | Próximo partido, último resultado, campeonato                     | Miembros                         |
| `/login`                    | Ingresar o registrarse                                            | Todos                            |
| `/tournaments`              | Mis torneos e invitaciones; crear un torneo                       | Con sesión                       |
| `/tournaments/[id]`         | Detalle del torneo y mensajes                                     | Ver: miembros. Editar: admins    |
| `/tournaments/[id]/members` | Miembros, invitaciones y roles                                    | Ver: miembros. Gestionar: admins |
| `/players`, `/players/[id]` | Plantel y detalle de cada jugador                                 | Ver: miembros. Editar: admins    |
| `/match`                    | Armar equipos y crear un partido                                  | Armar: miembros. Guardar: admins |
| `/history`, `/history/[id]` | Historial y detalle de cada partido; cargar o editar resultados   | Ver: miembros. Editar: admins    |
| `/statistics`               | Estadísticas por jugador, filtrables por modo, tipo, año y estado | Miembros                         |
| `/awards`                   | Premios y Salón de la Fama                                        | Miembros                         |
| `/profile`                  | Mi cuenta y pedido para vincular mi jugador                       | Con sesión                       |
| `/api/match-image`          | Genera la imagen de un partido para compartir                     | —                                |

"Miembros" y "admins" se refieren al torneo activo. Roles por torneo: `OWNER` (quien lo creó), `ADMIN` y `MEMBER`; se asignan al invitar a alguien por mail y el owner los puede cambiar. Un miembro pide vincularse a un jugador desde `/profile` y lo aprueba un admin. Las reglas de Firestore exigen ser admin del torneo para escribir jugadores, partidos y canchas, así que ocultar un botón no es la única protección.

## Dónde está cada cosa

| Qué buscás                | Dónde                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| Una pantalla              | `apps/web/src/app/<ruta>/` (casi siempre un `page.tsx` y un `*Client.tsx`) |
| Componentes reutilizables | `apps/web/src/components/`                                                 |
| Stores (datos)            | `apps/web/src/store/`, uno por colección                                   |
| Sesión y rol              | `apps/web/src/contexts/FirebaseAuthContext.tsx`                            |
| Colores y tema            | `apps/web/src/app/globals.css`                                             |

Cada store carga su colección con `initLoad()` y vuelve a traerla entera después de cada cambio. Los equipos de un partido están en la colección `matchPlayers`, no dentro de `matches`.
