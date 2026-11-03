'use client'

import { FiUser } from 'react-icons/fi'
import EmptyState from '@/components/EmptyState'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import VideoClipsSection from '@/components/videoClips/VideoClipsSection'
import PlayerSection from './PlayerSection'
import ProfileHeader from './ProfileHeader'
import RoleRequestSection from './RoleRequestSection'

export default function ProfileClient() {
  const { user, isAdmin } = useFirebaseAuth()
  const player = usePlayerStore((state) => state.players.find((item) => item.id === user?.linkedPlayerId))
  const matches = useMatchStore((state) => state.matches)

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
        {player && (
          <div style={{ animationDelay: '80ms' }} className="animate-fade-up">
            <VideoClipsSection player={player} matches={matches} canUpload />
          </div>
        )}
        <RoleRequestSection user={user} isAdmin={isAdmin} index={2} />
      </div>
    </div>
  )
}
