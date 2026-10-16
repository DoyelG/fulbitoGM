import { TextInput } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { FormLabel } from './formLabel'
import { fieldStyles } from './sharedStyles'

type Props = {
  value: string,
  onChange: (v: string) => void,
}

export function DescriptionField({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()

  return (
    <>
      <FormLabel text="Crónica" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Escribí la crónica del partido"
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        accessibilityLabel="Crónica del partido"
        style={[fieldStyles.textInput, { borderColor: colors.border, borderRadius: radii.sm, color: colors.text }]}
      />
    </>
  )
}
