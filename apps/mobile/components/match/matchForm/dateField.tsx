import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { FormLabel } from './formLabel'
import { formatDate } from './helpers'
import { fieldStyles, sheetStyles } from './sharedStyles'

type Props = {
  value: string
  onChange: (iso: string) => void
}

export function DateField({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()
  const [open, setOpen] = useState(false)

  return (
    <>
      <FormLabel text="Fecha" />
      <TouchableOpacity
        style={[fieldStyles.inputBtn, { borderColor: colors.border, borderRadius: radii.sm }]}
        onPress={() => setOpen(true)}
      >
        <Text style={[fieldStyles.inputBtnText, { color: colors.text }]}>{formatDate(value)}</Text>
      </TouchableOpacity>
      {open && <DatePickerModal value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </>
  )
}

function DatePickerModal({
  value,
  onChange,
  onClose,
}: {
  value: string
  onChange: (iso: string) => void
  onClose: () => void
}) {
  const { colors } = useAppTheme()
  const date = value ? new Date(`${value}T12:00:00`) : new Date()

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={(_, d) => {
          onClose()
          if (d) onChange(d.toISOString().slice(0, 10))
        }}
      />
    )
  }

  return (
    <Modal transparent animationType="slide" visible>
      <Pressable style={sheetStyles.backdrop} onPress={onClose} />
      <View style={[sheetStyles.container, { backgroundColor: colors.surface }]}>
        <View style={sheetStyles.header}>
          <Text style={[sheetStyles.title, { color: colors.text }]}>Seleccionar fecha</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[sheetStyles.close, { color: colors.brand }]}>Listo</Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={(_, d) => {
            if (d) onChange(d.toISOString().slice(0, 10))
          }}
        />
      </View>
    </Modal>
  )
}
