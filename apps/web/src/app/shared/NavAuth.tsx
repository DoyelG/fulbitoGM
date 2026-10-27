"use client"

import Link from "next/link"
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext"
import UserMenu from "./UserMenu"

type Props = {
  closeNavBar?: () => void
}

export default function NavAuth({ closeNavBar }: Props) {
  const { user } = useFirebaseAuth()

  return (
    <div className="flex flex-col md:flex-row items-center gap-3">
      {user ? (
        <UserMenu closeNavBar={closeNavBar} />
      ) : (
        <Link
          onClick={closeNavBar}
          href="/login"
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-22 md:bg-white/10 md:hover:bg-white/20 md:text-white md:px-3 py-2 rounded transition-colors w-full md:w-auto"
        >
          Entrar
        </Link>
      )}
    </div>
  )
}
