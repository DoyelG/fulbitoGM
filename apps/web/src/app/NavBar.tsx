"use client"
import { useState } from "react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import NavAuth from "./shared/NavAuth"
import Link from "next/link"

const navigation = [
  {
    name: "Inicio",
    location: "/",
    style: "md:hidden",
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
    name: "Nuevo partido",
    location: "/match",
    style: "whitespace-nowrap",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    name: "Historial",
    location: "/history",
    color: "from-violet-500/20 to-pink-500/20",
  },
]

export default function NavBar() {
  const [menuChecked, setMenuChecked] = useState(false)
  const toggleNavBar = () => setMenuChecked((prev) => !prev)
  const closeNavBar = () => setMenuChecked(false)

  return (
    <div className="relative flex items-center justify-between w-full">
      <button
        aria-label={menuChecked ? "Cerrar menú" : "Abrir menú"}
        className={`md:hidden z-30 border-0 p-2 rounded-lg transition-colors ${
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
        className="absolute right-0 md:static md:right-auto px-3 py-2 rounded"
      >
        <h1 className="text-2xl font-bold whitespace-nowrap">FulbitoApp</h1>
      </Link>

      <nav
        className={`fixed top-0 left-0 h-full w-64 flex flex-col gap-4 bg-gray-50 text-gray-900 p-4 pt-18 z-20 transform transition-transform duration-300 ${
          menuChecked ? "translate-x-0" : "-translate-x-full"
        } md:static md:h-auto md:w-auto md:flex-row md:translate-x-0 md:bg-transparent md:text-white md:p-0 md:items-center`}
      >
        {navigation.map((item) => (
          <Link
            key={item.location}
            href={item.location}
            onClick={closeNavBar}
            className={`group relative overflow-hidden px-4 md:px-1 py-2 rounded lg:px-3 ${item.style ?? ""}`}
          >
            <span
              className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              aria-hidden
            />
            <span className="relative">{item.name}</span>
          </Link>
        ))}
        <div className="hidden md:block w-px h-6 bg-white/30" />

        <div className="mt-auto">
          <NavAuth closeNavBar={closeNavBar} />
        </div>
      </nav>

      <div
        onClick={closeNavBar}
        className={`fixed inset-0 bg-black/70 z-10 transition-opacity duration-300 ${
          menuChecked ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
    </div>
  )
}
