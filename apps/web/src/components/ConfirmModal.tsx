'use client'

import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import Button from './Button'
import Modal from './Modal'

type Tone = 'primary' | 'danger'
type ConfirmVariant = 'primary' | 'danger'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  icon: IconType
  tone?: Tone
  confirmVariant?: ConfirmVariant
  confirmLabel?: string
  cancelLabel?: string
  children: ReactNode
}

const toneStyles: Record<Tone, { circle: string; icon: string; button: ConfirmVariant }> = {
  primary: { circle: 'bg-primary/10', icon: 'text-primary', button: 'primary' },
  danger: { circle: 'bg-orange-100', icon: 'text-orange-600', button: 'danger' },
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  icon: Icon,
  tone = 'primary',
  confirmVariant,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  children,
}: Props) {
  const styles = toneStyles[tone]

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="p-2 text-center">
        <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${styles.circle}`}>
          <Icon aria-hidden="true" className={styles.icon} size={20} />
        </div>
        <div className="text-gray-600">{children}</div>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" block onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant ?? styles.button} block onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
