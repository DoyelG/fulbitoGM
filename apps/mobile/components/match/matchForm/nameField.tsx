import { TextInput } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { FormLabel } from './formLabel'
import { fieldStyles } from './sharedStyles'

type Props = {
  value: string
  onChange: (v: string) => void
}

export function NameField({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()

  return (
    <>
      <FormLabel text="Nombre del partido (opcional)" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Ej: Copa verano"
        placeholderTextColor={colors.muted}
        style={[
          fieldStyles.textInput,
          { borderColor: colors.border, borderRadius: radii.sm, color: colors.text },
        ]}
      />
    </>
  )
}
