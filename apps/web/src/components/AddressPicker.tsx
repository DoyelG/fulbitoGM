'use client'

import { useEffect, useState } from 'react'
import type { Address, MatchLocation } from '@fulbito/types'
import { addressToMatchLocation } from '@fulbito/utils'
import { useAddressStore, type AddressInput } from '@/store/useAddressStore'
import Modal from './Modal'
import AddressForm from './addresses/AddressForm'
import AddressManagerModal from './addresses/AddressManagerModal'
import AddressActionsMenu from './addresses/AddressActionsMenu'

type AddressPickerProps = {
  value: MatchLocation | null
  onChange: (value: MatchLocation | null) => void
}

export default function AddressPicker({ value, onChange }: AddressPickerProps) {
  const { addresses: allAddresses, initLoad, addAddress } = useAddressStore()
  const addresses = allAddresses.filter((address) => address.name?.trim())
  const [modal, setModal] = useState<'none' | 'create' | 'manage'>('none')
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    initLoad()
  }, [initLoad])

  const selectedAddress = addresses.find((address) => address.id === value?.addressId)

  const handleCreate = async (data: AddressInput) => {
    setCreateError(null)
    try {
      const address = await addAddress(data)
      onChange(addressToMatchLocation(address))
      setModal('none')
    } catch {
      setCreateError('No se pudo guardar la cancha.')
    }
  }

  const handleAddressUpdated = (address: Address) => {
    if (address.id === value?.addressId) onChange(addressToMatchLocation(address))
  }

  const handleAddressDeleted = (id: string) => {
    if (id === value?.addressId) onChange(null)
  }

  return (
    <div className="relative w-full">
      <div className="flex h-10 w-full items-center rounded border">
        <select
          className="select-chevron h-full min-w-0 flex-1 appearance-none border-none bg-transparent pl-3 pr-8 focus:outline-none"
          aria-label="Cancha"
          value={selectedAddress?.id ?? ''}
          onChange={(e) => {
            const found = addresses.find((address) => address.id === e.target.value)
            onChange(found ? addressToMatchLocation(found) : null)
          }}
        >
          <option value="">Seleccionar cancha...</option>
          {addresses.map((address) => (
            <option key={address.id} value={address.id}>
              {address.name}
            </option>
          ))}
        </select>
        <div className="h-7 w-px shrink-0 bg-gray-400" aria-hidden="true" />
        <AddressActionsMenu
          onAdd={() => {
            setCreateError(null)
            setModal('create')
          }}
          onManage={() => setModal('manage')}
        />
      </div>

      <Modal open={modal === 'create'} onClose={() => setModal('none')} title="Agregar Cancha">
        {createError && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {createError}
          </p>
        )}
        <AddressForm submitLabel="Guardar cancha" onCancel={() => setModal('none')} onSubmit={handleCreate} />
      </Modal>

      <AddressManagerModal
        open={modal === 'manage'}
        onClose={() => setModal('none')}
        onAddressUpdated={handleAddressUpdated}
        onAddressDeleted={handleAddressDeleted}
      />
    </div>
  )
}
