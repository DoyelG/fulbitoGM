'use client'

import Link from 'next/link'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useRouter } from 'next/navigation'

export default function NavAuth() {
  const { user, isAdmin, signOut } = useFirebaseAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <div className="flex items-center gap-2 text-xs text-white/80 select-none">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-yellow-300' : 'bg-white/50'}`} />
            <span className="uppercase tracking-wide">{isAdmin ? 'Administrador' : 'Usuario'}</span>
          </div>
          <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded transition-colors" onClick={handleSignOut}>Salir</button>
        </>
      ) : (
        <Link href="/login" className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded transition-colors">Entrar</Link>
      )}
    </div>
  )
}
