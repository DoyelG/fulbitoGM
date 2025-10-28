'use client'

import { useParams } from 'next/navigation'
import PlayerForm from '../../PlayerForm'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function EditPlayerPage() {
  const { data, status } = useSession()
  const router = useRouter()
  useEffect(() => {
    const role = (data?.user as unknown as { role?: string })?.role
    if (status !== 'loading' && role !== 'ADMIN') router.replace('/login')
  }, [data, status, router])
  const { id } = useParams()
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar jugador</h1>
      <PlayerForm mode="edit" playerId={id as string} />
    </div>
  )
}