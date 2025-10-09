import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import AppBootstrap from './shared/AppBootstrap'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fulbito',
  description: 'Gestiona el futbol de tu organización',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-gradient-to-r from-brand to-accent text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">⚽ Fulbito</h1>
                <nav className="flex space-x-4">
                  <Link href="/" className="hover:bg-white/20 px-3 py-2 rounded">Inicio</Link>
                  <Link href="/statistics" className="hover:bg-white/20 px-3 py-2 rounded">Estadísticas</Link>
                  <Link href="/players" className="hover:bg-white/20 px-3 py-2 rounded">Jugadores</Link>
                  <Link href="/match" className="hover:bg-white/20 px-3 py-2 rounded">Nuevo partido</Link>
                  <Link href="/history" className="hover:bg-white/20 px-3 py-2 rounded">Historial</Link>
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <AppBootstrap />
        </div>
      </body>
    </html>
  )
}