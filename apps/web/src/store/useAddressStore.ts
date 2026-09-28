import { create } from 'zustand'
import type { Address } from '@fulbito/types'
import { getAddresses, createAddress, updateAddress, deleteAddress } from '@fulbito/firebase'

export type { Address }

export type AddressInput = { name: string; street: string }

type AddressStore = {
  addresses: Address[]
  addressesInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addAddress: (data: AddressInput) => Promise<Address>
  editAddress: (id: string, data: AddressInput) => Promise<Address>
  removeAddress: (id: string) => Promise<void>
  resetAndReload: () => Promise<void>
}

export const useAddressStore = create<AddressStore>()((set, get) => {
  const findOrThrow = (id: string) => {
    const found = get().addresses.find((a) => a.id === id)
    if (!found) throw new Error('No se encontró la cancha')
    return found
  }

  return {
    addresses: [],
    addressesInit: 'idle',
    initLoad: async () => {
      const state = get().addressesInit
      if (state === 'loading' || state === 'loaded') return
      set({ addressesInit: 'loading' })
      try {
        const data = await getAddresses()
        set({ addresses: data, addressesInit: 'loaded' })
      } catch {
        set({ addressesInit: 'error' })
      }
    },
    addAddress: async (data) => {
      const id = await createAddress(data)
      await get().resetAndReload()
      return findOrThrow(id)
    },
    editAddress: async (id, data) => {
      await updateAddress(id, data)
      await get().resetAndReload()
      return findOrThrow(id)
    },
    removeAddress: async (id) => {
      await deleteAddress(id)
      await get().resetAndReload()
    },
    resetAndReload: async () => {
      const data = await getAddresses()
      set({ addresses: data, addressesInit: 'loaded' })
    },
  }
})
