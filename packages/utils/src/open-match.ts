import type { Match, OpenMatchInput } from '@fulbito/types'
import { formatLongMatchDate } from './home'
import { formatMatchClock, parseMatchDate } from './match'

export const OPEN_MATCH_WAITLIST_SIZE = 4

const HOUR_MS = 3_600_000
export const OPEN_MATCH_LOCK_HOURS = 24
export const OPEN_MATCH_WAITLIST_ONLY_HOURS = 48

export type Convocatoria = 'preselected' | 'open'

export type OpenMatchLockReason = 'started' | 'locked24h' | 'needsWaitlist48h' | 'full' | null

export type OpenMatchPosition = 'confirmed' | 'waitlist' | null

export type OpenMatchSignups = {
  confirmed: string[]
  waitlist: string[]
  capacity: number
  spotsLeft: number
  waitlistLeft: number
  isFull: boolean
}

export type OpenMatchState = OpenMatchSignups & {
  myPosition: OpenMatchPosition
  canJoin: boolean
  canLeave: boolean
  lockReason: OpenMatchLockReason
}

type OpenMatchLike = Pick<Match, 'status' | 'type' | 'signups' | 'capacity' | 'startsAt'>

export function playersPerTeam(matchType: string): number {
  const parsed = Number.parseInt(matchType.split('v')[0] ?? '', 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function openMatchCapacity(match: Pick<Match, 'type' | 'capacity'>): number {
  return match.capacity ?? playersPerTeam(match.type) * 2
}

export function buildOpenMatchStartsAt(date: string, hour: number): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, hour).toISOString()
}

export function canResizeOpenMatch(signupCount: number, matchType: string): boolean {
  return signupCount <= playersPerTeam(matchType) * 2 + OPEN_MATCH_WAITLIST_SIZE
}

export function splitSignups(match: Pick<Match, 'type' | 'capacity' | 'signups'>): OpenMatchSignups {
  const capacity = openMatchCapacity(match)
  const signups = match.signups ?? []
  const confirmed = signups.slice(0, capacity)
  const waitlist = signups.slice(capacity, capacity + OPEN_MATCH_WAITLIST_SIZE)
  return {
    confirmed,
    waitlist,
    capacity,
    spotsLeft: Math.max(0, capacity - confirmed.length),
    waitlistLeft: Math.max(0, OPEN_MATCH_WAITLIST_SIZE - waitlist.length),
    isFull: signups.length >= capacity + OPEN_MATCH_WAITLIST_SIZE,
  }
}

function hoursUntil(startsAt: string | null | undefined, now: Date): number {
  if (!startsAt) return Number.POSITIVE_INFINITY
  return (new Date(startsAt).getTime() - now.getTime()) / HOUR_MS
}

export function getOpenMatchState(match: OpenMatchLike, myPlayerId: string | null, now: Date): OpenMatchState {
  const split = splitSignups(match)
  const signups = match.signups ?? []
  const index = myPlayerId ? signups.indexOf(myPlayerId) : -1
  const myPosition: OpenMatchPosition = index < 0 ? null : index < split.capacity ? 'confirmed' : 'waitlist'
  const hours = hoursUntil(match.startsAt, now)
  const started = hours <= 0
  const leaveLocked = hours < OPEN_MATCH_LOCK_HOURS
  const waitlistOnly = hours < OPEN_MATCH_WAITLIST_ONLY_HOURS
  const needsWaitlist = myPosition === 'confirmed' && waitlistOnly && split.waitlist.length === 0
  const open = match.status === 'open'

  let lockReason: OpenMatchLockReason = null
  if (started) lockReason = 'started'
  else if (myPosition !== null && leaveLocked) lockReason = 'locked24h'
  else if (needsWaitlist) lockReason = 'needsWaitlist48h'
  else if (myPosition === null && split.isFull) lockReason = 'full'

  return {
    ...split,
    myPosition,
    canJoin: open && myPlayerId !== null && myPosition === null && !started && !split.isFull,
    canLeave: open && myPosition !== null && !leaveLocked && !needsWaitlist,
    lockReason,
  }
}

export function openMatchLockMessage(reason: OpenMatchLockReason): string | null {
  switch (reason) {
    case 'started':
      return 'El partido ya empezó: solo un admin puede cambiar la lista.'
    case 'locked24h':
      return 'Faltan menos de 24 hs: ya no podés bajarte. Si no podés ir, avisale a un admin.'
    case 'needsWaitlist48h':
      return 'Faltan menos de 48 hs: solo podés bajarte si hay alguien en la lista de espera.'
    case 'full':
      return 'La lista y la lista de espera están completas.'
    default:
      return null
  }
}

export type OpenMatchAction = {
  label: string
  kind: 'join' | 'leave'
  enabled: boolean
}

export function getOpenMatchAction(state: OpenMatchState): OpenMatchAction {
  if (state.myPosition === 'confirmed') return { label: 'Bajarme', kind: 'leave', enabled: state.canLeave }
  if (state.myPosition === 'waitlist') return { label: 'Salir de la espera', kind: 'leave', enabled: state.canLeave }
  if (state.lockReason === 'started') return { label: 'Inscripción cerrada', kind: 'join', enabled: false }
  if (state.isFull) return { label: 'Lista completa', kind: 'join', enabled: false }
  if (state.spotsLeft > 0) return { label: 'Inscribirme', kind: 'join', enabled: state.canJoin }
  return {
    label: `Anotarme en espera (${state.waitlist.length}/${OPEN_MATCH_WAITLIST_SIZE})`,
    kind: 'join',
    enabled: state.canJoin,
  }
}

export function openMatchSummary(state: Pick<OpenMatchSignups, 'spotsLeft' | 'waitlist'>): string {
  if (state.spotsLeft > 1) return `Se armó un partido abierto · faltan ${state.spotsLeft} jugadores`
  if (state.spotsLeft === 1) return 'Se armó un partido abierto · falta 1 jugador'
  return state.waitlist.length > 0 ? `Lista completa · ${state.waitlist.length} en espera` : 'Lista completa'
}

export function addSignup(signups: string[], playerId: string, capacity: number): string[] {
  if (signups.includes(playerId)) return signups
  if (signups.length >= capacity + OPEN_MATCH_WAITLIST_SIZE) {
    throw new Error('La lista está completa')
  }
  return [...signups, playerId]
}

export function removeSignup(signups: string[], playerId: string): string[] {
  return signups.filter((id) => id !== playerId)
}

export function buildOpenMatchAnnouncement(authorName: string, match: OpenMatchInput): string {
  const { hour } = parseMatchDate(match)
  const longDate = formatLongMatchDate(match.date)
  const date = longDate.charAt(0).toUpperCase() + longDate.slice(1)
  const schedule = hour === null ? `Fecha: ${date}` : `Fecha: ${date} · Hora: ${formatMatchClock(hour)} hs`
  const title = match.name?.trim() ? `${match.name.trim()} · ${match.type}` : `Partido ${match.type}`
  const location = match.location
    ? `Ubicación: ${[match.location.name, match.location.street].filter(Boolean).join(', ')}`
    : null
  return [`${authorName} creó un partido abierto`, title, schedule, location].filter(Boolean).join('\n')
}
