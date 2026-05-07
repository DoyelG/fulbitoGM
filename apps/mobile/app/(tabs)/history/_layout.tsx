import { Stack, Tabs } from 'expo-router'

import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export default function HistoryLayout() {
  const colorScheme = useColorScheme()

  return (
    <>
      <Tabs.Screen
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarButton: HapticTab,
        }}
      />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Historial' }} />
        <Stack.Screen name="new" options={{ title: 'Nuevo partido' }} />
        <Stack.Screen name="edit/[id]" options={{ title: 'Editar partido' }} />
      </Stack>
    </>
  )
}
