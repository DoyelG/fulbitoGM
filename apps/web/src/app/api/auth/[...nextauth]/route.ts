export const runtime = 'nodejs'
import NextAuth from 'next-auth/next'
import { authOptions } from './authOptions'

const handler = NextAuth(authOptions as never)

export { handler as GET, handler as POST }


