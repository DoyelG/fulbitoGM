'use client'

import { useParams, useRouter } from 'next/navigation'
import PlayerForm from '../../PlayerForm'
import { useEffect } from 'react'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'

export default function EditPlayerPage() {
  const { loading } = useFirebaseAuth()
  const canManage = useCanManageTournament()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !canManage) router.replace('/login')
  }, [loading, canManage, router])
  const { id } = useParams()
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar jugador</h1>
      <PlayerForm mode="edit" playerId={id as string} />
    </div>
  )
}
