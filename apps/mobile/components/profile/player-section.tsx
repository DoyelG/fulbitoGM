import { getPlayers, updatePlayer, uploadPlayerPhoto } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'

import { PositionField } from '@/components/players/new/position-field'
import { usePickPhoto } from '@/hooks/use-pick-photo'
import { useAppTheme } from '@/hooks/use-theme'

import { ProfileButton } from './profile-button'
import { formStyles } from './profile-form.styles'
import { ProfileSection } from './profile-section'
import { styles } from './player-section.styles'

const PLACEHOLDER = require('@/assets/images/user-placeholder.png')

type Props = {
  player: Player
  index: number
  onSaved: () => void
}

export function PlayerSection({ player, index, onSaved }: Props) {
  const { colors } = useAppTheme()
  const pickPhoto = usePickPhoto()
  const [name, setName] = useState(player.name)
  const [position, setPosition] = useState(player.position)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const trimmedName = name.trim()
  const hasChanges = trimmedName !== player.name || position !== player.position || photoUri !== null
  const displayedPhoto = photoUri ?? player.photoUrl

  const handlePickPhoto = async () => {
    const uri = await pickPhoto()
    if (uri) setPhotoUri(uri)
  }

  const handleSave = async () => {
    setIsSaved(false)
    setIsSaving(true)
    setErrorMessage(null)
    try {
      const players = await getPlayers()
      const isNameTaken = players.some(
        (otherPlayer) =>
          otherPlayer.id !== player.id && otherPlayer.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      )
      if (isNameTaken) {
        setErrorMessage('Ya existe un jugador con ese nombre')
        return
      }

      let photoUrl: string | undefined
      if (photoUri) {
        const blob = await (await fetch(photoUri)).blob()
        photoUrl = await uploadPlayerPhoto(blob, player.id)
      }
      await updatePlayer(player.id, { name: trimmedName, position, ...(photoUrl ? { photoUrl } : {}) })
      setPhotoUri(null)
      setIsSaved(true)
      onSaved()
    } catch {
      setErrorMessage('No se pudieron guardar los cambios. Probá de nuevo más tarde.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileSection icon="user-check" title="Mi jugador" index={index}>
      <View style={formStyles.form}>
        <View style={styles.photoRow}>
          <Image
            source={displayedPhoto ? { uri: displayedPhoto } : PLACEHOLDER}
            contentFit="cover"
            style={styles.photo}
            accessibilityLabel="Foto del jugador"
          />
          <ProfileButton label="Cambiar foto" variant="secondary" onPress={() => void handlePickPhoto()} />
        </View>
        <View>
          <Text style={[formStyles.label, { color: colors.muted }]}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="Nombre"
            style={[
              formStyles.input,
              { backgroundColor: colors.chipBg, borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>
        <View>
          <Text style={[formStyles.label, { color: colors.muted }]}>Posición</Text>
          <PositionField value={position} onChange={setPosition} />
        </View>
        {errorMessage && (
          <Text style={[formStyles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {errorMessage}
          </Text>
        )}
        {isSaved && (
          <Text style={[formStyles.success, { color: colors.friendlyBrand }]} accessibilityLiveRegion="polite">
            Cambios guardados
          </Text>
        )}
        <View style={formStyles.actions}>
          <ProfileButton
            label="Guardar cambios"
            onPress={() => void handleSave()}
            disabled={!hasChanges || !trimmedName || isSaving}
          />
        </View>
      </View>
    </ProfileSection>
  )
}
