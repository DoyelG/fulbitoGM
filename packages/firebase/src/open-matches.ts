import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import type { Match, MatchInput, MatchType, OpenMatchInput } from '@fulbito/types'
import {
  addSignup,
  buildOpenMatchAnnouncement,
  canResizeOpenMatch,
  getOpenMatchState,
  openMatchCapacity,
  playersPerTeam,
  removeSignup,
} from '@fulbito/utils'
import { docToMatchScalars, MATCHES_COLLECTION, updateMatch } from './matches'
import { COMMENTS_COLLECTION, TOURNAMENT_COMMENT_MAX_LENGTH } from './tournament-comments'
import { TOURNAMENTS_COLLECTION } from './tournaments'

export class OpenMatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OpenMatchError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function matchRef(id: string) {
  return doc(getFirestore(), MATCHES_COLLECTION, id)
}

export type OpenMatchAuthor = { uid: string; name: string }

export async function createOpenMatch(
  tournamentId: string,
  data: OpenMatchInput,
  author: OpenMatchAuthor,
): Promise<string> {
  const db = getFirestore()
  const ref = doc(collection(db, MATCHES_COLLECTION))
  const commentRef = doc(collection(db, TOURNAMENTS_COLLECTION, tournamentId, COMMENTS_COLLECTION))
  const authorName = author.name.trim().slice(0, 80)
  const now = Timestamp.now()
  const batch = writeBatch(db)
  batch.set(ref, {
    tournamentId,
    date: Timestamp.fromDate(new Date(data.date)),
    hasTime: data.hasTime ?? true,
    startsAt: Timestamp.fromDate(new Date(data.startsAt)),
    type: data.type,
    status: 'open',
    signups: [],
    capacity: playersPerTeam(data.type) * 2,
    teamAScore: 0,
    teamBScore: 0,
    name: data.name ?? null,
    description: data.description ?? null,
    location: data.location ?? null,
    isFriendly: data.isFriendly ?? false,
    shirtsResponsibleId: null,
    mvpId: null,
    goalkeeperIds: [],
    createdAt: now,
    updatedAt: now,
  })
  batch.set(commentRef, {
    authorUid: author.uid,
    authorName,
    text: buildOpenMatchAnnouncement(authorName, data).slice(0, TOURNAMENT_COMMENT_MAX_LENGTH),
    matchId: ref.id,
    createdAt: serverTimestamp(),
  })
  await batch.commit()
  return ref.id
}

type SignupChange = (match: Omit<Match, 'teamA' | 'teamB'>) => string[]

async function changeSignups(matchId: string, change: SignupChange): Promise<void> {
  await runTransaction(getFirestore(), async (transaction) => {
    const snap = await transaction.get(matchRef(matchId))
    if (!snap.exists()) throw new OpenMatchError('El partido ya no existe')
    const match = docToMatchScalars(snap.id, snap.data() as Record<string, unknown>)
    if (match.status !== 'open') throw new OpenMatchError('La inscripción a este partido ya está cerrada')
    const next = change(match)
    transaction.update(snap.ref, { signups: next, updatedAt: Timestamp.now() })
  })
}

export async function joinOpenMatch(matchId: string, playerId: string): Promise<void> {
  await changeSignups(matchId, (match) => {
    const state = getOpenMatchState(match, playerId, new Date())
    if (!state.canJoin) throw new OpenMatchError('No te podés inscribir a este partido')
    return addSignup(match.signups ?? [], playerId, state.capacity)
  })
}

export async function leaveOpenMatch(matchId: string, playerId: string): Promise<void> {
  await changeSignups(matchId, (match) => {
    const state = getOpenMatchState(match, playerId, new Date())
    if (!state.canLeave) throw new OpenMatchError('No te podés bajar de este partido')
    return removeSignup(match.signups ?? [], playerId)
  })
}

export async function adminAddSignup(matchId: string, playerId: string): Promise<void> {
  await changeSignups(matchId, (match) => addSignup(match.signups ?? [], playerId, openMatchCapacity(match)))
}

export async function adminRemoveSignup(matchId: string, playerId: string): Promise<void> {
  await changeSignups(matchId, (match) => removeSignup(match.signups ?? [], playerId))
}

export function subscribeToMatch(
  matchId: string,
  onChange: (match: Omit<Match, 'teamA' | 'teamB'> | null) => void,
  onError?: (error: Error) => void,
): () => void {
  return onSnapshot(
    matchRef(matchId),
    (snap) => onChange(snap.exists() ? docToMatchScalars(snap.id, snap.data() as Record<string, unknown>) : null),
    (error) => onError?.(error),
  )
}

export async function changeOpenMatchType(matchId: string, type: MatchType): Promise<void> {
  await runTransaction(getFirestore(), async (transaction) => {
    const snap = await transaction.get(matchRef(matchId))
    if (!snap.exists()) throw new OpenMatchError('El partido ya no existe')
    const match = docToMatchScalars(snap.id, snap.data() as Record<string, unknown>)
    if (match.status !== 'open') throw new OpenMatchError('Este partido ya no es abierto')
    if (!canResizeOpenMatch(match.signups?.length ?? 0, type)) {
      throw new OpenMatchError(`Hay demasiados inscriptos para ${type}. Sacá jugadores antes de achicar el partido.`)
    }
    transaction.update(snap.ref, { type, capacity: playersPerTeam(type) * 2, updatedAt: Timestamp.now() })
  })
}

export async function convertOpenMatch(tournamentId: string, matchId: string, data: MatchInput): Promise<void> {
  await updateMatch(tournamentId, matchId, { ...data, status: 'draft' })
}
