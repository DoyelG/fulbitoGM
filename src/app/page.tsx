import Link from 'next/link'
import { ChartBarIcon, UserGroupIcon, PlayIcon, ClockIcon } from '@heroicons/react/24/outline'

const cards = [
  {
    href: '/statistics',
    title: 'Estadísticas',
    desc: 'Ver estadísticas de los jugadores',
    Icon: ChartBarIcon,
    color: 'from-indigo-500/20 to-fuchsia-500/20'
  },
  {
    href: '/players',
    title: 'Jugadores',
    desc: 'Gestiona tus jugadores',
    Icon: UserGroupIcon,
    color: 'from-emerald-500/20 to-cyan-500/20'
  },
  {
    href: '/match',
    title: 'Preparar partido',
    desc: 'Arma tu Partido',
    Icon: PlayIcon,
    color: 'from-amber-500/20 to-orange-500/20'
  },
  {
    href: '/history',
    title: 'Historial de partidos',
    desc: 'Ver historial de partidos',
    Icon: ClockIcon,
    color: 'from-violet-500/20 to-pink-500/20'
  }
]

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_10%_-20%,rgba(99,102,241,0.18),transparent),radial-gradient(800px_500px_at_90%_0,rgba(236,72,153,0.18),transparent)]" />

      <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">FulbitoApp</span>
          </h1>
          <p className="mt-3 text-gray-800 max-w-2xl mx-auto">Organiza tus partidos, evalúa rendimientos y mantén el historial de tus equipos en un solo lugar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ href, title, desc, Icon, color }) => (
            <Link key={href} href={href} className="group">
              <div className={`relative h-full rounded-xl border border-white/60 bg-white/90 backdrop-blur p-5 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5` }>
                <div className={`absolute -inset-px rounded-xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity`} aria-hidden />
                <div className="relative flex items-start gap-4">
                  <div className="rounded-lg p-2.5 bg-white ring-1 ring-gray-200 shadow-sm">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <p className="mt-1 text-sm text-gray-700">{desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}