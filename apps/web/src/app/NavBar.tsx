"use client"
import { useState } from "react"
import { Bars3Icon, TrophyIcon, XMarkIcon } from "@heroicons/react/24/outline"
import NavAuth from "./shared/NavAuth"
import ActiveTournamentLink from "./shared/ActiveTournamentLink"
import Link from "next/link"
import Image from "next/image"
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext"
import { selectActiveTournament, useTournamentStore } from "@/store/useTournamentStore"

const navigation = [
  {
    name: "Inicio",
    location: "/",
    style: "lg:hidden",
    color: "from-sky-500/20 to-blue-500/20",
  },
  {
    name: "Estadísticas",
    location: "/statistics",
    color: "from-indigo-500/20 to-fuchsia-500/20",
  },
  {
    name: "Jugadores",
    location: "/players",
    color: "from-emerald-500/20 to-cyan-500/20",
  },
  {
    name: "Historial",
    location: "/history",
    color: "from-violet-500/20 to-pink-500/20",
  },
  {
    name: "Premios",
    location: "/awards",
    color: "from-yellow-500/20 to-amber-500/20",
  },
  {
    name: "Nuevo partido",
    location: "/match",
    style: "whitespace-nowrap",
    color: "from-amber-500/20 to-orange-500/20",
  },
]

function BrandLogo() {
  return (
    <Image
      src="/logo-ball.png"
      alt=""
      width={36}
      height={36}
      priority
      unoptimized
      className="hidden h-9 w-9 lg:block"
    />
  )
}

function ActiveTournamentAvatar() {
  const activeTournament = useTournamentStore(selectActiveTournament)
  if (!activeTournament) return null
  const { name, photoUrl } = activeTournament.tournament

  return (
    <Link
      href="/tournaments"
      aria-label={`Torneo activo: ${name}. Ver mis torneos`}
      className="lg:hidden z-10 relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/30 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      {photoUrl ? (
        <Image src={photoUrl} alt="" fill unoptimized className="object-cover" />
      ) : (
        <TrophyIcon className="h-5 w-5" aria-hidden />
      )}
    </Link>
  )
}

export default function NavBar() {
  const [menuChecked, setMenuChecked] = useState(false)
  const toggleNavBar = () => setMenuChecked((prev) => !prev)
  const closeNavBar = () => setMenuChecked(false)
  const { user } = useFirebaseAuth()
  const hasActiveTournament = useTournamentStore(selectActiveTournament) !== null

  if (!user) {
    return (
      <div className="flex items-center w-full">
        <h1 className="flex items-center gap-2 py-2 text-2xl font-bold whitespace-nowrap">
          <BrandLogo />
          FulbitoApp
        </h1>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-between w-full">
      <button
        aria-label={menuChecked ? "Cerrar menú" : "Abrir menú"}
        className={`lg:hidden z-50 border-0 p-2 rounded-lg transition-colors ${
          menuChecked
            ? "bg-gray-900/10 hover:bg-gray-900/20"
            : "bg-white/10 hover:bg-white/20"
        }`}
        onClick={toggleNavBar}
      >
        {menuChecked ? (
          <XMarkIcon className="w-6 h-6 text-gray-900" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-white" />
        )}
      </button>
      <Link
        href="/"
        className="absolute left-1/2 -translate-x-1/2 lg:static lg:left-auto lg:translate-x-0 px-3 py-2 lg:px-0 rounded"
      >
        <h1 className="flex items-center gap-2 text-2xl font-bold whitespace-nowrap">
          <BrandLogo />
          FulbitoApp
        </h1>
      </Link>
      <ActiveTournamentAvatar />

      <nav
        className={`fixed top-0 left-0 h-full w-64 flex flex-col gap-4 lg:gap-1 xl:gap-4 bg-gray-50 text-gray-900 p-4 pt-18 z-40 transform transition-transform duration-300 ${
          menuChecked ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:h-auto lg:w-auto lg:flex-row lg:translate-x-0 lg:bg-transparent lg:text-white lg:p-0 lg:items-center`}
      >
        <ActiveTournamentLink onNavigate={closeNavBar} />
        {hasActiveTournament && (
          <>
            <div className="hidden lg:block w-px h-6 mx-2 xl:mx-0 bg-white/30" aria-hidden />
            {navigation.map((item) => (
              <Link
                key={item.location}
                href={item.location}
                onClick={closeNavBar}
                className={`group relative overflow-hidden px-4 lg:px-1 py-2 rounded xl:px-3 ${item.style ?? ""}`}
              >
                <span
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                  aria-hidden
                />
                <span className="relative">{item.name}</span>
              </Link>
            ))}
          </>
        )}
        <div className="hidden lg:block w-px h-6 mx-2 xl:mx-0 bg-white/30" />

        <div className="mt-auto">
          <NavAuth closeNavBar={closeNavBar} />
        </div>
      </nav>

      <div
        onClick={closeNavBar}
        className={`fixed inset-0 bg-black/70 z-30 transition-opacity duration-300 ${
          menuChecked ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
    </div>
  )
}
