'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiCamera, FiChevronRight } from 'react-icons/fi'
import { uploadPlayerPhoto } from '@fulbito/firebase'
import type { Match, Player } from '@fulbito/types'
import { calculateCurrentStreakForPlayer, getPlayerMatchSummary, getPositionLabel } from '@fulbito/utils'
import { usePlayerStore } from '@/store/usePlayerStore'

type PlayerSectionProps = {
  player: Player
  matches: Match[]
  index: number
}

function PlayerPhotoButton({ player }: { player: Player }) {
  const updatePlayer = usePlayerStore((state) => state.updatePlayer)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setErrorMessage(null)
    setIsUploading(true)
    try {
      const photoUrl = await uploadPlayerPhoto(file, player.tournamentId, player.id)
      await updatePlayer(player.id, { photoUrl })
    } catch {
      setPreview(null)
      setErrorMessage('No se pudo cambiar la foto. Probá de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-label={`Cambiar foto de ${player.name}`}
        aria-describedby={errorMessage ? 'player-photo-error' : undefined}
        aria-busy={isUploading}
        className="group relative h-20 w-20 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait"
      >
        <span className="absolute inset-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-primary/30">
          <Image
            src={preview ?? player.photoUrl ?? '/silhouette.svg'}
            alt=""
            fill
            unoptimized
            sizes="80px"
            className="object-cover transition group-hover:brightness-90"
          />
          {isUploading && (
            <span className="absolute inset-0 grid place-items-center bg-black/40">
              <span className="animate-spin text-lg leading-none">⚽</span>
            </span>
          )}
        </span>
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-primary text-white shadow-sm"
        >
          <FiCamera className="h-4 w-4" />
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event) => void handlePhotoChange(event)}
        tabIndex={-1}
        aria-hidden
        className="hidden"
      />
      <span role="status" className="sr-only">
        {isUploading ? 'Subiendo foto…' : ''}
      </span>
      {errorMessage && (
        <p id="player-photo-error" role="alert" className="max-w-32 text-center text-xs text-orange-700">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default function PlayerSection({ player, matches, index }: PlayerSectionProps) {
  const summary = useMemo(() => getPlayerMatchSummary(matches, player.id), [matches, player.id])
  const streak = useMemo(() => calculateCurrentStreakForPlayer(matches, player.id), [matches, player.id])
  const streakValue = streak.kind && streak.count > 0 ? `${streak.kind === 'win' ? 'W' : 'L'}${streak.count}` : '—'
  const streakDescription =
    streak.kind && streak.count > 0
      ? `${streak.count} ${streak.kind === 'win' ? 'ganados' : 'perdidos'} seguidos`
      : 'Sin racha'
  const stats = [
    { label: 'Partidos', value: summary.matches },
    { label: 'Goles', value: summary.goals },
    { label: 'Victorias', value: `${summary.winRate}%` },
    { label: 'Racha', value: streakValue, description: streakDescription },
  ]

  return (
    <div style={{ animationDelay: `${index * 80}ms` }} className="animate-fade-up">
      <section aria-label="Mi jugador" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <PlayerPhotoButton player={player} />
          <Link
            href={`/players/${player.id}`}
            className="group -m-2 min-w-0 flex-1 rounded-xl p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold text-gray-900">{player.name}</span>
                <span className="block text-sm text-gray-700">
                  {getPositionLabel(player.position)}
                </span>
              </span>
              <span className="flex shrink-0 items-center text-sm font-semibold text-primary">
                <span className="max-sm:sr-only">Ver perfil</span>
                <FiChevronRight aria-hidden className="h-5 w-5 transition group-hover:translate-x-0.5" />
              </span>
            </span>
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-gray-50 px-3 py-2">
                  <dt className="text-xs font-medium text-gray-700">{stat.label}</dt>
                  <dd className="text-lg font-bold tabular-nums text-gray-900">
                    <span aria-hidden={stat.description ? true : undefined}>{stat.value}</span>
                    {stat.description && <span className="sr-only">{stat.description}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </Link>
        </div>
      </section>
    </div>
  )
}
