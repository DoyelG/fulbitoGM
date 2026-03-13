export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const players = await prisma.player.findMany({ orderBy: { skill: 'desc' } })
  return NextResponse.json(players)
}

export async function POST(req: Request) {
  const gate = await requireAdmin()
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status })
  try {
    const { name, position, skill, skills, photoUrl } = await req.json()
    const data: { name?: string, position?: string, skill?: number, skills?: { physical?: number, technical?: number, tactical?: number, psychological?: number }, photoUrl?: string } = {}
    if (typeof name === 'string') data.name = name
    if (typeof position === 'string') data.position = position
    if (typeof skill === 'number') data.skill = skill
    if (typeof skills === 'object') data.skills = skills
    if (typeof photoUrl === 'string') data.photoUrl = photoUrl
    const player = await prisma.player.create({ data: data as Prisma.PlayerCreateInput })
    return NextResponse.json(player, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create player', message }, { status: 500 })
  }
}