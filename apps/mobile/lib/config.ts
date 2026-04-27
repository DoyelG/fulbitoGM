/**
 * URL del API (Next backend). En dispositivo físico usá la IP de tu máquina
 * (ej. http://192.168.1.10:3001). Emulador Android: a veces hace falta http://10.0.2.2:3001
 */
export function getBackendUrl(): string {
  return process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'
}
