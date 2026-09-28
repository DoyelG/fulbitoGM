import type { Address } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import { getAddresses, deleteAddress } from '@fulbito/firebase'

export type AddressesDataState = {
  addresses: Address[]
  reload: () => Promise<void>
  deleteAddress: (id: string) => Promise<void>
}

export function useAddressesData(): AddressesDataState {
  const [addresses, setAddresses] = useState<Address[]>([])

  const reload = useCallback(async () => {
    try {
      const data = await getAddresses()
      setAddresses(data)
    } catch {}
  }, [])

  const handleDeleteAddress = useCallback(
    async (id: string) => {
      await deleteAddress(id)
      await reload()
    },
    [reload],
  )

  useEffect(() => {
    void reload()
  }, [reload])

  return { addresses, reload, deleteAddress: handleDeleteAddress }
}
