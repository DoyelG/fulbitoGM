import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as unknown as { role?: string }).role = (token as unknown as { role?: string }).role || 'USER'
        if (token.sub) session.user.id = token.sub
      }
      return session
    }
  }
}

