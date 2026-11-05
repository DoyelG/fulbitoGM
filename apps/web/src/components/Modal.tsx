'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'default' | 'medium' | 'large'
  hideHeader?: boolean
}

const MODAL_WIDTHS = {
  default: 'max-w-lg',
  medium: 'max-w-2xl',
  large: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, children, size = 'default', hideHeader = false }: Props) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${MODAL_WIDTHS[size]}`}>
        <div
          className={`flex items-center px-4 ${hideHeader ? 'justify-end pt-3' : 'justify-between py-3 border-b border-gray-200'}`}
        >
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
    </div>,
    document.body,
  )
}
