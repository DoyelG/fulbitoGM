import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Fulbito</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link
            href="/statistics"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Estadísticas</h2>
            <p>Ver estadísticas de los jugadores</p>
          </Link>
          <Link
            href="/players"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Jugadores</h2>
            <p>Gestiona tus jugadores</p>
          </Link>
          <Link
            href="/match"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Preparar partido</h2>
            <p>Arma tu Partido</p>
          </Link>
          <Link
            href="/history"
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Historial de partidos</h2>
            <p>Ver historial de partidos</p>
          </Link>
        </div>
      </div>
    </main>
  )
}