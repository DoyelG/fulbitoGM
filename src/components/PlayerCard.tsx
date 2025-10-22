"use client"

import Image from 'next/image'
import { useRef } from 'react'

type SkillValue = number | 'unknown'

export type PlayerCardProps = {
  overall: number
  photoUrl?: string
  // category skills 1-10; we map them into -like six stats
  skills: { physical: SkillValue; technical: SkillValue; tactical: SkillValue; psychological: SkillValue }
  className?: string
  onUploadPhoto?: (dataUrl: string) => void
}

export default function PlayerCard({ overall, photoUrl, skills, className, onUploadPhoto }: PlayerCardProps) {
  const pathD = "M120 6 C160 6 188 12 207 26 C224 38 232 56 236 75 L236 255 C236 292 205 321 120 354 C35 321 4 292 4 255 L4 75 C8 56 16 38 33 26 C52 12 80 6 120 6 Z";
  const fileRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className={`relative mb-8 ${className ?? ''}`}>
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
      <div className="relative h-full flex flex-col items-center pt-6 px-6 mb-8">
        <div className="flex items-baseline gap-2">
          <div className="text-5xl font-extrabold leading-none drop-shadow-sm">{overall}</div>
        </div>

        <div className="mt-3 w-24 h-24 rounded-full overflow-hidden ring-2 ring-yellow-300 bg-white shadow">
          {photoUrl ? (
            <Image src={photoUrl} alt="player photo" width={96} height={96} className="object-cover w-full h-full" />
          ) :  (
            <>
            <button type="button" aria-label="Subir foto" onClick={() => fileRef.current?.click()} className="w-full h-full grid place-items-center text-4xl">
              👤
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const reader = new FileReader()
                reader.onload = () => onUploadPhoto?.(String(reader.result))
                reader.readAsDataURL(f)
              }}
            />
            </>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-semibold mb-4">
          <div className="flex text-center gap-2"><span>{skills.physical}</span><span>Físico</span></div>
          <div className="flex text-center gap-2"><span>{skills.technical}</span><span>Técnico</span></div>
          <div className="flex text-center gap-2"><span>{skills.tactical}</span><span>Táctico</span></div>
          <div className="flex text-center gap-2"><span>{skills.psychological}</span><span>Mental</span></div>
        </div>
      </div>
    </div>
  )
}


