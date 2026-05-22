'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlayerForm from '../PlayerForm'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

export default function NewPlayerPage() {
  const { isAdmin, loading } = useFirebaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/login')
  }, [loading, isAdmin, router])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agregar nuevo jugador</h1>
      <PlayerForm mode="create" />
    </div>
  )
}
