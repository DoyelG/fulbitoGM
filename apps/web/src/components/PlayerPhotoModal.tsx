'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import GoldSpinner from '@/components/GoldSpinner'
import Modal from '@/components/Modal'

type Props = {
  open: boolean
  onClose: () => void
  name: string
  photoUrl?: string | null
  footer?: ReactNode
}

function ExpandedPhoto({ src, name }: { src: string; name: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className="relative h-[min(50vh,420px)] w-full overflow-hidden rounded-xl bg-gray-50">
      {status === 'loading' && <GoldSpinner label={`Cargando foto de ${name}`} />}
      {status === 'error' ? (
        <p role="alert" className="absolute inset-0 grid place-items-center text-sm text-gray-700">
          No se pudo cargar la foto.
        </p>
      ) : (
        <Image
          src={src}
          alt={`Foto de ${name}`}
          fill
          sizes="512px"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`object-contain transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  )
}

export default function PlayerPhotoModal({ open, onClose, name, photoUrl, footer }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={name}>
      {photoUrl && <ExpandedPhoto key={photoUrl} src={photoUrl} name={name} />}
      {footer && <div className={photoUrl ? 'mt-4 border-t border-gray-200 pt-4' : undefined}>{footer}</div>}
    </Modal>
  )
}
