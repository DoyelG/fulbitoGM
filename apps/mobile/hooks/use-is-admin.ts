/**
 * Hasta tener login en mobile, controlamos acciones de admin con esta bandera.
 * Poné `EXPO_PUBLIC_DEV_IS_ADMIN=true` en `apps/mobile/.env` para activarlas.
 */
export function useIsAdmin(): boolean {
  return process.env.EXPO_PUBLIC_DEV_IS_ADMIN === 'true'
}
