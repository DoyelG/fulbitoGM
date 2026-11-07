'use client'

import Link from 'next/link'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import UserMenu from './UserMenu'

type Props = {
  closeNavBar?: () => void
}

export default function NavAuth({ closeNavBar }: Props) {
  const { user } = useFirebaseAuth()

  return (
    <div className="flex flex-col lg:flex-row items-center gap-3">
      {user ? (
        <UserMenu closeNavBar={closeNavBar} />
      ) : (
        <Link
          onClick={closeNavBar}
          href="/login"
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-22 lg:bg-white/10 lg:hover:bg-white/20 lg:text-white lg:px-3 py-2 rounded transition-colors w-full lg:w-auto"
        >
          Entrar
        </Link>
      )}
    </div>
  )
}
