import {
  getFirestore, collection, doc,
  getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore'
import type { Match, MatchPlayer } from '@fulbito/types'
import { incrementShirtDuty } from './players'

function docToMatch(id: string, data: Record<string, any>): Match {
  return {
    id,
    date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
    type: data.type,
    name: data.name ?? undefined,
    teamAScore: data.teamAScore,
    teamBScore: data.teamBScore,
    teamA: data.teamA ?? [],
    teamB: data.teamB ?? [],
    shirtsResponsibleId: data.shirtsResponsibleId ?? null,
  }
}

export async function getMatches(): Promise<Match[]> {
  const db = getFirestore()
  const snap = await getDocs(query(collection(db, 'matches'), orderBy('date', 'desc')))
  return snap.docs.map(d => docToMatch(d.id, d.data()))
}

export async function getMatch(id: string): Promise<Match | null> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, 'matches', id))
  return snap.exists() ? docToMatch(snap.id, snap.data()) : null
}

export async function createMatch(data: Omit<Match, 'id'>): Promise<string> {
  const db = getFirestore()
  const ref = await addDoc(collection(db, 'matches'), {
    date: Timestamp.fromDate(new Date(data.date)),
    type: data.type,
    name: data.name ?? null,
    teamAScore: data.teamAScore,
    teamBScore: data.teamBScore,
    teamA: data.teamA,
    teamB: data.teamB,
    shirtsResponsibleId: data.shirtsResponsibleId ?? null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  if (data.shirtsResponsibleId) {
    await incrementShirtDuty(data.shirtsResponsibleId, 1)
  }
  return ref.id
}

export async function updateMatch(id: string, data: Partial<Omit<Match, 'id'>>): Promise<void> {
  const db = getFirestore()
  const existing = await getMatch(id)

  const update: Record<string, any> = { ...data, updatedAt: Timestamp.now() }
  if (data.date) update.date = Timestamp.fromDate(new Date(data.date))

  await updateDoc(doc(db, 'matches', id), update)

  // Adjust shirt duty counts if responsible player changed
  if (existing && 'shirtsResponsibleId' in data) {
    const oldId = existing.shirtsResponsibleId
    const newId = data.shirtsResponsibleId
    if (oldId !== newId) {
      if (oldId) await incrementShirtDuty(oldId, -1)
      if (newId) await incrementShirtDuty(newId, 1)
    }
  }
}

export async function deleteMatch(id: string): Promise<void> {
  const db = getFirestore()
  const match = await getMatch(id)
  await deleteDoc(doc(db, 'matches', id))
  if (match?.shirtsResponsibleId) {
    await incrementShirtDuty(match.shirtsResponsibleId, -1)
  }
}
