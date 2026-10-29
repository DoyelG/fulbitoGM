'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { PhotoIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { TOURNAMENT_PHOTO_MAX_BYTES } from '@fulbito/firebase'
import Button from '@/components/Button'

type Props = {
  currentUrl?: string
  value: File | null | undefined
  onChange: (value: File | null | undefined) => void
}

export default function TournamentPhotoField({ currentUrl, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!value) {
      setFilePreview(null)
      return
    }
    const url = URL.createObjectURL(value)
    setFilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [value])

  const previewUrl = value === undefined ? currentUrl : filePreview
  const hasPhoto = Boolean(previewUrl)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('El archivo tiene que ser una imagen')
      return
    }
    if (file.size > TOURNAMENT_PHOTO_MAX_BYTES) {
      setError('La imagen puede pesar hasta 5 MB')
      return
    }
    setError(null)
    onChange(file)
  }

  const handleRemove = () => {
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onChange(currentUrl ? null : undefined)
  }

  return (
    <div>
      <span id="tournament-photo-label" className="block text-sm font-medium mb-1">
        Imagen <span className="font-normal text-gray-700">(opcional)</span>
      </span>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-gray-200 shadow-sm">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Vista previa de la imagen del torneo"
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <TrophyIcon className="absolute inset-0 m-auto h-8 w-8 text-indigo-600" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            className="items-center gap-2"
            aria-describedby={error ? 'tournament-photo-error' : 'tournament-photo-hint'}
          >
            <PhotoIcon className="h-5 w-5" aria-hidden />
            {hasPhoto ? 'Cambiar imagen' : 'Elegir imagen'}
          </Button>
          {hasPhoto && (
            <Button type="button" variant="secondary" onClick={handleRemove}>
              Quitar
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-labelledby="tournament-photo-label"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {error ? (
        <p id="tournament-photo-error" role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <p id="tournament-photo-hint" className="mt-2 text-xs text-gray-700">
          Reemplaza el ícono de la copa. Hasta 5 MB.
        </p>
      )}
    </div>
  )
}
