import PlayerForm from '../PlayerForm'

export default function NewPlayerPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agregar nuevo jugador</h1>
      <PlayerForm mode="create" />
    </div>
  )
}