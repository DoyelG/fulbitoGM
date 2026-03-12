import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import AppBootstrap from "./shared/AppBootstrap";
import AuthProvider from "./shared/AuthProvider";
import NavAuth from "./shared/NavAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FulbitoApp",
  description: "Gestiona el futbol de tu organización",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-gradient-to-r from-brand to-accent text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <Link href="/" className="px-3 py-2 rounded">
                  <h1 className="text-2xl font-bold">FulbitoApp</h1>
                </Link>
                <nav className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Link
                      href="/statistics"
                      className="hover:bg-white/20 px-3 py-2 rounded"
                    >
                      Estadísticas
                    </Link>
                    <Link
                      href="/players"
                      className="hover:bg-white/20 px-3 py-2 rounded"
                    >
                      Jugadores
                    </Link>
                    <Link
                      href="/match"
                      className="hover:bg-white/20 px-3 py-2 rounded"
                    >
                      Nuevo partido
                    </Link>
                    <Link
                      href="/history"
                      className="hover:bg-white/20 px-3 py-2 rounded"
                    >
                      Historial
                    </Link>
                  </div>
                  <div className="w-px h-6 bg-white/30" />
                  <NavAuth />
                </nav>
              </div>
            </div>
            </header>
            <main>{children}</main>
            <AppBootstrap />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
