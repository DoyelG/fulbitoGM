'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiBell, FiLogOut, FiUser } from 'react-icons/fi'
import PlayerAvatar from '@/components/home/PlayerAvatar'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useNotificationStore } from '@/store/useNotificationStore'
import { usePlayerStore } from '@/store/usePlayerStore'

type UserMenuProps = {
  closeNavBar?: () => void
}

const itemClassName =
  'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand'

export default function UserMenu({ closeNavBar }: UserMenuProps) {
  const { user, signOut } = useFirebaseAuth()
  const { players } = usePlayerStore()
  const pendingCount = useNotificationStore((state) => state.notifications.length)
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  if (!user) return null

  const linkedPlayer = players.find((player) => player.id === user.linkedPlayerId)
  const displayName = linkedPlayer?.name ?? user.email.split('@')[0]

  const closeAll = () => {
    setIsOpen(false)
    closeNavBar?.()
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
        aria-label={pendingCount > 0 ? `Menú de usuario, ${pendingCount} notificaciones pendientes` : 'Menú de usuario'}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="relative block rounded-full ring-2 ring-white/40 transition hover:ring-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <PlayerAvatar name={displayName} photoUrl={linkedPlayer?.photoUrl} size="base" onDark />
        {pendingCount > 0 && (
          <span aria-hidden className="absolute -right-1 -top-1 flex h-5 min-w-5">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white ring-2 ring-night">
              {pendingCount}
            </span>
          </span>
        )}
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label="Menú de usuario"
          className="animate-pop-in absolute bottom-full left-0 z-30 mb-3 w-64 rounded-2xl border border-gray-200 bg-white p-2 text-gray-900 shadow-xl md:bottom-auto md:left-auto md:right-0 md:mb-0 md:mt-3"
        >
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-scoreboard p-3 text-white">
            <PlayerAvatar name={displayName} photoUrl={linkedPlayer?.photoUrl} size="md" onDark />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{displayName}</p>
              <p className="truncate text-xs text-white/80">{user.email}</p>
            </div>
          </div>
          <Link href="/profile" role="menuitem" onClick={closeAll} className={itemClassName}>
            <FiUser aria-hidden className="text-brand" />
            Ver perfil
          </Link>
          <Link href="/notifications" role="menuitem" onClick={closeAll} className={itemClassName}>
            <FiBell aria-hidden className="text-brand" />
            Notificaciones
            {pendingCount > 0 && (
              <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
                {pendingCount}
              </span>
            )}
          </Link>
          <div className="my-1 h-px bg-gray-200" />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className={`${itemClassName} text-red-600 hover:bg-red-50`}
          >
            <FiLogOut aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
