import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, id: string) {
  const player = await prisma.player.findUnique({ where: { id } })
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(player)
}

export async function PUT(req: Request, id: string) {
  const body = await req.json()
  const player = await prisma.player.update({ where: { id }, data: body })
  return NextResponse.json(player)
}

export async function DELETE(_req: Request, id: string) {
  // cascades via schema
  await prisma.player.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}