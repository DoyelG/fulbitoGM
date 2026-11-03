import type { RoleRequestNotification } from '@fulbito/types'

const MINUTE_IN_MS = 60_000

export function getRoleRequestSummary({ data }: RoleRequestNotification): string {
  if (data.requestedRole === 'ADMIN') return 'quiere ser administrador'
  if (data.playerId) return `quiere vincularse con el jugador ${data.playerName}`
  return `quiere vincularse con un jugador nuevo: ${data.playerName}`
}

export function getRoleRequestLabel({ data }: RoleRequestNotification): string {
  return data.requestedRole === 'ADMIN' ? 'Rol de administrador' : 'Vinculación de jugador'
}

export function getTimeAgo(date: Date): string {
  const minutesAgo = Math.floor((Date.now() - date.getTime()) / MINUTE_IN_MS)
  const hoursAgo = Math.floor(minutesAgo / 60)
  const daysAgo = Math.floor(hoursAgo / 24)

  if (minutesAgo < 1) return 'Recién'
  if (hoursAgo < 1) return `Hace ${minutesAgo} min`
  if (daysAgo < 1) return `Hace ${hoursAgo} h`
  return `Hace ${daysAgo} d`
}
