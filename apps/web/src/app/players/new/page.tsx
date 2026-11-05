'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PlayerForm from '../PlayerForm'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import PageTitle from '@/components/PageTitle'

export default function NewPlayerPage() {
  const { isAdmin, loading } = useFirebaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/login')
  }, [loading, isAdmin, router])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle>Agregar nuevo jugador</PageTitle>
      <PlayerForm mode="create" />
    </div>
  )
}
