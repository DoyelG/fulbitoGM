'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { FiCamera, FiTrash2 } from 'react-icons/fi'

type Props = {
  previewUrl: string | null
  onSelect: (file: File) => void
  onRemove: () => void
}

export default function PlayerPhotoField({ previewUrl, onSelect, onRemove }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const openPicker = () => fileInputRef.current?.click()

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={openPicker}
        aria-label={previewUrl ? 'Cambiar foto' : 'Subir foto'}
        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-white shadow-md focus:outline-none focus-visible:ring-brand"
      >
        <Image src={previewUrl ?? '/silhouette.svg'} alt="" fill unoptimized className="object-cover" />
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <FiCamera size={22} />
        </span>
      </button>
      <div className="flex flex-col items-start gap-1.5">
        <button
          type="button"
          onClick={openPicker}
          className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-brand hover:bg-brand/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          <FiCamera aria-hidden />
          {previewUrl ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={() => {
              onRemove()
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <FiTrash2 aria-hidden />
            Quitar foto
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Elegir foto del jugador"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onSelect(file)
        }}
        className="hidden"
      />
    </div>
  )
}
