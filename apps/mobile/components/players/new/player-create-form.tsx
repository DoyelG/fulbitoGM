import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'

import { PlayerGoldCard } from '@/components/players/detail/player-gold-card'
import { BasicInfoCard } from '@/components/players/new/basic-info-card'
import { FormActions } from '@/components/players/new/form-actions'
import { SkillsSection, type SkillKey, type SkillValues } from '@/components/players/new/skills-section'
import { ThemedText } from '@/components/themed-text'
import { useTournaments } from '@/contexts/TournamentContext'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './player-create-form.styles'

export type PlayerCreateFormValues = SkillValues & {
  name: string
  position: string
}

type Props = {
  values: PlayerCreateFormValues
  onChange: (values: PlayerCreateFormValues) => void
  photoUri: string | null
  onPickPhoto: () => void
  saving: boolean
  onSave: () => void
  onCancel: () => void
}

export function PlayerCreateForm({ values, onChange, photoUri, onPickPhoto, saving, onSave, onCancel }: Props) {
  const { colors } = useAppTheme()
  const { activeTournament } = useTournaments()
  const overall = (values.physical + values.technical + values.tactical + values.psychological) / 4
  const displayName = values.name.trim() || 'Nuevo jugador'

  const canSave = values.name.trim().length >= 2 && !saving

  const set = (key: keyof PlayerCreateFormValues, val: string | number) =>
    onChange({ ...values, [key]: val })

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.cardWrap}>
          <Pressable
            onPress={onPickPhoto}
            accessibilityRole="button"
            accessibilityLabel={photoUri ? 'Cambiar foto del jugador' : 'Subir foto del jugador'}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <PlayerGoldCard
              name={displayName}
              position={values.position}
              overall={overall}
              skills={{
                physical: values.physical,
                technical: values.technical,
                tactical: values.tactical,
                psychological: values.psychological,
              }}
              goalkeeping={values.goalkeeping}
              photoUrl={photoUri}
              tournamentPhotoUrl={activeTournament?.tournament.photoUrl}
            />
          </Pressable>
          <ThemedText style={[styles.photoHint, { color: colors.textSecondary }]}>
            {photoUri ? 'Tocá la card para cambiar la foto' : 'Tocá la card para subir una foto'}
          </ThemedText>
        </View>

        <BasicInfoCard
          name={values.name}
          onChangeName={(v) => set('name', v)}
          position={values.position}
          onChangePosition={(v) => set('position', v)}
        />

        <SkillsSection values={values} onChange={(key: SkillKey, v) => set(key, v)} />

        <FormActions canSave={canSave} saving={saving} onSave={onSave} onCancel={onCancel} />

        <View style={styles.bottomPad} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
