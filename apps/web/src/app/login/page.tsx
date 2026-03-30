'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button, Input, Paragraph, Separator, XStack, YStack } from 'tamagui'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Registration failed' }))
          throw new Error(data.error || 'Registration failed')
        }
      }
      const r = await signIn('credentials', { username, password, redirect: false })
      if (r?.error) throw new Error(r.error)
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack minHeight="60vh" justifyContent="center" alignItems="center" padding={24}>
      <YStack width="100%" maxWidth={440} backgroundColor="white" borderRadius={12} padding={24} gap={16} boxShadow="0 4px 24px rgba(0,0,0,0.08)">
        <XStack borderRadius={8} overflow="hidden">
          <Button
            flex={1}
            size="$4"
            borderRadius={0}
            backgroundColor={mode === 'signin' ? '#7c3aed' : '#f3f4f6'}
            style={{ color: mode === 'signin' ? '#fff' : '#374151' }}
            onPress={() => setMode('signin')}
          >
            Iniciar sesión
          </Button>
          <Button
            flex={1}
            size="$4"
            borderRadius={0}
            backgroundColor={mode === 'register' ? '#7c3aed' : '#f3f4f6'}
            style={{ color: mode === 'register' ? '#fff' : '#374151' }}
            onPress={() => setMode('register')}
          >
            Registrarse
          </Button>
        </XStack>
        <Separator />
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <YStack gap={8}>
            <Paragraph fontSize={14} color="#374151">
              Usuario
            </Paragraph>
            <Input
              value={username}
              onChangeText={setUsername}
              autoComplete="username"
              borderWidth={1}
              borderColor="#e5e7eb"
              backgroundColor="white"
            />
          </YStack>
          <YStack gap={8}>
            <Paragraph fontSize={14} color="#374151">
              Contraseña
            </Paragraph>
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              borderWidth={1}
              borderColor="#e5e7eb"
              backgroundColor="white"
            />
          </YStack>
          {error ? (
            <Paragraph color="#dc2626" fontSize={14}>
              {error}
            </Paragraph>
          ) : null}
          <Button
            type="submit"
            backgroundColor="#7c3aed"
            disabled={loading}
            opacity={loading ? 0.7 : 1}
            style={{ color: '#fff' }}
          >
            {loading ? 'Procesando…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </Button>
          {mode === 'register' ? (
            <Paragraph fontSize={12} color="#374151">
              Rol por defecto: Usuario (lectura). Un administrador puede otorgar permisos de edición.
            </Paragraph>
          ) : null}
        </form>
      </YStack>
    </YStack>
  )
}
