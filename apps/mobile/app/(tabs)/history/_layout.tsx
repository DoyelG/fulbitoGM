import { Stack, Tabs } from 'expo-router'

export default function HistoryLayout() {
  return (
    <>
      <Tabs.Screen
        options={{
          title: 'Historial',
        }}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Historial' }} />
        <Stack.Screen name="new" options={{ title: 'Nuevo partido' }} />
        <Stack.Screen name="edit/[id]" options={{ title: 'Editar partido' }} />
      </Stack>
    </>
  )
}
