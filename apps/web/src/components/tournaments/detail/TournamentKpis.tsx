import type { ComponentType, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { CurrentChampion } from '@fulbito/utils'
import { formatMatchDate } from '@fulbito/utils'
import { CalendarDaysIcon, FireIcon, TrophyIcon, UsersIcon } from '@heroicons/react/24/outline'

type Props = {
  champion: CurrentChampion | null
  members: number
  matchesPlayed: number
  goals: number
}

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>

const cardClassName =
  'flex h-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors ' +
  'hover:border-brand/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand'

function KpiIcon({ icon: Icon, tone = 'brand' }: { icon: IconType; tone?: 'brand' | 'gold' }) {
  const toneClassName = tone === 'gold' ? 'bg-amber-100 text-amber-700' : 'bg-brand/10 text-brand'
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClassName}`}>
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  )
}

function KpiLink({ href, className = '', children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <li className={className}>
      <Link href={href} className={cardClassName}>
        {children}
      </Link>
    </li>
  )
}

export default function TournamentKpis({ champion, members, matchesPlayed, goals }: Props) {
  const numbers: { label: string; value: number; icon: IconType; href: string }[] = [
    { label: 'Miembros', value: members, icon: UsersIcon, href: '/players' },
    { label: 'Partidos', value: matchesPlayed, icon: CalendarDaysIcon, href: '/history' },
    { label: 'Goles', value: goals, icon: FireIcon, href: '/statistics' },
  ]

  return (
    <ul className="grid grid-cols-3 gap-3 lg:grid-cols-5" aria-label="Resumen del torneo">
      <KpiLink href="/awards" className="col-span-3 lg:col-span-2">
        {champion?.playerPhotoUrl ? (
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-amber-100">
            <Image src={champion.playerPhotoUrl} alt="" fill unoptimized sizes="40px" className="object-cover" />
          </span>
        ) : (
          <KpiIcon icon={TrophyIcon} tone="gold" />
        )}
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium text-gray-700">Campeón vigente</span>
          {champion ? (
            <>
              <span className="block truncate text-xl font-bold text-gray-900">{champion.playerName}</span>
              <span className="block text-xs text-gray-700">
                Campeón desde el {formatMatchDate(champion.wonAt.slice(0, 10))}
              </span>
            </>
          ) : (
            <span className="block text-base italic text-gray-700">Todavía no hay campeón</span>
          )}
        </span>
      </KpiLink>
      {numbers.map(({ label, value, icon, href }) => (
        <KpiLink key={label} href={href}>
          <span className="flex w-full flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <KpiIcon icon={icon} />
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-gray-700">{label}</span>
              <span className="block text-xl font-bold text-gray-900">{value.toLocaleString('es-AR')}</span>
            </span>
          </span>
        </KpiLink>
      ))}
    </ul>
  )
}
