export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(_req: Request, context: unknown) {
  const { id } = (context as { params: { id: string } }).params
  const player = await prisma.player.findUnique({ where: { id } })
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(player)
}

export async function PUT(req: Request, context: unknown) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status })
  try {
    const { id } = (context as { params: { id: string } }).params
    const body = await req.json()
    const data: { name?: string, position?: string, skill?: number, skills?: { physical?: number, technical?: number, tactical?: number, psychological?: number }, photoUrl?: string } = {}
    if (typeof body.name === 'string') data.name = body.name
    if (typeof body.position === 'string') data.position = body.position
    if (typeof body.skill === 'number') data.skill = body.skill
    if (typeof body.skills === 'object') data.skills = body.skills
    if (typeof body.photoUrl === 'string') data.photoUrl = body.photoUrl
    const player = await prisma.player.update({ where: { id }, data })
    return NextResponse.json(player)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to update player', message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: unknown) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status })
  const { id } = (context as { params: { id: string } }).params
  // cascades via schema
  await prisma.player.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}