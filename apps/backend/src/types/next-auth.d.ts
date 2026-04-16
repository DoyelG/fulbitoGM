import type { DefaultSession } from 'next-auth'

type UserRole = 'USER' | 'ADMIN'

declare module 'next-auth' {
  interface User {
    role?: UserRole
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: UserRole
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole
  }
}

declare module 'next-auth/adapters' {
  interface AdapterUser {
    role?: UserRole
  }
}

export {}

