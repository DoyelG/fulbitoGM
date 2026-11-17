'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiChevronUp, FiLogOut, FiMessageSquare, FiUser } from 'react-icons/fi'
import { unreadCommentsLabel } from '@fulbito/utils'
import PlayerAvatar from '@/components/home/PlayerAvatar'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { usePlayerStore } from '@/store/usePlayerStore'
import { selectMyPlayerId, useTournamentStore } from '@/store/useTournamentStore'
import { selectOnlyUnreadTournamentId, selectTotalUnread, useUnreadCommentsStore } from '@/store/useUnreadCommentsStore'
import UnreadBadge from '@/components/tournaments/UnreadBadge'
import { useDismissable } from '@/hooks/use-dismissable'
import { menuItemClassName } from './menu-item-class'

type UserMenuProps = {
  closeNavBar?: () => void
}

export default function UserMenu({ closeNavBar }: UserMenuProps) {
  const { user, signOut } = useFirebaseAuth()
  const myPlayerId = useTournamentStore(selectMyPlayerId)
  const linkedPlayer = usePlayerStore((state) => state.players.find((player) => player.id === myPlayerId))
  const unread = useUnreadCommentsStore(selectTotalUnread)
  const onlyUnreadTournamentId = useUnreadCommentsStore(selectOnlyUnreadTournamentId)
  const setActiveTournament = useTournamentStore((state) => state.setActiveTournament)
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const closeMenu = useCallback(() => setIsOpen(false), [])
  const containerRef = useDismissable<HTMLDivElement>(isOpen, closeMenu)

  if (!user) return null

  const displayName = linkedPlayer?.name ?? user.email.split('@')[0]

  const closeAll = () => {
    setIsOpen(false)
    closeNavBar?.()
  }

  const openUnread = () => {
    if (onlyUnreadTournamentId) setActiveTournament(onlyUnreadTournamentId)
    closeAll()
  }

  const handleSignOut = async () => {
    closeAll()
    await signOut()
    router.push('/')
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={unread > 0 ? `Menú de usuario. ${unreadCommentsLabel(unread)}` : 'Menú de usuario'}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center gap-3 rounded-2xl text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 max-sm:bg-primary-gradient max-sm:p-3 max-sm:text-white max-sm:shadow-md max-sm:hover:brightness-110 max-sm:focus-visible:outline-primary sm:block sm:w-auto sm:rounded-full sm:ring-2 sm:ring-white/40 sm:hover:ring-white/80 sm:focus-visible:outline-white"
      >
        <span className="relative block shrink-0 rounded-full max-sm:ring-2 max-sm:ring-white/30">
          <PlayerAvatar name={displayName} photoUrl={linkedPlayer?.photoUrl} size="base" onDark />
          <UnreadBadge count={unread} className="absolute -right-1.5 -top-1.5" />
        </span>
        <span className="min-w-0 flex-1 sm:hidden">
          <span className="block truncate text-sm font-bold">{displayName}</span>
          <span className="block truncate text-xs text-white/80">{user.email}</span>
        </span>
        <FiChevronUp
          aria-hidden
          className={`h-5 w-5 shrink-0 text-white/80 transition-transform sm:hidden ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label="Menú de usuario"
          className="animate-pop-in absolute bottom-full left-0 z-30 mb-3 flex w-full flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-2 text-gray-900 shadow-xl sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mb-0 sm:mt-3 sm:w-64"
        >
          <div className="mb-2 hidden items-center gap-3 rounded-xl bg-primary-gradient p-3 text-white sm:flex">
            <PlayerAvatar name={displayName} photoUrl={linkedPlayer?.photoUrl} size="md" onDark />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{displayName}</p>
              <p className="truncate text-xs text-white/80">{user.email}</p>
            </div>
          </div>
          {unread > 0 && (
            <Link
              href="/profile"
              role="menuitem"
              onClick={openUnread}
              className={`${menuItemClassName} text-orange-800`}
            >
              <FiMessageSquare aria-hidden className="text-secondary" />
              <span className="flex-1">{unreadCommentsLabel(unread)}</span>
              <UnreadBadge count={unread} className="max-sm:hidden" />
            </Link>
          )}
          <Link href="/profile" role="menuitem" onClick={closeAll} className={menuItemClassName}>
            <FiUser aria-hidden className="text-primary" />
            Ver perfil
          </Link>
          <div className="my-1 h-px bg-gray-200" />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className={`${menuItemClassName} text-orange-700 hover:bg-orange-50`}
          >
            <FiLogOut aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
