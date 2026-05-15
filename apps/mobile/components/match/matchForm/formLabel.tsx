import { Text } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { fieldStyles } from './sharedStyles'

export function FormLabel({ text }: { text: string }) {
  const { colors } = useAppTheme()
  return <Text style={[fieldStyles.label, { color: colors.text }]}>{text}</Text>
}
