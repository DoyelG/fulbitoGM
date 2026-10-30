'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlayerForm from '../PlayerForm'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'

export default function NewPlayerPage() {
  const { loading } = useFirebaseAuth()
  const canManage = useCanManageTournament()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !canManage) router.replace('/login')
  }, [loading, canManage, router])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agregar jugador</h1>
        <p className="mt-1 text-sm text-gray-700">
          Cargá sus datos y, si querés, vinculalo con una persona del torneo.
        </p>
      </header>
      <PlayerForm mode="create" />
    </div>
  )
}
