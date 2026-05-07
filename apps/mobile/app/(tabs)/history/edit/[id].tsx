import { useLocalSearchParams } from 'expo-router'

import { EditMatch } from '@/components/match/editMatch'

export default function EditMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <EditMatch matchId={id} />
}
