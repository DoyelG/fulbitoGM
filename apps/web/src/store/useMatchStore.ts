import { create } from 'zustand'
import type { Match, MatchPlayer } from '@fulbito/types'
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

async function fetchMatches(): Promise<Match[]> {
  const [matchSnap, mpSnap, playerSnap] = await Promise.all([
    getDocs(query(collection(db, 'matches'), orderBy('date', 'desc'))),
    getDocs(collection(db, 'matchPlayers')),
    getDocs(collection(db, 'players')),
  ])

  const playerNames = new Map<string, string>(
    playerSnap.docs.map(d => [d.id, d.data().name as string])
  )

  const teamsByMatch = new Map<string, { A: MatchPlayer[]; B: MatchPlayer[] }>()
  for (const d of mpSnap.docs) {
    const mp = d.data()
    if (!teamsByMatch.has(mp.matchId)) teamsByMatch.set(mp.matchId, { A: [], B: [] })
    const entry: MatchPlayer = {
      id: mp.playerId,
      name: playerNames.get(mp.playerId) ?? '',
      goals: mp.goals,
      performance: mp.performance,
    }
    teamsByMatch.get(mp.matchId)![mp.team as 'A' | 'B'].push(entry)
  }

  return matchSnap.docs.map(d => {
    const data: DocumentData = d.data()
    const teams = teamsByMatch.get(d.id) ?? { A: [], B: [] }
    return {
      id: d.id,
      date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
      type: data.type,
      name: data.name ?? undefined,
      teamAScore: data.teamAScore,
      teamBScore: data.teamBScore,
      teamA: teams.A,
      teamB: teams.B,
      shirtsResponsibleId: data.shirtsResponsibleId ?? null,
      mvpId: data.mvpId ?? null,
    }
  })
}

type MatchStore = {
  matches: Match[]
  matchesInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addMatch: (m: Omit<Match, 'id'>) => Promise<string>
  updateMatch: (id: string, m: Omit<Match, 'id'>) => Promise<void>
  deleteMatch: (id: string) => Promise<void>
  hydrateMatches: (matches: Match[]) => void
  resetAndReload: () => Promise<void>
}

export const useMatchStore = create<MatchStore>()((set, get) => ({
  matches: [],
  matchesInit: 'idle',
  initLoad: async () => {
    const state = get().matchesInit
    if (state === 'loading' || state === 'loaded') return
    set({ matchesInit: 'loading' })
    try {
      const data = await fetchMatches()
      set({ matches: data, matchesInit: 'loaded' })
    } catch {
      set({ matchesInit: 'error' })
    }
  },
  hydrateMatches: (matches) => {
    set({ matches, matchesInit: 'loaded' })
  },
  addMatch: async (m) => {
    const { teamA, teamB, mvpId, ...rest } = m
    const ref = await addDoc(collection(db, 'matches'), {
      ...rest,
      mvpId: mvpId ?? null,
      date: Timestamp.fromDate(new Date(m.date)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    const players = [
      ...teamA.map(p => ({ ...p, team: 'A' })),
      ...teamB.map(p => ({ ...p, team: 'B' })),
    ]
    await Promise.all(players.map(p =>
      addDoc(collection(db, 'matchPlayers'), {
        matchId: ref.id,
        playerId: p.id,
        team: p.team,
        goals: p.goals,
        performance: p.performance,
      })
    ))
    await get().resetAndReload()
    return ref.id
  },
  updateMatch: async (id, m) => {
    const { teamA, teamB, mvpId, ...rest } = m
    await updateDoc(doc(db, 'matches', id), {
      ...rest,
      mvpId: mvpId ?? null,
      date: Timestamp.fromDate(new Date(m.date)),
      updatedAt: Timestamp.now(),
    })
    // Replace matchPlayers: delete existing, write new
    const existing = await getDocs(query(collection(db, 'matchPlayers')))
    const toDelete = existing.docs.filter(d => d.data().matchId === id)
    await Promise.all(toDelete.map(d => deleteDoc(d.ref)))
    const players = [
      ...teamA.map(p => ({ ...p, team: 'A' })),
      ...teamB.map(p => ({ ...p, team: 'B' })),
    ]
    await Promise.all(players.map(p =>
      addDoc(collection(db, 'matchPlayers'), {
        matchId: id,
        playerId: p.id,
        team: p.team,
        goals: p.goals,
        performance: p.performance,
      })
    ))
    await get().resetAndReload()
  },
  deleteMatch: async (id) => {
    await deleteDoc(doc(db, 'matches', id))
    // Clean up associated matchPlayers
    const mpSnap = await getDocs(collection(db, 'matchPlayers'))
    await Promise.all(mpSnap.docs.filter(d => d.data().matchId === id).map(d => deleteDoc(d.ref)))
    await get().resetAndReload()
  },
  resetAndReload: async () => {
    const data = await fetchMatches()
    set({ matches: data, matchesInit: 'loaded' })
  },
}))
