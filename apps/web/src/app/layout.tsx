import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppBootstrap from "./shared/AppBootstrap"
import AuthProvider from "./shared/AuthProvider"
import AuthGate from "./shared/AuthGate"
import ActiveTournamentGate from "./shared/ActiveTournamentGate"
import NavBar from "./NavBar"
import SiteHeader from "./SiteHeader"
import LinkPlayerModal from "@/components/LinkPlayerModal"

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
            <SiteHeader>
              <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                <div className="flex items-center">
                  <NavBar />
                </div>
              </div>
            </SiteHeader>
            <main>
              <AuthGate>
                <ActiveTournamentGate>{children}</ActiveTournamentGate>
              </AuthGate>
            </main>
            <AppBootstrap />
            <LinkPlayerModal />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
