import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppBootstrap from "./shared/AppBootstrap"
import AuthProvider from "./shared/AuthProvider"
import NavBar from "./NavBar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FulbitoApp",
  description: "Gestiona el futbol de tu organización",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-gradient-to-r from-brand to-accent text-white shadow-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center">
                  <NavBar />
                </div>
              </div>
            </header>
            <main>{children}</main>
            <AppBootstrap />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
