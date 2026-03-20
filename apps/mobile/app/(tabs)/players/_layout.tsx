import { Stack } from 'expo-router';

export default function PlayersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Jugadores' }} />
      <Stack.Screen name="new" options={{ title: 'Nuevo jugador' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle jugador' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Editar jugador' }} />
    </Stack>
  );
}
