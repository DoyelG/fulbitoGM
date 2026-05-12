export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(_req: Request, context: unknown) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status })
  try {
    const { id } = (context as { params: { id: string } }).params
    const current = await prisma.match.findUnique({
      where: { id },
      select: { shirtsResponsibleId: true, mvpId: true }
    })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.$transaction([
      ...(current.shirtsResponsibleId ? [
        prisma.player.update({
          where: { id: current.shirtsResponsibleId },
          data: { shirtDutiesCount: { decrement: 1 } }
        })
      ] : []),
      ...(current.mvpId ? [
        prisma.player.update({
          where: { id: current.mvpId },
          data: { mvpCount: { decrement: 1 } }
        })
      ] : []),
      prisma.match.delete({ where: { id } })
    ])
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
      mvpId: (m as unknown as { mvpId?: string | null }).mvpId ?? undefined,
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

    const data: { date?: Date, type?: string, name?: string | null, teamAScore?: number, teamBScore?: number, shirtsResponsibleId?: string | null, mvpId?: string | null } = {}
    if (b.date) data.date = new Date(`${b.date}T00:00:00.000Z`)
    if (typeof b.type === 'string') data.type = b.type
    if (typeof b.name === 'string' || b.name === null) data.name = b.name ?? null
    if (typeof b.teamAScore === 'number') data.teamAScore = b.teamAScore
    if (typeof b.teamBScore === 'number') data.teamBScore = b.teamBScore
    if ('shirtsResponsibleId' in b) data.shirtsResponsibleId = b.shirtsResponsibleId ?? null
    if ('mvpId' in b) data.mvpId = b.mvpId ?? null

    const current = await prisma.match.findUnique({
      where: { id },
      select: { shirtsResponsibleId: true, mvpId: true, players: { select: { playerId: true } } }
    })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const oldShirtId = current.shirtsResponsibleId ?? null
    const newShirtId = ('shirtsResponsibleId' in b) ? (b.shirtsResponsibleId ?? null) : oldShirtId
    const oldMvpId = current.mvpId ?? null
    const newMvpId = ('mvpId' in b) ? (b.mvpId ?? null) : oldMvpId

    if (newMvpId) {
      const teamsProvided = Array.isArray(b.teamA) || Array.isArray(b.teamB)
      const participants = teamsProvided
        ? new Set<string>([...(b.teamA || []), ...(b.teamB || [])].map((p: { id: string }) => p.id))
        : new Set<string>(current.players.map(p => p.playerId))
      if (!participants.has(newMvpId)) {
        return NextResponse.json({ error: 'MVP must be a player in this match' }, { status: 400 })
      }
    }

    const shirtOps = newShirtId !== oldShirtId ? [
      ...(oldShirtId ? [prisma.player.update({ where: { id: oldShirtId }, data: { shirtDutiesCount: { decrement: 1 } } })] : []),
      ...(newShirtId ? [prisma.player.update({ where: { id: newShirtId }, data: { shirtDutiesCount: { increment: 1 } } })] : [])
    ] : []

    const mvpOps = newMvpId !== oldMvpId ? [
      ...(oldMvpId ? [prisma.player.update({ where: { id: oldMvpId }, data: { mvpCount: { decrement: 1 } } })] : []),
      ...(newMvpId ? [prisma.player.update({ where: { id: newMvpId }, data: { mvpCount: { increment: 1 } } })] : [])
    ] : []

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
        ...shirtOps,
        ...mvpOps
      ])
    } else {
      await prisma.$transaction([
        prisma.match.update({ where: { id }, data }),
        ...shirtOps,
        ...mvpOps
      ])
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: `Failed to update match ${err}` }, { status: 500 })
  }
}
