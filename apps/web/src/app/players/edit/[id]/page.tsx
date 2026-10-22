'use client'

import { useParams, useRouter } from 'next/navigation'
import PlayerForm from '../../PlayerForm'
import { useEffect } from 'react'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import PageTitle from '@/components/PageTitle'

export default function EditPlayerPage() {
  const { isAdmin, loading } = useFirebaseAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !isAdmin) router.replace('/login')
  }, [loading, isAdmin, router])
  const { id } = useParams()
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle>Editar jugador</PageTitle>
      <PlayerForm mode="edit" playerId={id as string} />
    </div>
  )
}
