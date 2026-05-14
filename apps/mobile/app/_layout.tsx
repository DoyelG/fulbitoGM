import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { useFonts } from 'expo-font'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { FirebaseAuthProvider, useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

export const unstable_settings = {
  anchor: '(tabs)',
}

function AuthGuard() {
  const { user, loading } = useFirebaseAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] === 'login'
    if (!user && !inAuthGroup) {
      router.replace('/login')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/players')
    }
  }, [user, loading, segments, router])

  return null
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular: require('../assets/fonts/Montserrat_400Regular.ttf'),
    Montserrat_400Regular_Italic: require('../assets/fonts/Montserrat_400Regular_Italic.ttf'),
    Montserrat_500Medium: require('../assets/fonts/Montserrat_500Medium.ttf'),
    Montserrat_600SemiBold: require('../assets/fonts/Montserrat_600SemiBold.ttf'),
    Montserrat_700Bold: require('../assets/fonts/Montserrat_700Bold.ttf'),
    Montserrat_800ExtraBold: require('../assets/fonts/Montserrat_800ExtraBold.ttf'),
    Montserrat_800ExtraBold_Italic: require('../assets/fonts/Montserrat_800ExtraBold_Italic.ttf'),
    Montserrat_900Black: require('../assets/fonts/Montserrat_900Black.ttf'),
    Montserrat_900Black_Italic: require('../assets/fonts/Montserrat_900Black_Italic.ttf'),
  })

  if (!fontsLoaded) return null

  return (
    <FirebaseAuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGuard />
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Rutas', headerShown: true }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </FirebaseAuthProvider>
  )
}
