'use client'

import { FiUser } from 'react-icons/fi'
import EmptyState from '@/components/EmptyState'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { usePlayerStore } from '@/store/usePlayerStore'
import PlayerSection from './PlayerSection'
import ProfileHeader from './ProfileHeader'
import RoleRequestSection from './RoleRequestSection'

export default function ProfileClient() {
  const { user, isAdmin } = useFirebaseAuth()
  const player = usePlayerStore((state) => state.players.find((item) => item.id === user?.linkedPlayerId))

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={FiUser}
          title="Iniciá sesión"
          description="Necesitás una cuenta para ver tu perfil."
          action={{ label: 'Iniciar sesión', href: '/login' }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <ProfileHeader email={user.email} roles={user.role} photoUrl={player?.photoUrl} />
      <div className="space-y-6">
        {player && <PlayerSection key={player.id} player={player} index={0} />}
        <RoleRequestSection user={user} isAdmin={isAdmin} index={1} />
      </div>
    </div>
  )
}
