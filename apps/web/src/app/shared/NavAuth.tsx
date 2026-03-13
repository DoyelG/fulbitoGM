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
          <div className="flex items-center gap-2 text-xs text-white/80 select-none">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${role === 'ADMIN' ? 'bg-yellow-300' : 'bg-white/50'}`} />
            <span className="uppercase tracking-wide">{role === 'ADMIN' ? 'Administrador' : 'Usuario'}</span>
          </div>
          <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded transition-colors" onClick={() => signOut({ callbackUrl: '/' })}>Salir</button>
        </>
      ) : (
        <Link href="/login" className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded transition-colors">Entrar</Link>
      )}
    </div>
  )
}


