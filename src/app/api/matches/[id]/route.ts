import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.match.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: `Failed to delete match: ${err}` }, { status: 500 })
  }
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const m = await prisma.match.findUnique({
      where: { id: params.id },
      include: { players: true }
    })
    if (!m) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const ids = m.players.map(p => p.playerId)
    const players = await prisma.player.findMany({ where: { id: { in: ids } } })
    const nameMap = Object.fromEntries(players.map(p => [p.id, p.name]))

    const shaped = {
      id: m.id,
      date: m.date.toISOString().slice(0, 10),
      type: m.type,
      name: m.name ?? undefined,
      teamAScore: m.teamAScore,
      teamBScore: m.teamBScore,
      teamA: m.players
        .filter(p => p.team === 'A')
        .map(p => ({ id: p.playerId, name: nameMap[p.playerId], goals: p.goals, performance: p.performance })),
      teamB: m.players
        .filter(p => p.team === 'B')
        .map(p => ({ id: p.playerId, name: nameMap[p.playerId], goals: p.goals, performance: p.performance }))
    }

    return NextResponse.json(shaped)
  } catch (err) {
    return NextResponse.json({ error: `Failed to load match: ${err}` }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const b = await req.json()

    // Update basic fields
    const data: { date?: Date, type?: string, name?: string | null, teamAScore?: number, teamBScore?: number } = {}
    if (b.date) data.date = new Date(b.date)
    if (typeof b.type === 'string') data.type = b.type
    if (typeof b.name === 'string' || b.name === null) data.name = b.name ?? null
    if (typeof b.teamAScore === 'number') data.teamAScore = b.teamAScore
    if (typeof b.teamBScore === 'number') data.teamBScore = b.teamBScore

    // If teams provided, replace participants atomically
    if (Array.isArray(b.teamA) || Array.isArray(b.teamB)) {
      await prisma.$transaction([
        prisma.match.update({ where: { id: params.id }, data }),
        prisma.matchPlayer.deleteMany({ where: { matchId: params.id } }),
        prisma.matchPlayer.createMany({
          data: [
            ...((b.teamA || []).map((p: { id: string, goals: number, performance: number }) => ({ matchId: params.id, playerId: p.id, team: 'A', goals: p.goals ?? 0, performance: p.performance ?? 5 }))),
            ...((b.teamB || []).map((p: { id: string, goals: number, performance: number }) => ({ matchId: params.id, playerId: p.id, team: 'B', goals: p.goals ?? 0, performance: p.performance ?? 5 })))
          ]
        })
      ])
    } else {
      await prisma.match.update({ where: { id: params.id }, data })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: `Failed to update match ${err}` }, { status: 500 })
  }
}


