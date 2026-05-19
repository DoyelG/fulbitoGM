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
  const { signIn, register, signInWithGoogle } = useFirebaseAuth()

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
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white px-2">o</span></div>
        </div>
        <button
          onClick={async () => { setError(null); setLoading(true); try { await signInWithGoogle(); router.push('/') } catch (e) { setError(e instanceof Error ? e.message : 'Error con Google') } finally { setLoading(false) } }}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded py-2 text-sm hover:bg-gray-50 disabled:opacity-70"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuar con Google
        </button>
      </div>
    </div>
  )
}
