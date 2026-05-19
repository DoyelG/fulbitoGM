'use client'

import { useParams, useRouter } from 'next/navigation'
import PlayerForm from '../../PlayerForm'
import { useEffect } from 'react'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

export default function EditPlayerPage() {
  const { isAdmin, loading } = useFirebaseAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/login')
  }, [loading, isAdmin, router])
  const { id } = useParams()
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar jugador</h1>
      <PlayerForm mode="edit" playerId={id as string} />
    </div>
  )
}
