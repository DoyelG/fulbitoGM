import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { verifyMobileToken } from '@/lib/mobileJwt'

export async function getSession(): Promise<Session | null> {
  return (await getServerSession(authOptions as never)) as Session | null
}

export async function requireAdmin(
  req?: Request,
): Promise<{ ok: true } | { ok: false; status: number; body: unknown }> {
  const bearer = req?.headers.get('authorization')
  if (bearer?.startsWith('Bearer ')) {
    try {
      const { role } = await verifyMobileToken(bearer.slice(7))
      if (role !== 'ADMIN') return { ok: false, status: 403, body: { error: 'Forbidden' } }
      return { ok: true }
    } catch {
      return { ok: false, status: 401, body: { error: 'Unauthorized' } }
    }
  }
  const session = await getSession()
  const role = (session?.user as unknown as { role?: string })?.role
  if (!session) return { ok: false, status: 401, body: { error: 'Unauthorized' } }
  if (role !== 'ADMIN') return { ok: false, status: 403, body: { error: 'Forbidden' } }
  return { ok: true }
}
