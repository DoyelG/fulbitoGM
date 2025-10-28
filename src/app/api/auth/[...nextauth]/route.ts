export const runtime = 'nodejs'
import NextAuth from 'next-auth'
import { authOptions } from './authOptions'

const handler = NextAuth(authOptions)

export const { GET, POST } = handler


