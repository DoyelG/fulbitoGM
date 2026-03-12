export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const matches = await prisma.match.findMany({ include: { players: true } })
  const playerIds = Array.from(new Set(matches.flatMap(m => m.players.map(mp => mp.playerId))))
  const players = await prisma.player.findMany({ where: { id: { in: playerIds } } })
  const nameMap = Object.fromEntries(players.map(p => [p.id, p.name]))

  const map: Record<string, { name: string, matches: number, goals: number, totalPerformance: number, wins: number, losses: number, draws: number }> = {}

  for (const m of matches) {
    const a = m.teamAScore, b = m.teamBScore
    for (const mp of m.players) {
      const id = mp.playerId
      const team = mp.team as 'A' | 'B'
      const name = nameMap[id] ?? 'Unknown'
      if (!map[id]) map[id] = { name, matches: 0, goals: 0, totalPerformance: 0, wins: 0, losses: 0, draws: 0 }
      const s = map[id]
      s.matches++
      s.goals += mp.goals
      s.totalPerformance += mp.performance
      if (a === b) s.draws++
      else if ((team === 'A' && a > b) || (team === 'B' && b > a)) s.wins++
      else s.losses++
    }
  }

  return NextResponse.json(map)
}