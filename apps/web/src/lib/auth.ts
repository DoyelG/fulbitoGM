import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAdmin(): Promise<{ ok: true } | { ok: false, status: number, body: unknown }> {
  const session = await getSession()
  const role = (session?.user as unknown as { role?: string })?.role
  if (!session) return { ok: false, status: 401, body: { error: 'Unauthorized' } }
  if (role !== 'ADMIN') return { ok: false, status: 403, body: { error: 'Forbidden' } }
  return { ok: true }
}


