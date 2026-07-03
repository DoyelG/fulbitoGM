import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'

import { BasicInfoCard } from '@/components/players/new/basic-info-card'
import { FormActions } from '@/components/players/new/form-actions'
import { PlayerCreateCard } from '@/components/players/new/player-create-card'
import { SKILLS, SkillsSection, type SkillKey, type SkillValues } from '@/components/players/new/skills-section'
import { Spacing } from '@/constants/theme'

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

export function PlayerCreateForm({
  values,
  onChange,
  photoUri,
  onPickPhoto,
  saving,
  onSave,
  onCancel,
}: Props) {
  const overall = Math.round(
    (values.physical + values.technical + values.tactical + values.psychological) / 4,
  )

  const canSave = values.name.trim().length >= 2 && !saving

  const set = (key: keyof PlayerCreateFormValues, val: string | number) =>
    onChange({ ...values, [key]: val })

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.cardWrap}>
          <PlayerCreateCard
            name={values.name}
            position={values.position}
            overall={overall}
            photoUri={photoUri}
            onPickPhoto={onPickPhoto}
            stats={SKILLS.map((s) => ({ key: s.key, label: s.cardLabel, value: values[s.key] }))}
          />
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  cardWrap: {
    marginBottom: Spacing.xl,
  },
  bottomPad: { height: 32 },
})
