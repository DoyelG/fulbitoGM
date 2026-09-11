"use client"

import Image from 'next/image'
import type { SkillValue } from '@fulbito/types'
import { FiTrash2 } from 'react-icons/fi'
import Tooltip from '@/components/Tooltip'

export type PlayerCardProps = {
  overall: number
  photoUrl?: string | null
  skills: { physical: SkillValue; technical: SkillValue; tactical: SkillValue; psychological: SkillValue }
  goalkeeping?: number
  className?: string
  onAvatarClick?: () => void
  editMode?: boolean
  deletePhoto?: () => void
}

export default function PlayerCard({ overall, photoUrl, skills, goalkeeping, className, onAvatarClick, editMode = false, deletePhoto }: PlayerCardProps) {
  const pathD = "M120 6 C160 6 188 12 207 26 C224 38 232 56 236 75 L236 255 C236 292 205 321 120 354 C35 321 4 292 4 255 L4 75 C8 56 16 38 33 26 C52 12 80 6 120 6 Z";

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Decorative SVG background with shield-like FIFA shape */}
      <svg className="absolute inset-0" viewBox="0 0 240 360" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="cardFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff0b3" />
            <stop offset="40%" stopColor="#ffd25e" />
            <stop offset="100%" stopColor="#f0b43a" />
          </linearGradient>
          <linearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff7d1" />
            <stop offset="50%" stopColor="#b88a2b" />
            <stop offset="100%" stopColor="#ffe69a" />
          </linearGradient>
          <radialGradient id="shine" cx="50%" cy="18%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.0)" />
          </radialGradient>
        </defs>

        {/* Base */}
        <path d={pathD} fill="url(#cardFill)" />
        {/* Border */}
        <path d={pathD} fill="none" stroke="url(#borderGrad)" strokeWidth="6" />
        {/* Inner highlight */}
        <path d={pathD} fill="url(#shine)" opacity="0.35" />

        {/* Subtle inner border */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

      </svg>

      {/* Content */}
      <div className="relative min-h-[320px] h-full flex flex-col items-center pt-6 px-6">
        <div className="flex items-baseline gap-2">
          <div className="text-5xl font-extrabold leading-none drop-shadow-sm">{overall}</div>
        </div>

        <div className="relative mt-3">
          <div
            className={`w-24 h-24 rounded-full overflow-hidden ring-2 ring-yellow-300 bg-white shadow ${onAvatarClick && editMode ? 'cursor-pointer' : ''}`}
            onClick={onAvatarClick}
            {...(onAvatarClick && editMode
              ? {
                  role: 'button' as const,
                  tabIndex: 0,
                  'aria-label': 'Cambiar foto',
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') onAvatarClick()
                  },
                }
              : {})}
          >
            {photoUrl ? (
              <Image src={photoUrl} alt="player photo" width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <Image src="/silhouette.svg" alt="player placeholder" width={96} height={96} className="object-cover w-full h-full" />
            )}
          </div>

          {editMode && photoUrl && (
            <div className="absolute -top-1 -right-1">
              <Tooltip label="Eliminar foto" variant="danger" position="top">
                <button
                  type="button"
                  aria-label="Eliminar foto"
                  onClick={deletePhoto}
                  className="w-6 h-6 rounded-full bg-white ring-1 ring-gray-300 shadow flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <FiTrash2 size={14} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-semibold mb-4">
          <div className="flex text-center gap-2"><span>{skills.physical}</span><span>Físico</span></div>
          <div className="flex text-center gap-2"><span>{skills.technical}</span><span>Técnico</span></div>
          <div className="flex text-center gap-2"><span>{skills.tactical}</span><span>Táctico</span></div>
          <div className="flex text-center gap-2"><span>{skills.psychological}</span><span>Mental</span></div>
          {goalkeeping != null ? (
            <div className="col-span-2 flex justify-center text-center gap-2"><span>{goalkeeping}</span><span>Arquero</span></div>
          ) : null}
        </div>
      </div>
    </div>
  )
}


