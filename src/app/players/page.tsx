'use client'

import Link from 'next/link'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'
import SkillBadge from '@/components/SkillBadge'
import StreakBadge from '@/components/StreakBadge'
import { calculateAllCurrentStreaks } from '@/lib/playerStats'
import { useEffect } from 'react'

export default function PlayersPage() {
  const { players, deletePlayer, initLoad } = usePlayerStore()
  const { matches } = useMatchStore()
  const streaks = calculateAllCurrentStreaks(matches)

  useEffect(() => {
    if (players.length === 0) initLoad()
  }, [players, initLoad])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Players</h1>
        <Link 
          href="/players/new"
          className="bg-brand text-white px-4 py-2 rounded-md hover:bg-brand/90"
        >
          Add Player
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Skill</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Streak</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Goal (7W)</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-800">
                    No players added yet.{' '}
                    <Link 
                      href="/players/new"
                      className="text-brand hover:underline"
                    >
                      Add your first player
                    </Link>
                  </td>
                </tr>
              ) : (
                players.map((player) => {
                  const st = streaks[player.id] ?? { kind: null, count: 0 }
                  const winGoalProgress = st.kind === 'win' ? st.count : 0
                  return (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/players/${player.id}`}
                          className="text-brand hover:underline font-medium"
                        >
                          {player.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <SkillBadge skill={player.skill} />
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {player.position}
                      </td>
                      <td className="px-4 py-3">
                        {st.kind ? <StreakBadge kind={st.kind} count={st.count} /> : <span className="text-sm text-gray-800">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {winGoalProgress >= 7 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: 'hsl(270deg 80% 36%)' }}>
                            Goal ✓
                          </span>
                        ) : (
                          <div className="w-28">
                            <div className="flex justify-between text-[10px] text-gray-700 mb-0.5"><span>W{Math.min(7, winGoalProgress)}</span><span>7</span></div>
                            <div className="h-1.5 bg-gray-200 rounded">
                              <div className="h-1.5 rounded" style={{ width: `${(Math.min(7, winGoalProgress) / 7) * 100}%`, backgroundColor: 'hsl(270deg 75% 45%)' }} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end items-center gap-3">
                          <Link
                            href={`/players/${player.id}`}
                            className="text-brand hover:text-brand/80"
                          >
                            View
                          </Link>
                          <Link
                            href={`/players/edit/${player.id}`}
                            className="text-brand hover:text-brand/80"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deletePlayer(player.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
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
    </div>
  )
}