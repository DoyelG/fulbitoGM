import type { Role } from '@fulbito/types'

export const roleLabels: Record<Role, string> = {
  USER: 'Usuario',
  PLAYER: 'Jugador',
  ADMIN: 'Administrador',
}

export const positionLabels: Record<string, string> = {
  GK: 'Arquero',
  DEF: 'Defensor',
  MID: 'Medio',
  FWD: 'Delantero',
  PLAYER: 'Jugador',
}

export const positionShortLabels: Record<string, string> = {
  GK: 'ARQ',
  DEF: 'DEF',
  MID: 'MED',
  FWD: 'DEL',
  PLAYER: 'JUG',
}

export const positionOrder = ['GK', 'DEF', 'MID', 'FWD', 'PLAYER']

export const positionOptions = positionOrder.map((value) => ({ value, label: positionLabels[value] }))

export function getPositionLabel(position: string): string {
  return positionLabels[position] ?? position
}

export function splitNameInTwoLines(name: string): [string, string] | null {
  const words = name.trim().split(/\s+/)
  if (words.length < 2) return null
  const total = words.join(' ').length
  let best = 1
  let bestGap = Infinity
  for (let index = 1; index < words.length; index++) {
    const gap = Math.abs(words.slice(0, index).join(' ').length * 2 - total)
    if (gap < bestGap) {
      bestGap = gap
      best = index
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}
