import Image from 'next/image'
import Link from 'next/link'
import { useId, type ComponentType } from 'react'
import type { AwardAccent } from '@fulbito/utils'

type Props = {
  Icon: ComponentType<{ className?: string }>
  accent: AwardAccent
  winnerName: string
  winnerPhotoUrl?: string
  value: number
  unitLabel: string
  href: string
}

const CARD_PATH = 'M40 0 L200 0 L240 40 L240 320 L200 360 L40 360 L0 320 L0 40 Z'

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

const RING_COLOR: Record<AwardAccent, string> = {
  brand: 'var(--color-brand)',
  secondary: 'var(--color-accent)',
  muted: '#9ca3af',
}

export function AwardCard({ Icon, accent, winnerName, winnerPhotoUrl, value, unitLabel, href }: Props) {
  const uid = useId()
  const fillId = `${uid}-fill`
  const borderId = `${uid}-border`
  const shineId = `${uid}-shine`
  const foilId = `${uid}-foil`
  const clipId = `${uid}-clip`

  const [fillLight, fillMid, fillDark] = ACCENT_GRADIENTS[accent].fill
  const [borderLight, borderMid, borderDark] = ACCENT_GRADIENTS[accent].border
  const ringColor = RING_COLOR[accent]

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
            <radialGradient id={shineId} cx="50%" cy="15%" r="65%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <linearGradient id={foilId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0)" />
              <stop offset="52%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="59%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <clipPath id={clipId}>
              <path d={CARD_PATH} />
            </clipPath>
          </defs>

          <path d={CARD_PATH} fill={`url(#${fillId})`} />
          <path d={CARD_PATH} fill={`url(#${shineId})`} opacity="0.35" />

          <g clipPath={`url(#${clipId})`}>
            <rect x="-40" y="-40" width="320" height="440" fill={`url(#${foilId})`} />
          </g>

          <path d={CARD_PATH} fill="none" stroke={`url(#${borderId})`} strokeWidth="8" />
          <g transform="translate(120 180) scale(0.93) translate(-120 -180)">
            <path d={CARD_PATH} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
          </g>

          <rect
            x="106"
            y="-8"
            width="28"
            height="28"
            transform="rotate(45 120 6)"
            fill={`url(#${borderId})`}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.5"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-8 text-center text-gray-900">
          <div className="text-4xl font-black italic leading-none drop-shadow-sm">{value}</div>
          <div className="mt-1 text-[11px] font-bold tracking-[0.15em]">{unitLabel}</div>

          <div className={`mt-2 rounded-full bg-white/70 p-1.5 ${ICON_TEXT[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>

          <div
            className="mt-3 h-[68px] w-[68px] overflow-hidden rounded-full bg-white shadow-lg ring-2 ring-white"
            style={{ boxShadow: `0 0 0 4px ${ringColor}` }}
          >
            <Image
              src={winnerPhotoUrl ?? '/silhouette.svg'}
              alt={winnerName}
              width={68}
              height={68}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-4 w-full max-w-[85%] truncate rounded-full bg-black/10 px-3 py-1 text-sm font-black italic tracking-wide">
            {winnerName}
          </div>
        </div>
      </div>
    </Link>
  )
}
