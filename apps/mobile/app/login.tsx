'use client'

import { apiFetch } from '@fulbito/state'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { Button, Input, Paragraph, YStack } from 'tamagui'
import { setMobileAuthToken } from '../lib/apiInit'

export default function LoginScreen() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await apiFetch('/api/auth/mobile', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'No se pudo iniciar sesión')
        return
      }
      if (!data.token) {
        setError('Respuesta inválida')
        return
      }
      await setMobileAuthToken(data.token)
      router.back()
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <YStack flex={1} padding={24} gap={16} justifyContent="center" backgroundColor="#f9fafb">
        <Paragraph fontSize={22} fontWeight="700">
          Iniciar sesión
        </Paragraph>
        <Paragraph fontSize={14} color="#6b7280">
          Usa las mismas credenciales que en la web. La API es `EXPO_PUBLIC_API_URL` (tu servidor Next).
        </Paragraph>
        <YStack gap={8}>
          <Paragraph fontSize={13} fontWeight="600">
            Usuario
          </Paragraph>
          <Input
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            borderWidth={1}
            borderColor="#e5e7eb"
            backgroundColor="white"
          />
        </YStack>
        <YStack gap={8}>
          <Paragraph fontSize={13} fontWeight="600">
            Contraseña
          </Paragraph>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
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
          backgroundColor="#7c3aed"
          onPress={onSubmit}
          disabled={loading}
          opacity={loading ? 0.7 : 1}
          style={{ color: '#fff' }}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </YStack>
    </KeyboardAvoidingView>
  )
}
