'use client'

import { useEffect } from 'react'
import { Backdrop } from './Backdrop'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'default' | 'large'
  hideHeader?: boolean
}

export default function Modal({ open, onClose, title, children, size = 'default', hideHeader = false }: Props) {
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
        className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${
          size === 'large' ? 'max-w-4xl' : 'max-w-lg'
        }`}
      >
        <div className={`flex items-center px-4 ${hideHeader ? 'justify-end pt-3' : 'justify-between py-3 border-b'}`}>
          {!hideHeader && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-brand rounded"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </Backdrop>
  )
}
