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
import { Image } from 'expo-image'
import { authErrorMessage } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PrimaryGradient } from '@/components/primary-gradient'
import { Colors, ContrastColors, Shadows } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { styles } from '@/styles/login.styles'

const LOGO = require('@/assets/images/logo-ball.png')

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]
  const router = useRouter()
  const { signIn, register } = useFirebaseAuth()

  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(email, password)
      } else {
        await signIn(email, password)
      }
      router.replace('/(tabs)/players')
    } catch (e) {
      setError(authErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.safe}>
      <PrimaryGradient />
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
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
            <View style={styles.brand} accessible accessibilityRole="header" accessibilityLabel="FulbitoApp">
              <Image source={LOGO} style={styles.brandLogo} contentFit="contain" accessible={false} />
              <Text style={styles.brandText}>FulbitoApp</Text>
            </View>

            <View
              style={[styles.card, { backgroundColor: theme.surface }, Shadows.card(colorScheme === 'dark') as object]}
            >
              <View style={styles.segment}>
                <Pressable
                  style={[styles.segmentBtn, mode === 'signin' && styles.segmentBtnActive]}
                  onPress={() => setMode('signin')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === 'signin' }}
                >
                  <Text style={[styles.segmentText, mode === 'signin' && styles.segmentTextActive]}>
                    Iniciar sesión
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.segmentBtn, mode === 'register' && styles.segmentBtnActive]}
                  onPress={() => setMode('register')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === 'register' }}
                >
                  <Text style={[styles.segmentText, mode === 'register' && styles.segmentTextActive]}>Registrarse</Text>
                </Pressable>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="tu@email.com"
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
                  autoComplete="current-password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={theme.icon}
                  style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={onSubmit}
                accessibilityRole="button"
                accessibilityState={{ busy: loading }}
                disabled={loading || email.trim().length < 3 || password.length < 6}
              >
                {loading ? (
                  <ActivityIndicator color={ContrastColors.onColor} />
                ) : (
                  <Text style={styles.primaryBtnText}>{mode === 'signin' ? 'Entrar' : 'Crear cuenta'}</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
