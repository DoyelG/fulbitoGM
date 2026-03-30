import { config as loadEnv } from 'dotenv'
import type { ConfigContext, ExpoConfig } from 'expo/config'
import path from 'path'
import { existsSync } from 'fs'

/**
 * Carga `apps/web/.env` al evaluar la config de Expo (solo en la máquina de desarrollo / CI).
 * Solo exponemos `extra.apiUrl` al cliente (misma API que usa Prisma en la web).
 * No incluyas credenciales de DB en el bundle: el móvil habla HTTP con Next, no con Postgres.
 */
function resolveApiUrl(): string {
  const webEnv = path.join(__dirname, '../web/.env')
  if (existsSync(webEnv)) {
    loadEnv({ path: webEnv })
  }
  const explicit = process.env.EXPO_PUBLIC_API_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const nextAuth = process.env.NEXTAUTH_URL?.trim()
  if (nextAuth) return nextAuth.replace(/\/$/, '')
  return 'http://localhost:3000'
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = resolveApiUrl()
  return {
    ...config,
    name: config.name ?? 'mobile',
    slug: config.slug ?? 'mobile',
    extra: {
      ...config.extra,
      apiUrl,
    },
  } as ExpoConfig
}
