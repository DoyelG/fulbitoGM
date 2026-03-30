import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  session: { strategy: 'jwt' as const },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { username: credentials.username } })
        if (!user) return null
        const ok = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!ok) return null
        return { id: user.id, name: user.username, role: user.role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: unknown }) {
      if (user) {
        ;(token as JWT & { role?: string }).role =
          (user as { role?: string }).role === 'ADMIN' ? 'ADMIN' : 'USER'
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      const t = token as JWT & { sub?: string; role?: string }
      if (session.user) {
        ;(session.user as unknown as { role?: string }).role = t.role || 'USER'
        if (t.sub) session.user.id = t.sub
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}


