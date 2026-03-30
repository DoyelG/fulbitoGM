import { initFulbitoApi } from '../lib/apiInit'
initFulbitoApi()

import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from '../tamagui.config'

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Entrar', presentation: 'modal' }} />
          <Stack.Screen name="players/[id]" options={{ title: 'Jugador' }} />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
