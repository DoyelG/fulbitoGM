'use client'

import { useState } from 'react'
import { EllipsisVerticalIcon, ListBulletIcon, PlusIcon } from '@heroicons/react/24/outline'

type Props = {
  onAdd: () => void
  onManage: () => void
}

export default function AddressActionsMenu({ onAdd, onManage }: Props) {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)

  const select = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <div className="relative h-full shrink-0">
      <button
        type="button"
        aria-label="Opciones de canchas"
        onClick={(e) => {
          const spaceBelow = window.innerHeight - e.currentTarget.getBoundingClientRect().bottom
          setOpenUp(spaceBelow < 120)
          setOpen((prev) => !prev)
        }}
        className="flex h-full w-9 items-center justify-center rounded-r text-gray-700 hover:bg-gray-200"
      >
        <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
      </button>

      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}

      {open && (
        <div
          className={`absolute right-0 z-20 w-44 rounded-md border bg-white py-1 shadow-md ${
            openUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          <button
            type="button"
            onClick={() => select(onAdd)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            <PlusIcon aria-hidden="true" className="size-4 text-gray-500" />
            Agregar cancha
          </button>
          <button
            type="button"
            onClick={() => select(onManage)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            <ListBulletIcon aria-hidden="true" className="size-4 text-gray-500" />
            Ver canchas
          </button>
        </div>
      )}
    </div>
  )
}
