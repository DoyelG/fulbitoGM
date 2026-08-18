"use client"

import Link from "next/link"
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext"
import { useRouter } from "next/navigation"

type Props = {
  closeNavBar?: () => void // Optional callback for reusability outside NavBar
}

export default function NavAuth({ closeNavBar }: Props) {
  const { user, isAdmin, signOut } = useFirebaseAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-3">
      {user ? (
        <>
          <div className="flex items-center gap-2 text-xs text-gray-600 md:text-white/80 select-none">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-yellow-500 md:bg-yellow-300" : "bg-gray-400 md:bg-white/50"}`}
            />
            <span className="uppercase tracking-wide">
              {isAdmin ? "Administrador" : "Usuario"}
            </span>
          </div>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-14 md:bg-white/10 md:hover:bg-white/20 md:text-white md:px-3 py-2 rounded transition-colors w-full md:w-auto"
            onClick={() => {
              handleSignOut()
              closeNavBar?.()
            }}
          >
            Salir
          </button>
        </>
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
