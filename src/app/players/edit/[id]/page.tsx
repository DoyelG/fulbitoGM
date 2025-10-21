'use client'

import { useParams } from 'next/navigation'
import PlayerForm from '../../PlayerForm'

export default function EditPlayerPage() {
  const { id } = useParams()
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar jugador</h1>
      <PlayerForm mode="edit" playerId={id as string} />
    </div>
  )
}