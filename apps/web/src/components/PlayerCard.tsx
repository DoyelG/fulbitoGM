"use client"

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import { TrophyIcon } from '@heroicons/react/24/solid'
import type { SkillValue } from '@fulbito/types'
import { positionShortLabels } from '@fulbito/utils'
import PlayerCardName from '@/components/PlayerCardName'
import PlayerCardPhoto from '@/components/PlayerCardPhoto'
import PlayerPhotoModal from '@/components/PlayerPhotoModal'

export type PlayerCardProps = {
  name: string
  position: string
  overall: number
  photoUrl?: string | null
  skills: { physical: SkillValue; technical: SkillValue; tactical: SkillValue; psychological: SkillValue }
  goalkeeping?: number
  tournamentPhotoUrl?: string | null
  photoFooter?: ReactNode
  className?: string
}

const cardPath =
  'M6 44 Q34 40 40 6 L200 6 Q206 40 234 44 L234 242 C234 260 222 268 204 276 L132 302 Q120 306 108 302 L36 276 C18 268 6 260 6 242 Z'

function StatColumn({ value, label }: { value: SkillValue | number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[13px] font-semibold tracking-wide">{label}</span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
    </div>
  )
}

export default function PlayerCard({ name, position, overall, photoUrl, skills, goalkeeping, tournamentPhotoUrl, photoFooter, className }: PlayerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const canExpand = Boolean(photoUrl) || Boolean(photoFooter)

  return (
    <div className={`relative h-[310px] w-60 text-card-ink ${canExpand ? 'group' : ''} ${className ?? ''}`}>
      <svg
        className="absolute inset-0 h-full w-full drop-shadow-md transition-[filter] duration-200 group-hover:drop-shadow-[0_16px_14px_rgb(0_0_0/0.13)]"
        viewBox="0 0 240 310"
        aria-hidden
      >
        <defs>
          <linearGradient id="playerCardFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" className="[stop-color:var(--color-card-gold-light)]" />
            <stop offset="55%" className="[stop-color:var(--color-card-gold)]" />
            <stop offset="100%" className="[stop-color:var(--color-card-gold-dark)]" />
          </linearGradient>
          <radialGradient id="playerCardShine" cx="30%" cy="20%" r="80%">
            <stop offset="0%" stopOpacity="0.7" className="[stop-color:var(--color-card-gold-light)]" />
            <stop offset="100%" stopOpacity="0" className="[stop-color:var(--color-card-gold-light)]" />
          </radialGradient>
        </defs>
        <path d={cardPath} fill="url(#playerCardFill)" />
        <path d={cardPath} fill="url(#playerCardShine)" />
        <path d={cardPath} fill="none" strokeWidth="2" className="stroke-card-gold-edge" />
      </svg>

      <div className="relative flex h-full flex-col px-4 pt-8">
        <div className="absolute top-11 left-5 z-10 flex flex-col items-center leading-none">
          <span className="text-4xl font-bold tabular-nums">{Math.round(overall)}</span>
          {positionShortLabels[position] && (
            <span className="text-sm font-bold">{positionShortLabels[position]}</span>
          )}
        </div>
        <div className="absolute top-12 right-5 z-10 h-8 w-8 overflow-hidden rounded-full ring-1 ring-card-gold-edge/60">
          {tournamentPhotoUrl ? (
            <Image src={tournamentPhotoUrl} alt="" fill unoptimized sizes="32px" className="object-cover" />
          ) : (
            <TrophyIcon className="absolute inset-0 m-auto h-4 w-4 text-card-gold-edge" aria-hidden />
          )}
        </div>
        <PlayerCardPhoto src={photoUrl} name={name} />

        <PlayerCardName name={name} />

        <div className="mt-2 flex justify-center gap-2.5">
          <StatColumn value={skills.physical} label="FÍS" />
          <StatColumn value={skills.technical} label="TÉC" />
          <StatColumn value={skills.tactical} label="TÁC" />
          <StatColumn value={skills.psychological} label="MEN" />
          {goalkeeping != null && <StatColumn value={goalkeeping} label="ARQ" />}
        </div>
      </div>

      {canExpand && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={photoUrl ? `Ver foto de ${name}` : `Editar a ${name}`}
            className="absolute inset-0 z-20 cursor-pointer rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <PlayerPhotoModal
            open={expanded}
            onClose={() => setExpanded(false)}
            name={name}
            photoUrl={photoUrl}
            footer={photoFooter}
          />
        </>
      )}
    </div>
  )
}
