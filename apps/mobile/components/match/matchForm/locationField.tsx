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
import { fieldStyles, sheetStyles } from './sharedStyles'

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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formStreet, setFormStreet] = useState('')
  const [toDelete, setToDelete] = useState<Address | null>(null)

  const openCreate = () => {
    setEditingId(null)
    setFormName('')
    setFormStreet('')
    setIsFormOpen(true)
  }

  const openEdit = (address: Address) => {
    setOpen(false)
    setEditingId(address.id)
    setFormName(address.name)
    setFormStreet(address.street)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setFormName('')
    setFormStreet('')
  }

  const handleSave = async () => {
    const name = formName.trim()
    const street = formStreet.trim()
    if (!name || !street) {
      closeForm()
      return
    }
    try {
      if (editingId) {
        await updateAddress(editingId, { name, street })
        if (value?.addressId === editingId) onChange({ name, street, addressId: editingId })
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
    setToDelete(null)
    try {
      await deleteAddress(address.id)
      if (value?.addressId === address.id) onChange(null)
    } catch {
      Alert.alert('No se pudo eliminar la cancha', 'Revisá tu conexión e intentá de nuevo.')
    } finally {
      setOpen(true)
    }
  }

  return (
    <>
      <FormLabel text="Ubicación" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={[fieldStyles.inputBtn, { borderColor: colors.border, borderRadius: radii.sm, flex: 1 }]}
        >
          <Text style={[fieldStyles.inputBtnText, { color: colors.text }]}>
            {value?.name ? value.name : 'Seleccionar cancha'}
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            onPress={openCreate}
            style={{
              width: 28,
              height: 39,
              borderRadius: radii.sm,
              backgroundColor: colors.brand,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="Agregar cancha nueva"
          >
            <Text style={{ fontSize: 20, color: '#fff', lineHeight: 22 }}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomSheet visible={open} title="Seleccionar cancha" onConfirm={() => setOpen(false)}>
        <ScrollView style={{ maxHeight: 300 }}>
          {addresses.map((address) => (
            <View
              key={address.id}
              style={[
                sheetStyles.option,
                { borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 16 },
                value?.addressId === address.id && { backgroundColor: colors.brandSoft },
              ]}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
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
                    onPress={() => openEdit(address)}
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
            <Text style={{ color: colors.muted, textAlign: 'center', padding: 24 }}>No se encontraron canchas</Text>
          )}
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={isFormOpen}
        title={editingId ? 'Editar cancha' : 'Agregar cancha nueva'}
        closeLabel="Guardar"
        onDismiss={closeForm}
        onConfirm={handleSave}
      >
        <View style={{ gap: 4, paddingHorizontal: 14 }}>
          <FormLabel text="Nombre" />
          <TextInput
            placeholder="Nombre de la cancha"
            placeholderTextColor={colors.muted}
            onChangeText={setFormName}
            value={formName}
            style={[fieldStyles.textInput, { borderColor: colors.border, borderRadius: radii.sm, color: colors.text }]}
          />
          <FormLabel text="Dirección" />
          <TextInput
            placeholder="Dirección de la cancha"
            placeholderTextColor={colors.muted}
            onChangeText={setFormStreet}
            value={formStreet}
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
        <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4, gap: 22 }}>
          <Text style={{ color: colors.text, fontSize: 16, lineHeight: 22 }}>
            ¿Estás seguro de que querés eliminar &quot;{toDelete?.name}&quot;? Los partidos ya guardados no se
            modifican.
          </Text>
          <TouchableOpacity
            onPress={handleConfirmDelete}
            style={{ alignSelf: 'flex-end' }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Eliminar"
          >
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 17 }}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </>
  )
}
