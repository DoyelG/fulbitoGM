import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MatchPlayer } from '@/store/useMatchStore'

export async function GET() {
  const matches = await prisma.match.findMany({ orderBy: { date: 'desc' }, include: { players: true } })
  const playerIds = Array.from(new Set(matches.flatMap(m => m.players.map(mp => mp.playerId))))
  const players = await prisma.player.findMany({ where: { id: { in: playerIds } } })
  const nameMap = Object.fromEntries(players.map(p => [p.id, p.name]))
  const shaped = matches.map(m => ({
    id: m.id,
    date: m.date.toISOString().slice(0, 10),
    type: m.type,
    name: m.name ?? undefined,
    teamAScore: m.teamAScore,
    teamBScore: m.teamBScore,
    teamA: m.players.filter(p => p.team === 'A').map(p => ({ id: p.playerId, name: nameMap[p.playerId], goals: p.goals, performance: p.performance })),
    teamB: m.players.filter(p => p.team === 'B').map(p => ({ id: p.playerId, name: nameMap[p.playerId], goals: p.goals, performance: p.performance }))
  }))
  return NextResponse.json(shaped)
}

export async function POST(req: Request) {
  const b = await req.json()
  const created = await prisma.match.create({
    data: {
      date: new Date(b.date),
      type: b.type,
      name: b.name ?? null,
      teamAScore: b.teamAScore,
      teamBScore: b.teamBScore,
      players: {
        create: [
          ...(b.teamA || []).map((p: MatchPlayer) => ({ playerId: p.id, team: 'A', goals: p.goals, performance: p.performance })),
          ...(b.teamB || []).map((p: MatchPlayer) => ({ playerId: p.id, team: 'B', goals: p.goals, performance: p.performance }))
        ]
      }
    }
  })
  return NextResponse.json({ id: created.id }, { status: 201 })
}