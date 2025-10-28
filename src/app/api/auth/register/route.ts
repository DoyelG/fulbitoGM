export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const u = username.trim()
    const p = password
    if (u.length < 3 || u.length > 50) {
      return NextResponse.json({ error: 'Username must be 3-50 characters' }, { status: 400 })
    }
    if (p.length < 6 || p.length > 100) {
      return NextResponse.json({ error: 'Password must be 6-100 characters' }, { status: 400 })
    }
    const exists = await prisma.user.findUnique({ where: { username: u } })
    if (exists) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }
    const passwordHash = await bcrypt.hash(p, 10)
    const created = await prisma.user.create({ data: { username: u, passwordHash } })
    return NextResponse.json({ id: created.id, username: created.username, role: created.role }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Registration failed', message }, { status: 500 })
  }
}


