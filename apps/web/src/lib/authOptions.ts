import type { NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password
          })
        })

        if (!res.ok) return null
        return res.json()
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        type Role = 'USER' | 'ADMIN'
        token.role = (user as unknown as { role?: Role }).role ?? 'USER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        type Role = 'USER' | 'ADMIN'
        ;(session.user as unknown as { role: Role }).role = (token as unknown as { role?: Role }).role ?? 'USER'
        if (token.sub) session.user.id = token.sub
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}