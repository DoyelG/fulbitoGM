'use client'

import { useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { PlusIcon } from '@heroicons/react/24/outline'
import type { Address } from '@fulbito/types'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import ActionRow from '@/components/ActionRow'
import { useAddressStore, type AddressInput } from '@/store/useAddressStore'
import AddressForm from './AddressForm'

type Props = {
  open: boolean
  onClose: () => void
  onAddressUpdated: (address: Address) => void
  onAddressDeleted: (id: string) => void
}

type View = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; address: Address }

const TITLES: Record<View['kind'], string> = {
  list: 'Administrar canchas',
  create: 'Agregar cancha',
  edit: 'Editar cancha',
}

export default function AddressManagerModal({ open, onClose, onAddressUpdated, onAddressDeleted }: Props) {
  const { addresses, addAddress, editAddress, removeAddress } = useAddressStore()
  const [view, setView] = useState<View>({ kind: 'list' })
  const [error, setError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Address | null>(null)

  const goTo = (next: View) => {
    setError(null)
    setView(next)
  }
  const backToList = () => goTo({ kind: 'list' })

  const handleClose = () => {
    backToList()
    setError(null)
    onClose()
  }

  const handleCreate = async (data: AddressInput) => {
    setError(null)
    try {
      await addAddress(data)
      backToList()
    } catch {
      setError('No se pudo guardar la cancha.')
    }
  }

  const handleEdit = async (id: string, data: AddressInput) => {
    setError(null)
    try {
      onAddressUpdated(await editAddress(id, data))
      backToList()
    } catch {
      setError('No se pudieron guardar los cambios.')
    }
  }

  const handleConfirmDelete = async () => {
    if (!toDelete) return
    setError(null)
    try {
      await removeAddress(toDelete.id)
      onAddressDeleted(toDelete.id)
    } catch {
      setError('No se pudo eliminar la cancha.')
    } finally {
      setToDelete(null)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={TITLES[view.kind]}>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {view.kind === 'create' && (
        <AddressForm submitLabel="Guardar cancha" onCancel={backToList} onSubmit={handleCreate} />
      )}

      {view.kind === 'edit' && (
        <AddressForm
          initial={{ name: view.address.name, street: view.address.street }}
          submitLabel="Guardar cambios"
          onCancel={backToList}
          onSubmit={(data) => handleEdit(view.address.id, data)}
        />
      )}

      {view.kind === 'list' && (
        <div>
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dirección</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {addresses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-600">
                      Todavía no hay canchas cargadas.
                    </td>
                  </tr>
                ) : (
                  addresses.map((address) => (
                    <ActionRow
                      key={address.id}
                      actions={[
                        {
                          icon: <FiEdit2 size={16} aria-label={`Editar ${address.name}`} />,
                          variant: 'primary',
                          onClick: () => goTo({ kind: 'edit', address }),
                          tooltip: 'Editar',
                        },
                        {
                          icon: <FiTrash2 size={16} aria-label={`Eliminar ${address.name}`} />,
                          variant: 'danger',
                          onClick: () => setToDelete(address),
                          tooltip: 'Eliminar',
                        },
                      ]}
                    >
                      <td className="px-4 py-3 text-sm font-medium">{address.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{address.street}</td>
                    </ActionRow>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between gap-3">
            <Button variant="secondary" onClick={() => goTo({ kind: 'create' })}>
              <PlusIcon aria-hidden="true" className="size-4" />
              Agregar cancha
            </Button>
            <Button onClick={handleClose}>Listo</Button>
          </div>
        </div>
      )}

      <ConfirmModal
        title="Confirmar eliminación"
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        icon={FiTrash2}
        tone="danger"
        confirmLabel="Eliminar"
      >
        <p>
          ¿Estás seguro de que querés eliminar &quot;<span className="font-medium text-gray-900">{toDelete?.name}</span>
          &quot;? Los partidos ya guardados no se modifican.
        </p>
      </ConfirmModal>
    </Modal>
  )
}
