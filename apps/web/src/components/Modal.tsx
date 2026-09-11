'use client'

import { useEffect } from 'react'
import { Backdrop } from './Backdrop'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'default' | 'large'
}

export default function Modal({ open, onClose, title, children, size = 'default' }: Props) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <Backdrop onClose={onClose} title={title}>
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto ${
          size === 'large' ? 'max-w-4xl' : 'max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between p-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-brand rounded"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </Backdrop>
  )
}
