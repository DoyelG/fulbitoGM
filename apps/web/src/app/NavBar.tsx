"use client"
import { useState } from "react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import NavAuth from "./shared/NavAuth"
import UserMenu from "./shared/UserMenu"
import ActiveTournamentLink from "./shared/ActiveTournamentLink"
import ActiveTournamentAvatar from "./shared/ActiveTournamentAvatar"
import TournamentMenu from "./shared/TournamentMenu"
import Link from "next/link"
import Image from "next/image"
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext"
import { isPersonalTournament } from "@fulbito/utils"
import { selectActiveTournament, useTournamentStore } from "@/store/useTournamentStore"
import { useUnreadCommentsSync } from "@/hooks/use-unread-comments-sync"

const navigation = [
  {
    name: "Inicio",
    location: "/",
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
    name: "Mi historia",
    location: "/my-history",
    color: "from-rose-500/20 to-orange-500/20",
  },
  {
    name: "Nuevo partido",
    location: "/match",
    color: "from-amber-500/20 to-orange-500/20",
  },
]

const PERSONAL_NAVIGATION = ["/my-history", "/match"]

function BrandLogo() {
  return (
    <Image
      src="/logo-ball.png"
      alt=""
      width={36}
      height={36}
      priority
      unoptimized
      className="hidden h-9 w-9 sm:block"
    />
  )
}

export default function NavBar() {
  const [menuChecked, setMenuChecked] = useState(false)
  const toggleNavBar = () => setMenuChecked((prev) => !prev)
  const closeNavBar = () => setMenuChecked(false)
  const { user } = useFirebaseAuth()
  const activeTournament = useTournamentStore(selectActiveTournament)
  const hasActiveTournament = activeTournament !== null
  const visibleNavigation = isPersonalTournament(activeTournament?.tournament)
    ? navigation.filter((item) => PERSONAL_NAVIGATION.includes(item.location))
    : navigation
  useUnreadCommentsSync(user?.uid ?? null)

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
    <div className="relative flex w-full items-center justify-between">
      <button
        aria-label={menuChecked ? "Cerrar menú" : "Abrir menú"}
        className={`sm:hidden z-50 border-0 p-2 rounded-lg transition-colors ${
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
        className="absolute left-1/2 -translate-x-1/2 rounded px-3 py-2 sm:static sm:left-auto sm:shrink-0 sm:translate-x-0 sm:px-0"
      >
        <h1 className="flex items-center gap-2 text-2xl font-bold whitespace-nowrap">
          <BrandLogo />
          FulbitoApp
        </h1>
      </Link>
      <ActiveTournamentAvatar />
      <div className="hidden sm:ml-auto sm:flex sm:min-w-0 sm:items-center sm:gap-3 lg:gap-4">
        <TournamentMenu />
        {hasActiveTournament && <div className="h-6 w-px shrink-0 bg-white/30" aria-hidden />}
        <UserMenu />
      </div>

      <nav
        className={`fixed top-0 left-0 h-full w-64 flex flex-col gap-4 bg-gray-50 text-gray-900 p-4 pt-18 z-40 transform transition-transform duration-300 sm:hidden ${
          menuChecked ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ActiveTournamentLink onNavigate={closeNavBar} />
        {hasActiveTournament &&
          visibleNavigation.map((item) => (
            <Link
              key={item.location}
              href={item.location}
              onClick={closeNavBar}
              className="group relative overflow-hidden rounded px-4 py-2"
            >
              <span
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity group-hover:opacity-100`}
                aria-hidden
              />
              <span className="relative">{item.name}</span>
            </Link>
          ))}

        <div className="mt-auto">
          <NavAuth closeNavBar={closeNavBar} />
        </div>
      </nav>

      <div
        onClick={closeNavBar}
        className={`fixed inset-0 bg-black/70 z-30 transition-opacity duration-300 sm:hidden ${
          menuChecked ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
    </div>
  )
}
