import { useAppTheme } from '@/hooks/use-theme'
import { FormLabel } from './formLabel'
import { fieldStyles } from './sharedStyles'
import { TextInput } from 'react-native'


type Props = {
  value: string
  onChange: (v: string) => void
}

export function DescriptionField ({value, onChange}: Props) {
const { colors, radii } = useAppTheme()

  
 return (
    <>
      <FormLabel text="Descripcion" />
       <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Ej: "
              placeholderTextColor={colors.muted}
              style={[
                fieldStyles.textInput,
                { borderColor: colors.border, borderRadius: radii.sm, color: colors.text },
              ]}
            />
    </>
  )
}