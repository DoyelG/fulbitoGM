'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn, register } = useFirebaseAuth()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(email, password)
      } else {
        await signIn(email, password)
      }
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-l ${mode === 'signin' ? 'bg-brand text-white' : 'bg-gray-100'}`}
            onClick={() => setMode('signin')}
          >
            Iniciar sesión
          </button>
          <button
            className={`flex-1 py-2 rounded-r ${mode === 'register' ? 'bg-brand text-white' : 'bg-gray-100'}`}
            onClick={() => setMode('register')}
          >
            Registrarse
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              autoComplete="current-password"
              required
              minLength={6}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-brand text-white py-2 rounded hover:bg-brand/90 disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Procesando…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
          {mode === 'register' && (
            <p className="text-xs text-gray-700">
              Rol por defecto: Usuario (lectura). Un administrador puede otorgar permisos de edición.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
