import Image from 'next/image'
import Link from 'next/link'
import type { ComponentType } from 'react'
import type { AwardAccent } from '@fulbito/utils'

type Props = {
  title: string
  subtitle: string
  Icon: ComponentType<{ className?: string }>
  accent: AwardAccent
  winnerName: string
  winnerPhotoUrl?: string
  value: number
  unitLabel: string
  href: string
}

const ACCENT_BG: Record<AwardAccent, string> = {
  brand: 'bg-[var(--color-brand)]',
  secondary: 'bg-[var(--color-accent)]',
  muted: 'bg-gray-500',
}

export function AwardCard({ title, subtitle, Icon, accent, winnerName, winnerPhotoUrl, value, unitLabel, href }: Props) {
  return (
    <Link href={href} className="group">
      <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${ACCENT_BG[accent]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
          <Image
            src={winnerPhotoUrl ?? '/silhouette.svg'}
            alt={winnerName}
            width={40}
            height={40}
            className="object-cover w-10 h-10 rounded-full"
          />
          <span className="flex-1 font-semibold text-gray-900 truncate">{winnerName}</span>
          <div className="text-right">
            <div className="text-xl font-extrabold text-[var(--color-accent)] leading-tight">{value}</div>
            <div className="text-[10px] font-bold tracking-wide text-gray-500">{unitLabel}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
