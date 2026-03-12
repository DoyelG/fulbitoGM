export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(_req: Request, context: unknown) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status })
  try {
    const { id } = (context as { params: { id: string } }).params
    await prisma.match.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: `Failed to delete match: ${err}` }, { status: 500 })
  }
}

export async function GET(_req: Request, context: unknown) {
  try {
    const { id } = (context as { params: { id: string } }).params
    const m = await prisma.match.findUnique({
      where: { id },
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
      shirtsResponsibleId: (m as unknown as { shirtsResponsibleId?: string | null }).shirtsResponsibleId ?? undefined,
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

export async function PUT(req: Request, context: unknown) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status })
  try {
    const b = await req.json()
    const { id } = (context as { params: { id: string } }).params

    // Update basic fields
    const data: { date?: Date, type?: string, name?: string | null, teamAScore?: number, teamBScore?: number, shirtsResponsibleId?: string | null } = {}
    if (b.date) data.date = new Date(`${b.date}T00:00:00.000Z`)
    if (typeof b.type === 'string') data.type = b.type
    if (typeof b.name === 'string' || b.name === null) data.name = b.name ?? null
    if (typeof b.teamAScore === 'number') data.teamAScore = b.teamAScore
    if (typeof b.teamBScore === 'number') data.teamBScore = b.teamBScore
    if ('shirtsResponsibleId' in b) data.shirtsResponsibleId = b.shirtsResponsibleId ?? null

    const current = await prisma.match.findUnique({ where: { id }, select: { shirtsResponsibleId: true } })
    const oldId = current?.shirtsResponsibleId ?? null
    const newId = ('shirtsResponsibleId' in b) ? (b.shirtsResponsibleId ?? null) : oldId

    // If teams provided, replace participants atomically
    if (Array.isArray(b.teamA) || Array.isArray(b.teamB)) {
      await prisma.$transaction([
        prisma.match.update({ where: { id }, data }),
        prisma.matchPlayer.deleteMany({ where: { matchId: id } }),
        prisma.matchPlayer.createMany({
          data: [
            ...((b.teamA || []).map((p: { id: string, goals: number, performance: number }) => ({ matchId: id, playerId: p.id, team: 'A', goals: p.goals ?? 0, performance: p.performance ?? 5 }))),
            ...((b.teamB || []).map((p: { id: string, goals: number, performance: number }) => ({ matchId: id, playerId: p.id, team: 'B', goals: p.goals ?? 0, performance: p.performance ?? 5 })))
          ]
        }),
        ...(newId !== oldId ? [
          ...(oldId ? [prisma.player.update({ where: { id: oldId }, data: { shirtDutiesCount: { decrement: 1 } } })] : []),
          ...(newId ? [prisma.player.update({ where: { id: newId }, data: { shirtDutiesCount: { increment: 1 } } })] : [])
        ] : [])
      ])
    } else {
      await prisma.$transaction([
        prisma.match.update({ where: { id }, data }),
        ...(newId !== oldId ? [
          ...(oldId ? [prisma.player.update({ where: { id: oldId }, data: { shirtDutiesCount: { decrement: 1 } } })] : []),
          ...(newId ? [prisma.player.update({ where: { id: newId }, data: { shirtDutiesCount: { increment: 1 } } })] : [])
        ] : [])
      ])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: `Failed to update match ${err}` }, { status: 500 })
  }
}


