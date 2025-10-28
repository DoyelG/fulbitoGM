'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function NavAuth() {
  const { data } = useSession()
  const role = (data?.user as unknown as { role?: string })?.role
  return (
    <div className="flex items-center gap-3">
      {data?.user ? (
        <>
          <span className="text-sm bg-white/20 px-2 py-1 rounded">{role === 'ADMIN' ? 'Admin' : 'Usuario'}</span>
          <button className="hover:bg-white/20 px-3 py-2 rounded" onClick={() => signOut({ callbackUrl: '/' })}>Salir</button>
        </>
      ) : (
        <Link href="/login" className="hover:bg-white/20 px-3 py-2 rounded">Entrar</Link>
      )}
    </div>
  )
}


