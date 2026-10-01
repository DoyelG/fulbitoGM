import { useState } from 'react'
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import type { Address, MatchLocation } from '@fulbito/types'
import { addressToMatchLocation } from '@fulbito/utils'
import { createAddress, updateAddress } from '@fulbito/firebase'
import { useAppTheme } from '@/hooks/use-theme'
import { useAddressesData } from '@/hooks/use-addresses-data'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

import { BottomSheet } from './bottomSheet'
import { FormLabel } from './formLabel'
import { fieldStyles, locationStyles, sheetStyles } from './sharedStyles'

const EMPTY_FORM = { id: '', name: '', street: '' }

type Props = {
  value: MatchLocation | null
  onChange: (value: MatchLocation | null) => void
}

export function LocationField({ value, onChange }: Props) {
  const { isAdmin } = useFirebaseAuth()
  const { colors, radii } = useAppTheme()
  const { addresses: allAddresses, reload, deleteAddress } = useAddressesData()
  const addresses = allAddresses.filter((address) => address.name?.trim())

  const [open, setOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [toDelete, setToDelete] = useState<Address | null>(null)

  const openForm = (address?: Address) => {
    setForm(address ? { id: address.id, name: address.name, street: address.street } : EMPTY_FORM)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    const name = form.name.trim()
    const street = form.street.trim()
    if (!name || !street) {
      closeForm()
      return
    }
    try {
      if (form.id) {
        await updateAddress(form.id, { name, street })
        if (value?.addressId === form.id) onChange({ name, street, addressId: form.id })
      } else {
        const id = await createAddress({ name, street })
        onChange({ name, street, addressId: id })
      }
      closeForm()
      await reload()
    } catch {
      Alert.alert('No se pudo guardar la cancha', 'Revisá tu conexión e intentá de nuevo.')
    }
  }

  const openDeleteConfirm = (address: Address) => {
    setOpen(false)
    setToDelete(address)
  }

  const closeDeleteConfirm = () => {
    setToDelete(null)
    setOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    const address = toDelete
    closeDeleteConfirm()
    try {
      await deleteAddress(address.id)
      if (value?.addressId === address.id) onChange(null)
    } catch {
      Alert.alert('No se pudo eliminar la cancha', 'Revisá tu conexión e intentá de nuevo.')
    }
  }

  return (
    <>
      <FormLabel text="Ubicación" />
      <View style={locationStyles.pickerRow}>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={[
            fieldStyles.inputBtn,
            locationStyles.pickerBtn,
            { borderColor: colors.border, borderRadius: radii.sm },
          ]}
        >
          <Text style={[fieldStyles.inputBtnText, { color: colors.text }]}>
            {value?.name ? value.name : 'Seleccionar cancha'}
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            onPress={() => openForm()}
            style={[locationStyles.addBtn, { borderRadius: radii.sm, backgroundColor: colors.brand }]}
            accessibilityRole="button"
            accessibilityLabel="Agregar cancha nueva"
          >
            <Text style={locationStyles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomSheet visible={open} title="Seleccionar cancha" onConfirm={() => setOpen(false)}>
        <ScrollView style={locationStyles.pickerScroll}>
          {addresses.map((address) => (
            <View
              key={address.id}
              style={[
                sheetStyles.option,
                locationStyles.optionRow,
                { borderBottomColor: colors.border },
                value?.addressId === address.id && { backgroundColor: colors.brandSoft },
              ]}
            >
              <TouchableOpacity
                style={locationStyles.optionTouch}
                onPress={() => {
                  onChange(addressToMatchLocation(address))
                  setOpen(false)
                }}
                accessibilityRole="button"
                accessibilityLabel={`Elegir ${address.name}`}
              >
                <Text style={[sheetStyles.optionText, { color: colors.text }]}>{address.name}</Text>
              </TouchableOpacity>

              {isAdmin && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setOpen(false)
                      openForm(address)
                    }}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${address.name}`}
                  >
                    <MaterialIcons name="edit" size={18} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openDeleteConfirm(address)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar ${address.name}`}
                  >
                    <MaterialIcons name="delete" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
          {addresses.length === 0 && (
            <Text style={[locationStyles.emptyText, { color: colors.muted }]}>No se encontraron canchas</Text>
          )}
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={isFormOpen}
        title={form.id ? 'Editar cancha' : 'Agregar cancha nueva'}
        closeLabel="Guardar"
        onDismiss={closeForm}
        onConfirm={handleSave}
      >
        <View style={locationStyles.formBody}>
          <FormLabel text="Nombre" />
          <TextInput
            placeholder="Nombre de la cancha"
            placeholderTextColor={colors.muted}
            onChangeText={(name) => setForm((f) => ({ ...f, name }))}
            value={form.name}
            style={[fieldStyles.textInput, { borderColor: colors.border, borderRadius: radii.sm, color: colors.text }]}
          />
          <FormLabel text="Dirección" />
          <TextInput
            placeholder="Dirección de la cancha"
            placeholderTextColor={colors.muted}
            onChangeText={(street) => setForm((f) => ({ ...f, street }))}
            value={form.street}
            style={[fieldStyles.textInput, { borderColor: colors.border, borderRadius: radii.sm, color: colors.text }]}
          />
        </View>
      </BottomSheet>

      <BottomSheet
        visible={toDelete !== null}
        title="Confirmar eliminación"
        closeLabel="Cancelar"
        onDismiss={closeDeleteConfirm}
        onConfirm={closeDeleteConfirm}
      >
        <View style={locationStyles.deleteBody}>
          <Text style={[locationStyles.deleteText, { color: colors.text }]}>
            ¿Estás seguro de que querés eliminar &quot;{toDelete?.name}&quot;? Los partidos ya guardados no se
            modifican.
          </Text>
          <TouchableOpacity
            onPress={handleConfirmDelete}
            style={locationStyles.deleteBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Eliminar"
          >
            <Text style={[locationStyles.deleteBtnText, { color: colors.danger }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  )
}
