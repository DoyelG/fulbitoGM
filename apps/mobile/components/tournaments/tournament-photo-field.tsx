import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Image } from 'expo-image'
import { Text, View } from 'react-native'

import { ProfileButton } from '@/components/profile/profile-button'
import { formStyles } from '@/components/profile/profile-form.styles'
import { usePickPhoto } from '@/hooks/use-pick-photo'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './tournament-photo-field.styles'

type Props = {
  currentUrl?: string
  value: string | null | undefined
  onChange: (value: string | null | undefined) => void
  disabled?: boolean
}

export function TournamentPhotoField({ currentUrl, value, onChange, disabled = false }: Props) {
  const { colors } = useAppTheme()
  const pickPhoto = usePickPhoto()
  const previewUrl = value === undefined ? currentUrl : value
  const hasPhoto = Boolean(previewUrl)

  const handlePick = async () => {
    const uri = await pickPhoto()
    if (uri) onChange(uri)
  }

  return (
    <View>
      <Text style={[formStyles.label, { color: colors.muted }]}>Imagen (opcional)</Text>
      <View style={styles.row}>
        <View style={[styles.preview, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
          {previewUrl ? (
            <Image
              source={{ uri: previewUrl }}
              style={styles.image}
              contentFit="cover"
              accessibilityLabel="Vista previa de la imagen del torneo"
            />
          ) : (
            <MaterialCommunityIcons name="trophy-outline" size={30} color={colors.primaryText} accessible={false} />
          )}
        </View>
        <View style={styles.actions}>
          <ProfileButton
            label={hasPhoto ? 'Cambiar imagen' : 'Elegir imagen'}
            variant="secondary"
            onPress={() => void handlePick()}
            disabled={disabled}
          />
          {hasPhoto && (
            <ProfileButton
              label="Quitar"
              variant="dangerousSecondary"
              onPress={() => onChange(currentUrl ? null : undefined)}
              disabled={disabled}
            />
          )}
        </View>
      </View>
    </View>
  )
}
