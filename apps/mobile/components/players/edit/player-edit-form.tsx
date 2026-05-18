import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import { Fonts, Radii, Spacing } from '@/constants/theme'

export type PlayerEditFormValues = {
  name: string
  position: string
  physical: number
  technical: number
  tactical: number
  psychological: number
}

type Props = {
  values: PlayerEditFormValues
  onChange: (values: PlayerEditFormValues) => void
  saving: boolean
  onSave: () => void
  onCancel: () => void
}

const POSITIONS = [
  { value: 'GK', label: 'Arquero' },
  { value: 'DEF', label: 'Defensor' },
  { value: 'MID', label: 'Mediocampista' },
  { value: 'FWD', label: 'Delantero' },
  { value: 'PLAYER', label: 'Cualquier posición' },
]

const SKILL_KEYS: { key: keyof PlayerEditFormValues; label: string }[] = [
  { key: 'physical', label: 'Físico' },
  { key: 'technical', label: 'Técnico' },
  { key: 'tactical', label: 'Táctico' },
  { key: 'psychological', label: 'Mental' },
]

function SkillStepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const { colors, radii } = useAppTheme()
  return (
    <View style={styles.stepperRow}>
      <ThemedText style={[styles.stepperLabel, { color: colors.muted }]}>{label}</ThemedText>
      <View style={[styles.stepper, { borderColor: colors.border, borderRadius: radii.sm }]}>
        <TouchableOpacity
          onPress={() => onChange(Math.max(1, value - 1))}
          style={[styles.stepBtn, { borderRightColor: colors.border }]}
          hitSlop={8}>
          <ThemedText style={[styles.stepBtnText, { color: colors.brand }]}>−</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.stepValue, { color: colors.text }]}>{value}</ThemedText>
        <TouchableOpacity
          onPress={() => onChange(Math.min(10, value + 1))}
          style={[styles.stepBtn, { borderLeftColor: colors.border }]}
          hitSlop={8}>
          <ThemedText style={[styles.stepBtnText, { color: colors.brand }]}>+</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export function PlayerEditForm({ values, onChange, saving, onSave, onCancel }: Props) {
  const { colors, radii } = useAppTheme()

  const overall =
    (values.physical + values.technical + values.tactical + values.psychological) / 4

  const canSave = values.name.trim().length >= 2 && !saving

  const set = (key: keyof PlayerEditFormValues, val: string | number) =>
    onChange({ ...values, [key]: val })

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* ── Nombre ──────────────────────────────────────── */}
        <ThemedText style={[styles.label, { color: colors.muted }]}>Nombre</ThemedText>
        <TextInput
          value={values.name}
          onChangeText={(v) => set('name', v)}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="Nombre del jugador"
          placeholderTextColor={colors.muted}
          style={[
            styles.textInput,
            {
              borderColor: colors.border,
              borderRadius: radii.sm,
              color: colors.text,
              backgroundColor: colors.surface,
            },
          ]}
        />

        {/* ── Posición ─────────────────────────────────────── */}
        <ThemedText style={[styles.label, { color: colors.muted }]}>Posición</ThemedText>
        <View style={styles.chips}>
          {POSITIONS.map((p) => {
            const active = values.position === p.value
            return (
              <TouchableOpacity
                key={p.value}
                onPress={() => set('position', p.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.brand : 'transparent',
                    borderColor: active ? colors.brand : colors.border,
                    borderRadius: radii.sm,
                  },
                ]}>
                <ThemedText
                  style={[styles.chipText, { color: active ? '#fff' : colors.muted }]}>
                  {p.label}
                </ThemedText>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── Habilidades ──────────────────────────────────── */}
        <ThemedText style={[styles.label, { color: colors.muted }]}>Habilidades</ThemedText>
        <View
          style={[
            styles.skillsCard,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md },
          ]}>
          {SKILL_KEYS.map(({ key, label }) => (
            <SkillStepper
              key={key}
              label={label}
              value={values[key] as number}
              onChange={(v) => set(key, v)}
            />
          ))}
        </View>

        {/* ── Promedio ─────────────────────────────────────── */}
        <View style={[styles.avgRow, { borderColor: colors.border, borderRadius: radii.sm }]}>
          <ThemedText style={[styles.avgLabel, { color: colors.muted }]}>General (promedio)</ThemedText>
          <ThemedText style={[styles.avgValue, { color: colors.brand }]}>
            Lv {overall.toFixed(2)}
          </ThemedText>
        </View>

        {/* ── Acciones ─────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: radii.sm }]}>
            <ThemedText style={[styles.cancelText, { color: colors.text }]}>Cancelar</ThemedText>
          </TouchableOpacity>
          <Pressable
            onPress={onSave}
            disabled={!canSave}
            style={[
              styles.saveBtn,
              {
                backgroundColor: canSave ? colors.brand : colors.muted,
                borderRadius: radii.sm,
              },
            ]}>
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.saveText}>Actualizar jugador</ThemedText>
            )}
          </Pressable>
        </View>

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

  label: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.lg,
  },

  textInput: {
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },

  skillsCard: {
    borderWidth: 1,
    paddingVertical: Spacing.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stepperLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 0,
  },
  stepBtnText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    lineHeight: 22,
  },
  stepValue: {
    width: 36,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  avgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.lg,
  },
  avgLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  avgValue: {
    fontSize: 15,
    fontFamily: Fonts.extraBold,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },

  bottomPad: { height: 32 },
})
