'use client'

import { useState, type ReactNode } from 'react'
import Button from '@/components/Button'
import Modal from '@/components/Modal'

type Props = {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel: string
  confirmingLabel: string
  errorMessage: string
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export default function TournamentConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmingLabel,
  errorMessage,
  onCancel,
  onConfirm,
}: Props) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (confirming) return
    setError(null)
    onCancel()
  }

  const handleConfirm = async () => {
    setConfirming(true)
    setError(null)
    try {
      await onConfirm()
    } catch {
      setError(errorMessage)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <div aria-busy={confirming}>
        <p className="text-sm text-gray-800">{message}</p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-orange-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={confirming}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} variant="danger" disabled={confirming}>
            {confirming ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
