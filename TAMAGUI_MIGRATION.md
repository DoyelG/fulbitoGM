# Migración a Tamagui (Fulbito) — guía reproducible

Este documento describe **paso a paso** cómo está armada la integración de [Tamagui](https://tamagui.dev/) en el monorepo **fulbitoGM**: paquete compartido `@fulbito/ui`, app **Next.js (web)** y app **Expo (mobile)**. Sirve para **entender**, **replicar desde cero** o **borrar y volver a armar** sin depender de conocimiento previo de Tamagui.

**Versiones usadas en el repo (alinear todas en la misma familia):**

- `tamagui`, `@tamagui/core`, `@tamagui/config-default`: **2.0.0-rc.33** (alinear todas las `@tamagui/*` a la misma versión)
- Next: **15.x**
- Expo SDK: **~54**
- React / React Native: las que fijen `apps/web` y `apps/mobile`

---

## 1. Contexto: qué problema resuelve Tamagui aquí

- **Un solo diseño** para pantallas compartidas (home, badges, diálogos, etc.) en **web** y **nativo**.
- Los componentes viven en `packages/ui` y se consumen como `@fulbito/ui`.
- La **configuración** de Tamagui se centraliza en `packages/ui` y cada app solo elige **plataforma** (`web` vs `native`).

---

## 2. Estructura del monorepo (relevante)

```
fulbitoGM/
  pnpm-workspace.yaml          # workspaces: apps/*, packages/*
  packages/
    ui/                        # @fulbito/ui — Tamagui + componentes compartidos
      package.json
      tamagui.config.ts
      src/
        createConfig.ts
        index.ts
        components/...
        screens/...
  apps/
    web/                       # Next.js
      next.config.ts
      tamagui.config.ts        # re-exporta config del paquete ui
      src/app/TamaguiRoot.tsx
    mobile/                    # Expo
      metro.config.js
      babel.config.js
      tamagui.config.ts        # createFulbitoTamagui('native')
```

---

## 3. Paso a paso — paquete `@fulbito/ui`

### 3.1 Crear el paquete y dependencias

En `packages/ui/package.json`:

- **Dependencies:** `tamagui`, `@tamagui/core`, `@tamagui/config-default` (misma versión en todo el monorepo).
- **Peer:** `react`, `react-native`, y los paquetes `@tamagui/*` alineados.
- **Exports** (importante para consumo limpio):

```json
{
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./tamagui.config": "./tamagui.config.ts",
    "./createConfig": "./src/createConfig.ts"
  }
}
```

Así las apps pueden importar:

- `@fulbito/ui` — componentes y re-exports.
- `@fulbito/ui/tamagui.config` — config por defecto (web en el paquete).
- `@fulbito/ui/createConfig` — fábrica `createFulbitoTamagui('web' | 'native')`.

### 3.2 `createConfig.ts` — una sola fuente, dos plataformas

Archivo: `packages/ui/src/createConfig.ts`.

- Se usa `getDefaultTamaguiConfig('web' | 'native')` de `@tamagui/config-default` según el argumento.
- Se definen **tokens** propios (`createTokens`), por ejemplo colores de marca (`brand`, `border`, etc.).
- Se llama a `createTamagui({ ...base, tokens, themes })` mezclando la config base con temas `light` / `dark` ajustados.

**Regla:** cualquier token nuevo que uses en JSX como `$color.algo` debe existir en `fulbitoTokens.color` (o en el tema), o fallará en tiempo de ejecución / tipos.

### 3.3 `tamagui.config.ts` en el paquete

Archivo: `packages/ui/tamagui.config.ts`.

- Exporta `config = createFulbitoTamagui('web')` (config “por defecto” del paquete para tooling web).
- Incluye **augmentation** de TypeScript:

```ts
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
```

Esto mejora el tipado de `TamaguiProvider` y props temáticas.

### 3.4 `src/index.ts` — barrel público

**No importes rutas internas** tipo `@fulbito/ui/src/screens/...` desde las apps: no están en `exports` del `package.json` y TypeScript / bundlers se quejan.

Patrón recomendado:

1. Exportar **explícitamente** todo lo vuestro (componentes, pantallas, tipos) con `export { ... } from '...'`.
2. Opcional: re-exportar Tamagui con `export * from 'tamagui'` para que también podáis hacer `import { Paragraph } from '@fulbito/ui'`.

**Orden en el barrel:** en este repo el archivo suele verse así (resumen):

```ts
export { config } from '../tamagui.config'
export { createFulbitoTamagui } from './createConfig'
export type { FulbitoTamaguiConfig } from './createConfig'

export * from 'tamagui'

export { HomeFeatureCard, type HomeFeatureCardProps } from './components/HomeFeatureCard'
// ... más exports nombrados (HomeScreen, HOME_NAV_CARDS, etc.)
```

Los símbolos propios van con **`export { ... }` explícito**; eso evita conflictos aunque `export * from 'tamagui'` vaya **antes** de esas líneas.

**Alternativa más estable para el IDE:** mover `export * from 'tamagui'` **al final del archivo** (después de todos los `export { ... }` propios), o eliminar el `export *` y que cada app importe `tamagui` directamente para primitivos.

Si el IDE marca “no exported member” en algo vuestro, revisad: (1) que el símbolo esté en un `export { ... }` explícito, (2) orden del `export * from 'tamagui'`, (3) que no importéis `@fulbito/ui/src/...`.

### 3.5 Componentes compartidos

- Usar primitivos Tamagui: `YStack`, `XStack`, `Paragraph`, `Text`, `ScrollView`, etc.
- Para estilos responsive: props `$gtSm`, `$gtMd`, `$gtLg` (según la `media` de la config default).
- `Platform.OS === 'web'` solo cuando haga falta CSS que no existe en RN (por ejemplo ciertos `backgroundImage` / gradientes en web).

---

## 4. Paso a paso — app Web (Next.js)

### 4.1 Dependencias en `apps/web/package.json`

Incluir al menos:

- `tamagui`, `@tamagui/core`, `@tamagui/config-default` (misma versión que `packages/ui`).
- `@tamagui/next-plugin` — integración Webpack con Next.
- `@tamagui/web`, `@tamagui/react-native-media-driver` — según la guía Tamagui para Next.
- `react-native-web` — Tamagui renderiza muchas piezas vía API compatible con RN.

### 4.2 `transpilePackages` en `next.config.ts`

Añadir los workspaces que importan JSX/TS moderno, por ejemplo:

```ts
transpilePackages: ['@fulbito/utils', '@fulbito/types', '@fulbito/ui', '@fulbito/state']
```

Sin esto, Next puede no transpilar bien `@fulbito/ui`.

### 4.3 `withTamagui` y `tamagui.config.ts` en la app

`apps/web/tamagui.config.ts` re-exporta la config del paquete para que el plugin resuelva la misma fuente:

```ts
import fulbitoConfig from '@fulbito/ui/tamagui.config'
export default fulbitoConfig
```

`next.config.ts`:

```ts
import { withTamagui } from '@tamagui/next-plugin'

const nextConfig = { /* transpilePackages, webpack... */ }

export default withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui'],
})(nextConfig)
```

### 4.4 Parche Webpack para `.tamagui.css` (obligatorio en este proyecto)

**Síntoma:** en desarrollo, error tipo `parentNode` nulo al insertar CSS, o estilos Tamagui rotos.

**Causa:** el loader de CSS que registra `@tamagui/next-plugin` para `*.tamagui.css` puede quedar con un contexto que no marca `hasAppDir` / App Router correctamente, y la cadena de loaders no usa el extractor adecuado.

**Solución aplicada:** función `fixTamaguiCssRule` en `next.config.ts` que:

- Localiza el bloque `oneOf` de reglas CSS de Webpack.
- Sustituye (o inserta) la regla para `test: /\.tamagui\.css$/` usando `getGlobalCssLoader` con un `ConfigurationContext` donde **`hasAppDir: true`** e **`isAppDir: true`**.

Si rehacéis Next desde cero, **copiad esa función y el `webpack` hook** tal cual o equivalente; sin eso el fallo puede volver.

### 4.5 `TamaguiProvider` en el árbol de React

Archivo típico: `apps/web/src/app/TamaguiRoot.tsx` (Client Component):

```tsx
'use client'
import { TamaguiProvider } from 'tamagui'
import config from '../../tamagui.config'

export default function TamaguiRoot({ children }) {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      {children}
    </TamaguiProvider>
  )
}
```

Envolver el layout o `AppShell` con este root **por encima** de cualquier componente Tamagui.

### 4.6 Imports en páginas

- Pantallas y UI compartida: `import { HomeScreen, ... } from '@fulbito/ui'`.
- Primitivos sueltos: `import { Paragraph } from 'tamagui'` o desde `@fulbito/ui` si re-exportáis `tamagui` al final del barrel.

**No usar:** `import ... from '@fulbito/ui/src/...'`.

---

## 5. Paso a paso — app Mobile (Expo)

### 5.1 Dependencias

En `apps/mobile/package.json`:

- `tamagui`, `@tamagui/core`, `@tamagui/config-default` (misma versión).
- `@tamagui/metro-plugin` — integración Metro.
- `@tamagui/babel-plugin` — optimización / extracción en build.

### 5.2 `metro.config.js` — monorepo + Tamagui

Patrón usado:

- `getDefaultConfig` de `expo/metro-config` con `{ isCSSEnabled: true }` si usáis CSS web en Expo web.
- `watchFolders` apuntando a la **raíz del monorepo** para que Metro vea `packages/ui`.
- `resolver.nodeModulesPaths` incluyendo `node_modules` de la app y de la raíz (evita resoluciones duplicadas).
- Envolver con `withTamagui(config, { components: ['tamagui'], config: './tamagui.config.ts' })`.

### 5.3 `babel.config.js`

Plugin `@tamagui/babel-plugin` con:

- `components: ['tamagui']`
- `config: './tamagui.config.ts'`
- `disableExtraction: process.env.NODE_ENV === 'development'` (opcional, acelera dev).

### 5.4 `apps/mobile/tamagui.config.ts`

Debe usar la variante **native**:

```ts
import { createFulbitoTamagui } from '@fulbito/ui/createConfig'
export default createFulbitoTamagui('native')
```

**Importante:** no reutilizar por error solo el `tamagui.config` del paquete pensado para `web` si Metro espera el entry native; aquí se fuerza `'native'` explícitamente.

### 5.5 Provider en mobile

Igual que en web: envolver la app con `TamaguiProvider` y el **mismo patrón de config** que cargue `createFulbitoTamagui('native')` (según cómo montéis el root en Expo).

---

## 6. Cómo migrar una pantalla “a Tamagui”

1. Mover o crear el componente en `packages/ui` (o en la app si es solo web).
2. Sustituir `div`/`span`/estilos sueltos por `YStack`/`XStack`/`Paragraph`/`Text` y tokens `$color.*`, `$background`, etc.
3. Sustituir media queries CSS por props `$gtSm` / `$gtMd` / `$gtLg` cuando corresponda.
4. Exportar el símbolo desde `packages/ui/src/index.ts` con **nombre explícito**.
5. En web/mobile, importar solo desde `@fulbito/ui`.

---

## 7. UI y layout web (opcional, hecho en este repo)

No es parte “core” de Tamagui, pero convive con la migración:

- Clase **`.app-viewport`** en `apps/web/src/app/globals.css`: ancho máximo `min(100vw - 2rem, 1920px)` para que las páginas no queden una columna angosta en desktop.
- **`AppShell`**: navegación responsive; en móvil fila superior **logo + auth** (`NavAuth`), fila inferior enlaces; en desktop una sola barra. Evita overflow a ~375px y mantiene “Entrar” dentro de la franja de marca.

Si rehacéis solo Tamagui, podéis simplificar el shell; si rehacéis layout, revisad también `globals.css` y `AppShell.tsx`.

---

## 8. Troubleshooting — lista corta y accionable

### 8.1 `Cannot find module '@fulbito/ui/src/...'`

- **Causa:** import profundo fuera de `exports` del `package.json`.
- **Fix:** importar desde `@fulbito/ui` y exportar el tipo/componente en `src/index.ts`.

### 8.2 `Module '"@fulbito/ui"' has no exported member 'X'`

- **Causa:** barrel / orden de `export * from 'tamagui'` o falta de export nombrado.
- **Fix:** añadir `export { X } from '...'` explícito; o poner `export * from 'tamagui'` **después** de los exports locales; preferible exports nombrados para APIs propias.

### 8.3 Error `parentNode` / CSS roto en Next dev

- **Causa:** regla Webpack para `*.tamagui.css` incorrecta con App Router.
- **Fix:** aplicar el parche documentado en la sección 4.4 (o equivalente actualizado en docs Tamagui + Next 15).

### 8.4 Metro no resuelve `@fulbito/ui` o duplicados de `react`

- **Causa:** monorepo sin `watchFolders` / `nodeModulesPaths`.
- **Fix:** revisar `metro.config.js` como en la sección 5.2; asegurar una sola copia de `react` (resolución desde app + root).

### 8.5 Estilos distintos entre web y nativo

- **Causa:** props solo válidas en web (`style` con CSS) o tokens distintos.
- **Fix:** usar primitivos Tamagui; condicionar con `Platform.OS === 'web'` solo lo imprescindible.

### 8.6 `useMedia()` / layout que “parpadea”

- **Causa:** hidratación: valor distinto servidor vs cliente.
- **Fix:** Tamagui suele manejarlo; si molesta, diferir UI crítica a `useEffect` o usar valores por defecto móvil-first.

### 8.7 Versiones mezcladas de `@tamagui/*`

- **Síntoma:** errores raros en build o runtime.
- **Fix:** misma versión exacta en `packages/ui`, `apps/web`, `apps/mobile`; `pnpm why tamagui` para auditar.

---

## 9. Comprobaciones antes de dar por cerrada la migración

Desde la raíz del monorepo (ajustad comandos si usáis otro package manager):

```bash
pnpm install
cd apps/web && pnpm exec tsc --noEmit && pnpm exec next build
cd ../mobile && pnpm exec tsc --noEmit
```

- Web: home y páginas que usen `@fulbito/ui` sin errores de tipos; build sin fallos de CSS.
- Mobile: bundler arranca; pantallas con componentes `@fulbito/ui` renderizan.

---

## 10. Si borráis todo y lo volvéis a armar — checklist mínimo

1. `packages/ui` con `createConfig.ts`, `tamagui.config.ts`, `exports` en `package.json`, barrel `src/index.ts` (exports nombrados + `export * from 'tamagui'` al final).
2. `apps/web`: dependencias Tamagui + `react-native-web`, `withTamagui`, `tamagui.config.ts` re-export, `TamaguiRoot`, `transpilePackages`, **parche Webpack `.tamagui.css`**.
3. `apps/mobile`: `@tamagui/metro-plugin`, `babel` plugin, `metro` monorepo, `tamagui.config.ts` con `'native'`.
4. Misma **versión** de todos los paquetes `@tamagui/*` y `tamagui` en todo el repo.
5. Ningún import `@fulbito/ui/src/...`.
6. Ejecutar `tsc` y `next build` / Expo como en la sección 9.

Con esto deberías poder reproducir la integración end-to-end o enseñar a otra persona a hacerlo sin atajos omitidos.
