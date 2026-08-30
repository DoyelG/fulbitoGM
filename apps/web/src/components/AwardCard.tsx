import Image from 'next/image'
import Link from 'next/link'
import { useId, type ComponentType } from 'react'
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

// Same shield shape as apps/web/src/components/PlayerCard.tsx, reused so award
// cards read as "the same visual family" as the FIFA-style player cards.
const SHIELD_PATH =
  'M120 6 C160 6 188 12 207 26 C224 38 232 56 236 75 L236 255 C236 292 205 321 120 354 C35 321 4 292 4 255 L4 75 C8 56 16 38 33 26 C52 12 80 6 120 6 Z'

const ACCENT_GRADIENTS: Record<AwardAccent, { fill: [string, string, string]; border: [string, string, string] }> = {
  brand: {
    fill: ['#f5f3ff', '#ddd6fe', '#c4b5fd'],
    border: ['#f5f3ff', 'var(--color-brand)', 'var(--color-brand-dark)'],
  },
  secondary: {
    fill: ['#fff7ed', '#fed7aa', '#fdba74'],
    border: ['#fff7ed', 'var(--color-accent)', '#9a3412'],
  },
  muted: {
    fill: ['#f9fafb', '#e5e7eb', '#d1d5db'],
    border: ['#f9fafb', '#9ca3af', '#4b5563'],
  },
}

const ICON_TEXT: Record<AwardAccent, string> = {
  brand: 'text-violet-700',
  secondary: 'text-orange-800',
  muted: 'text-gray-700',
}

export function AwardCard({ title, subtitle, Icon, accent, winnerName, winnerPhotoUrl, value, unitLabel, href }: Props) {
  // Unique per rendered instance (not derived from props) so multiple AwardCards
  // on the same page never collide on SVG gradient ids.
  const uid = useId()
  const fillId = `${uid}-fill`
  const borderId = `${uid}-border`
  const shineId = `${uid}-shine`

  const [fillLight, fillMid, fillDark] = ACCENT_GRADIENTS[accent].fill
  const [borderLight, borderMid, borderDark] = ACCENT_GRADIENTS[accent].border

  return (
    <Link href={href} className="group block">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[220px] transition-transform duration-200 group-hover:-translate-y-1">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 360" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillLight} />
              <stop offset="40%" stopColor={fillMid} />
              <stop offset="100%" stopColor={fillDark} />
            </linearGradient>
            <linearGradient id={borderId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={borderLight} />
              <stop offset="50%" stopColor={borderMid} />
              <stop offset="100%" stopColor={borderDark} />
            </linearGradient>
            <radialGradient id={shineId} cx="50%" cy="18%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <path d={SHIELD_PATH} fill={`url(#${fillId})`} />
          <path d={SHIELD_PATH} fill="none" stroke={`url(#${borderId})`} strokeWidth="6" />
          <path d={SHIELD_PATH} fill={`url(#${shineId})`} opacity="0.35" />
          <path d={SHIELD_PATH} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center px-5 pt-7 text-center text-gray-900">
          <div className="text-4xl font-extrabold leading-none drop-shadow-sm">{value}</div>
          <div className="mt-1 text-[11px] font-bold tracking-wide">{unitLabel}</div>

          <div className={`mt-2 rounded-full bg-white/70 p-1.5 ${ICON_TEXT[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>

          <div className="mt-3 h-16 w-16 overflow-hidden rounded-full bg-white shadow ring-2 ring-white">
            <Image
              src={winnerPhotoUrl ?? '/silhouette.svg'}
              alt={winnerName}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-2 w-full truncate font-bold">{winnerName}</div>

          <div className="mt-3 w-full border-t border-white/50 pt-2">
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-gray-700">{subtitle}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
