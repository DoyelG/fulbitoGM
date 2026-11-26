'use client'

import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import Button from './Button'
import Modal from './Modal'

type Tone = 'primary' | 'danger'
type ConfirmVariant = 'primary' | 'danger'
type IconSize = 'default' | 'large'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel?: () => void
  busy?: boolean
  title: string
  icon: IconType
  iconSize?: IconSize
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

const iconSizes: Record<IconSize, { circle: string; icon: number }> = {
  default: { circle: 'mb-3 h-10 w-10', icon: 20 },
  large: { circle: 'mb-4 h-16 w-16', icon: 32 },
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  onCancel,
  busy = false,
  title,
  icon: Icon,
  iconSize = 'default',
  tone = 'primary',
  confirmVariant,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  children,
}: Props) {
  const styles = toneStyles[tone]
  const sizes = iconSizes[iconSize]

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="p-2 text-center">
        <div className={`mx-auto flex items-center justify-center rounded-full ${sizes.circle} ${styles.circle}`}>
          <Icon aria-hidden="true" className={styles.icon} size={sizes.icon} />
        </div>
        <div className="text-gray-600">{children}</div>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" block onClick={busy ? undefined : (onCancel ?? onClose)} aria-disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant ?? styles.button}
            block
            onClick={busy ? undefined : onConfirm}
            aria-disabled={busy}
            aria-busy={busy}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
