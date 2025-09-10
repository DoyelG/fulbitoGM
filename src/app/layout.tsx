import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fulbito Manager',
  description: 'Manage your football team and matches',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-gradient-to-r from-brand to-accent text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">⚽ Fulbito</h1>
                <nav className="flex space-x-4">
                  <Link href="/" className="hover:bg-white/20 px-3 py-2 rounded">Home</Link>
                  <Link href="/players" className="hover:bg-white/20 px-3 py-2 rounded">Players</Link>
                  <Link href="/match" className="hover:bg-white/20 px-3 py-2 rounded">Match</Link>
                  <Link href="/history" className="hover:bg-white/20 px-3 py-2 rounded">History</Link>
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}