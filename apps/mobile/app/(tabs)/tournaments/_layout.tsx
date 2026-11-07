import { Stack } from 'expo-router'

export default function TournamentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Mis torneos' }} />
      <Stack.Screen name="[id]/members" options={{ title: 'Miembros' }} />
    </Stack>
  )
}
