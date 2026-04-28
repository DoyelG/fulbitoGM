import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { loginWithCredentials, registerAccount } from '@/lib/auth'
import { styles } from './login.styles'

const BRAND = '#7c3aed'

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const router = useRouter()

  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        await registerAccount(username, password)
      }
      await loginWithCredentials(username, password)
      router.replace('/(tabs)/statistics')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: theme.text }]}>Fulbito</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            Misma cuenta que en la web
          </Text>

          <View style={styles.segment}>
            <Pressable
              style={[styles.segmentBtn, mode === 'signin' && styles.segmentBtnActive]}
              onPress={() => setMode('signin')}
            >
              <Text style={[styles.segmentText, mode === 'signin' && styles.segmentTextActive]}>
                Iniciar sesión
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, mode === 'register' && styles.segmentBtnActive]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.segmentText, mode === 'register' && styles.segmentTextActive]}>
                Registrarse
              </Text>
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Usuario</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              placeholder="Nombre de usuario"
              placeholderTextColor={theme.icon}
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.icon}
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={onSubmit}
            disabled={loading || username.trim().length < 3 || password.length < 6}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
              </Text>
            )}
          </Pressable>

          {mode === 'register' ? (
            <Text style={[styles.hint, { color: theme.icon }]}>
              Rol por defecto: usuario. Un administrador puede otorgar permisos en la web.
            </Text>
          ) : null}

          <Pressable style={styles.link} onPress={() => router.back()}>
            <Text style={{ color: BRAND }}>Volver</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
