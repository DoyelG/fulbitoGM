import { Text, type TextStyle } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { fieldStyles } from './sharedStyles'

export function FormLabel({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useAppTheme()
  return <Text style={[fieldStyles.label, { color: colors.text }, style]}>{text}</Text>
}
