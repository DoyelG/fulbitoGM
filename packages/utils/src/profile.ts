import type { Role } from '@fulbito/types'

export const roleLabels: Record<Role, string> = {
  USER: 'Usuario',
  PLAYER: 'Jugador',
  ADMIN: 'Administrador',
}

export const positionLabels: Record<string, string> = {
  GK: 'Arquero',
  DEF: 'Defensor',
  MID: 'Mediocampista',
  FWD: 'Delantero',
  PLAYER: 'Cualquier posición',
}
