"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Player, usePlayerStore } from "@/store/usePlayerStore";
import { useMatchStore, Match } from "@/store/useMatchStore";

export default function StatisticsClient({ players, matches }: { players: Player[], matches: Match[] }) {
  const { hydrateMatches } = useMatchStore()
  const { hydratePlayers } = usePlayerStore();

  useEffect(() => {
    if (matches.length > 0) hydrateMatches(matches);
    if (players.length > 0) hydratePlayers(players);
  }, [matches, hydrateMatches, players, hydratePlayers]);

  type StatRow = { id: string; name: string; matches: number; goals: number; totalPerformance: number; wins: number; losses: number; draws: number }

  const stats = useMemo<StatRow[]>(() => {
    const map: Record<string, { id: string; name: string; matches: number; goals: number; totalPerformance: number; wins: number; losses: number; draws: number }> = {}
    for (const m of matches) {
      const process = (team: 'A' | 'B') => (p: { id: string; name: string; goals: number; performance: number }) => {
        if (!map[p.id]) map[p.id] = { id: p.id, name: p.name, matches: 0, goals: 0, totalPerformance: 0, wins: 0, losses: 0, draws: 0 }
        map[p.id].matches++
        map[p.id].goals += p.goals
        map[p.id].totalPerformance += p.performance
        const a = m.teamAScore, b = m.teamBScore
        if (team === 'A') {
          if (a > b) map[p.id].wins++
          else if (a < b) map[p.id].losses++
          else map[p.id].draws++
        } else {
          if (b > a) map[p.id].wins++
          else if (b < a) map[p.id].losses++
          else map[p.id].draws++
        }
      }
      m.teamA.forEach(process('A'))
      m.teamB.forEach(process('B'))
    }
    Object.values(map).forEach((stat) => {
      stat.totalPerformance = stat.totalPerformance / stat.matches
    })
    return Object.values(map)
  }, [matches])

  type SortKey = keyof StatRow | 'goalsPerMatch' | 'winRate'
  const [sortKey, setSortKey] = useState<SortKey>('goals')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prevDir => (prevDir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }, [sortKey])

  const sorted = useMemo(() => {
    const getValue = (row: StatRow, key: SortKey) => {
      if (key === 'goalsPerMatch') return row.matches === 0 ? 0 : row.goals / row.matches
      if (key === 'winRate') return row.matches === 0 ? 0 : row.wins / row.matches
      return row[key]
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...stats].sort((a, b) => {
      const av = getValue(a, sortKey)
      const bv = getValue(b, sortKey)
      if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir
      const an = Number(av)
      const bn = Number(bv)
      if (Number.isNaN(an) || Number.isNaN(bn)) return 0
      if (an === bn) return 0
      return an > bn ? dir : -dir
    })
  }, [stats, sortKey, sortDir])

    return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Statistics</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('name')}>Name{sortKey==='name' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('matches')}>Matches{sortKey==='matches' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('goals')}>Goals{sortKey==='goals' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('goalsPerMatch')}>Goals/Match{sortKey==='goalsPerMatch' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('totalPerformance')}>Performance{sortKey==='totalPerformance' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('wins')}>Wins{sortKey==='wins' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none" onClick={() => toggleSort('winRate')}>Win Rate{sortKey==='winRate' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-800">
                    No statistics available.
                  </td>
                </tr>
              ) : (
                sorted.map((stat) => {
                  return (
                    <tr key={stat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-blue-600 hover:underline"><Link href={`/players/${stat.id}`}>{stat.name}</Link></td>
                      <td className="px-4 py-3">{stat.matches}</td>
                      <td className="px-4 py-3">{stat.goals}</td>
                      <td className="px-4 py-3">{(stat.goals / stat.matches).toFixed(2)}</td>
                      <td className="px-4 py-3">{stat.totalPerformance.toFixed(2)}</td>
                      <td className="px-4 py-3">{stat.wins}</td>
                      <td className="px-4 py-3">{((stat.wins / stat.matches) * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3">{stat.wins}W-{stat.losses}L-{stat.draws}D</td>
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