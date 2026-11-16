'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlayerForm from '../PlayerForm'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import PageTitle from '@/components/PageTitle'

export default function NewPlayerPage() {
  const { loading } = useFirebaseAuth()
  const canManage = useCanManageTournament()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !canManage) router.replace('/login')
  }, [loading, canManage, router])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle spacing={0}>Agregar jugador</PageTitle>
      <p className="mt-1 mb-6 text-sm text-gray-700">
        Cargá sus datos y, si querés, vinculalo con una persona del torneo.
      </p>
      <PlayerForm mode="create" />
    </div>
  )
}
