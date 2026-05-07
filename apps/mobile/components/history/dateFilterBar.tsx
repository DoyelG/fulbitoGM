import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  fromDate: string
  toDate: string
  onChangeFrom: (d: string) => void
  onChangeTo: (d: string) => void
  onClear: () => void
}

function isoToDate(iso: string): Date {
  return iso ? new Date(`${iso}T12:00:00`) : new Date()
}

function dateToIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

type PickerField = 'from' | 'to' | null

export function DateFilterBar({ fromDate, toDate, onChangeFrom, onChangeTo, onClear }: Props) {
  const { colors, radii, spacing } = useAppTheme()
  const [activePicker, setActivePicker] = useState<PickerField>(null)

  const hasFilter = !!(fromDate || toDate)

  const handleChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setActivePicker(null)
    if (!selected) return
    const iso = dateToIso(selected)
    if (activePicker === 'from') onChangeFrom(iso)
    if (activePicker === 'to') onChangeTo(iso)
  }

  const closeIOSPicker = (field: PickerField, selected?: Date) => {
    setActivePicker(null)
    if (!selected) return
    const iso = dateToIso(selected)
    if (field === 'from') onChangeFrom(iso)
    if (field === 'to') onChangeTo(iso)
  }

  return (
    <View style={[styles.row, { marginBottom: spacing.sm }]}>
      <FilterChip
        label={fromDate ? `Desde: ${formatDisplay(fromDate)}` : 'Desde'}
        active={!!fromDate}
        onPress={() => setActivePicker('from')}
        colors={colors}
        radii={radii}
      />
      <FilterChip
        label={toDate ? `Hasta: ${formatDisplay(toDate)}` : 'Hasta'}
        active={!!toDate}
        onPress={() => setActivePicker('to')}
        colors={colors}
        radii={radii}
      />
      {hasFilter && (
        <TouchableOpacity
          onPress={onClear}
          style={[styles.clearBtn, { borderColor: colors.border, borderRadius: radii.pill }]}
        >
          <Text style={[styles.clearText, { color: colors.muted }]}>✕ Limpiar</Text>
        </TouchableOpacity>
      )}

      {/* Android: native inline picker */}
      {Platform.OS === 'android' && activePicker ? (
        <DateTimePicker
          value={isoToDate(activePicker === 'from' ? fromDate : toDate)}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      ) : null}

      {/* iOS: modal wrapper */}
      {Platform.OS === 'ios' && activePicker ? (
        <Modal transparent animationType="slide" visible>
          <Pressable style={styles.backdrop} onPress={() => setActivePicker(null)} />
          <View style={[styles.iosSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.iosSheetHeader}>
              <TouchableOpacity onPress={() => closeIOSPicker(activePicker)}>
                <Text style={[styles.iosDone, { color: colors.brand }]}>Listo</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={isoToDate(activePicker === 'from' ? fromDate : toDate)}
              mode="date"
              display="spinner"
              onChange={(_e, d) => {
                if (!d) return
                const iso = dateToIso(d)
                if (activePicker === 'from') onChangeFrom(iso)
                else onChangeTo(iso)
              }}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  )
}

function formatDisplay(iso: string): string {
  const [yy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yy}`
}

function FilterChip({
  label,
  active,
  onPress,
  colors,
  radii,
}: {
  label: string
  active: boolean
  onPress: () => void
  colors: { brand: string; brandSoft: string; border: string; text: string; muted: string }
  radii: { pill: number }
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.brandSoft : 'transparent',
          borderColor: active ? colors.brand : colors.border,
          borderRadius: radii.pill,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? colors.brand : colors.muted }]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearBtn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iosSheet: {
    paddingBottom: 30,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iosSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
  },
  iosDone: {
    fontSize: 16,
    fontWeight: '600',
  },
})
