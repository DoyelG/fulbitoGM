'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import SkillBadge from '@/components/SkillBadge'
import StreakBadge from '@/components/StreakBadge'
import { calculateAllCurrentStreaks } from '@/lib/playerStats'
import { useMatchStore, Match } from '@/store/useMatchStore'
import { usePlayerStore, Player } from '@/store/usePlayerStore'
import { useEffect, useMemo, useState, useCallback } from 'react'

export default function PlayersClient({ players: initialPlayers, matches: initialMatches }: { players: Player[]; matches: Match[] }) {
  const { data } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const isAdmin = ((data?.user as unknown as { role?: string })?.role) === 'ADMIN'
  const { deletePlayer, hydratePlayers, players: storePlayers, playersInit } = usePlayerStore()
  const { hydrateMatches, matches: storeMatches, matchesInit } = useMatchStore()

  useEffect(() => {
    if (playersInit !== 'loaded') hydratePlayers(initialPlayers)
    if (matchesInit !== 'loaded') hydrateMatches(initialMatches)
  }, [initialPlayers, initialMatches, hydratePlayers, hydrateMatches, playersInit, matchesInit])

  const streaks = calculateAllCurrentStreaks(storeMatches)

  type SortKey = 'skill' | 'streak' | 'goal7'
  const [sortKey, setSortKey] = useState<SortKey>('skill')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prevDir => (prevDir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }, [sortKey])

  const sortedPlayers = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...storePlayers].sort((a, b) => {
      const sa = a.skill ?? -Infinity
      const sb = b.skill ?? -Infinity
      const stA = streaks[a.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
      const stB = streaks[b.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
      const streakValue = (st: { kind: 'win' | 'loss' | null, count: number }) => st.kind === 'win' ? st.count : st.kind === 'loss' ? -st.count : 0
      const goalA = stA.kind === 'win' ? stA.count : 0
      const goalB = stB.kind === 'win' ? stB.count : 0

      let av: number
      let bv: number
      switch (sortKey) {
        case 'skill':
          av = sa
          bv = sb
          break
        case 'streak':
          av = streakValue(stA)
          bv = streakValue(stB)
          break
        case 'goal7':
          av = goalA
          bv = goalB
          break
      }
      if (av === bv) return 0
      return av > bv ? dir : -dir
    })
  }, [storePlayers, streaks, sortKey, sortDir])

  const selectedPlayer = useMemo(
    () => storePlayers.find((p) => p.id === selectedPlayerId) ?? null,
    [storePlayers, selectedPlayerId],
  );
  const handleDelete = (playerId: string)=>{
    setShowModal(true)
    setSelectedPlayerId(playerId)
  }

  const handleConfirmDelete = ()=>{
    deletePlayer(selectedPlayerId as string)
    setShowModal(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Jugadores</h1>
        {isAdmin && (
          <Link href="/players/new" className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand/90">Agregar jugador</Link>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('skill')}>Habilidad{sortKey==='skill' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Posición</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('streak')}>Racha{sortKey==='streak' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('goal7')}>Objetivo (7W){sortKey==='goal7' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {storePlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-800">
                    No hay jugadores agregados aún.
                    {isAdmin && (
                      <> <Link href="/players/new" className="text-brand hover:underline">Agrega tu primer jugador</Link></>
                    )}
                  </td>
                </tr>
              ) : (
                sortedPlayers.map((player) => {
                  const st = streaks[player.id] ?? { kind: null as 'win' | 'loss' | null, count: 0 }
                  const winGoalProgress = st.kind === 'win' ? st.count : 0
                  return (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/players/${player.id}`} className="text-brand hover:underline font-medium">{player.name}</Link>
                      </td>
                      <td className="px-4 py-3"><SkillBadge skill={player.skill ?? 'unknown'} /></td>
                      <td className="px-4 py-3 text-gray-800">{player.position}</td>
                      <td className="px-4 py-3">
                        {st.kind ? <StreakBadge kind={st.kind} count={st.count} /> : <span className="text-sm text-gray-800">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {winGoalProgress >= 7 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: 'hsl(270deg 80% 36%)' }}>Objetivo ✓</span>
                        ) : (
                          <div className="w-28">
                            <div className="flex justify-between text-[10px] text-gray-700 mb-0.5">
                              <span>W{Math.min(7, winGoalProgress)}</span>
                              <span>7</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded">
                              <div className="h-1.5 rounded" style={{ width: `${(Math.min(7, winGoalProgress) / 7) * 100}%`, backgroundColor: 'hsl(270deg 75% 45%)' }} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center gap-3">
                          <Link href={`/players/${player.id}`} className="text-brand hover:text-brand/80">Ver</Link>
                          {isAdmin && <Link href={`/players/edit/${player.id}`} className="text-brand hover:text-brand/80">Editar</Link>}
                          {isAdmin && <button onClick={() => handleDelete(player.id)} className="text-red-600 hover:text-red-800">Eliminar</button>}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <dialog
          open={showModal}
          className="rounded-xl p-0 border-none shadow-2xl w-full h-full fixed inset-0 bg-black/40"
        >
          <div className="bg-white p-6 rounded-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar eliminación
            </h2>

            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que querés eliminar a {selectedPlayer?.name}?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>

              <button
                onClick={() => handleConfirmDelete()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </dialog>
    </div>
  )
}


