import PlayerForm from '../PlayerForm'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export default async function NewPlayerPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as unknown as { role?: string })?.role
  if (role !== 'ADMIN') redirect('/login')
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agregar nuevo jugador</h1>
      <PlayerForm mode="create" />
    </div>
  )
}