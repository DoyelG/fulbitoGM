import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const players = await prisma.player.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(players)
}

export async function POST(req: Request) {
  const { name, position, skill, skills } = await req.json()
  const player = await prisma.player.create({ data: { name, position, skill, skills } })
  return NextResponse.json(player, { status: 201 })
}