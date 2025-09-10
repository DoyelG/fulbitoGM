import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const player = await prisma.player.findUnique({ where: { id: params.id } })
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(player)
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json()
  const player = await prisma.player.update({ where: { id: params.id }, data: body })
  return NextResponse.json(player)
}

export async function DELETE(_req: Request, { params }: Params) {
  // cascades via schema
  await prisma.player.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}