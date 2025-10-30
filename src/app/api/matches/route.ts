export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { shapeStoreMatches } from '@/lib/shape'

type IncomingMatchPlayer = { id: string; goals: number; performance: number }
type IncomingMatchBody = {
  date: string
  type: string
  name?: string | null
  teamAScore: number
  teamBScore: number
  teamA?: IncomingMatchPlayer[]
  teamB?: IncomingMatchPlayer[]
}

export async function GET() {
  const matches = await prisma.match.findMany({ orderBy: { date: 'desc' }, include: { players: true } })
  const playerIds = Array.from(new Set(matches.flatMap(m => m.players.map(mp => mp.playerId))))
  const players = await prisma.player.findMany({ where: { id: { in: playerIds } } })
  const nameMap = new Map(players.map(p => [p.id, p.name] as const))
  const shaped = shapeStoreMatches(matches, nameMap)
  return NextResponse.json(shaped)
}

export async function POST(req: Request) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status })
  const b = (await req.json()) as IncomingMatchBody
  const created = await prisma.match.create({
    data: {
      date: new Date(`${b.date}T00:00:00.000Z`),
      type: b.type,
      name: b.name ?? null,
      teamAScore: b.teamAScore,
      teamBScore: b.teamBScore,
      players: {
        create: [
          ...(b.teamA || []).map((p: IncomingMatchPlayer) => ({ playerId: p.id, team: 'A' as const, goals: p.goals, performance: p.performance })),
          ...(b.teamB || []).map((p: IncomingMatchPlayer) => ({ playerId: p.id, team: 'B' as const, goals: p.goals, performance: p.performance }))
        ]
      }
    }
  })
  return NextResponse.json({ id: created.id }, { status: 201 })
}