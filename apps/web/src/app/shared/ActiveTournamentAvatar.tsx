'use client'

import Link from 'next/link'
import Image from 'next/image'
import { TrophyIcon } from '@heroicons/react/24/outline'
import { unreadCommentsLabel } from '@fulbito/utils'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import { selectTotalUnread, useUnreadCommentsStore } from '@/store/useUnreadCommentsStore'
import UnreadBadge from '@/components/tournaments/UnreadBadge'

type TournamentPhotoProps = {
  photoUrl?: string
  className?: string
}

export function TournamentPhoto({ photoUrl, className = 'h-10 w-10' }: TournamentPhotoProps) {
  return (
    <span className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}>
      {photoUrl ? (
        <Image src={photoUrl} alt="" fill unoptimized className="object-cover" />
      ) : (
        <TrophyIcon className="h-5 w-5" aria-hidden />
      )}
    </span>
  )
}

export default function ActiveTournamentAvatar() {
  const activeTournament = useTournamentStore(selectActiveTournament)
  const unread = useUnreadCommentsStore(selectTotalUnread)
  if (!activeTournament) return null
  const { name, photoUrl } = activeTournament.tournament

  return (
    <Link
      href="/tournaments"
      aria-label={`Torneo activo: ${name}. Ver mis torneos${unread > 0 ? `. ${unreadCommentsLabel(unread)}` : ''}`}
      className="relative z-10 h-10 w-10 rounded-full bg-white/10 text-white ring-1 ring-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:hidden"
    >
      <TournamentPhoto photoUrl={photoUrl} />
      <UnreadBadge count={unread} className="absolute -right-1.5 -top-1.5" />
    </Link>
  )
}
