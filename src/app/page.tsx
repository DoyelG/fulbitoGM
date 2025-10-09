import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Fulbito Manager</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/statistics" 
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Statistics</h2>
            <p>See players statistics</p>
          </Link>
          <Link 
            href="/players" 
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Players</h2>
            <p>Manage your football players</p>
          </Link>
          <Link 
            href="/match" 
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Prepare Match</h2>
            <p>Create and manage matches</p>
          </Link>
          <Link 
            href="/history" 
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Match History</h2>
            <p>View past matches and statistics</p>
          </Link>
        </div>
      </div>
    </main>
  )
}