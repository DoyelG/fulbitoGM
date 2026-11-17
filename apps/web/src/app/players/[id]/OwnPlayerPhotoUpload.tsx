'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { FiCamera } from 'react-icons/fi'
import { uploadPlayerPhoto } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import Button from '@/components/Button'
import { usePlayerStore } from '@/store/usePlayerStore'

const PHOTO_MAX_BYTES = 5 * 1024 * 1024

export default function OwnPlayerPhotoUpload({ player }: { player: Player }) {
  const updatePlayer = usePlayerStore((state) => state.updatePlayer)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Elegí un archivo de imagen.')
      return
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setErrorMessage('La foto puede pesar hasta 5 MB.')
      return
    }
    setErrorMessage(null)
    setIsUploading(true)
    try {
      const photoUrl = await uploadPlayerPhoto(file, player.tournamentId, player.id)
      await updatePlayer(player.id, { photoUrl })
    } catch {
      setErrorMessage('No se pudo subir la foto. Probá de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="soft"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-busy={isUploading}
        aria-describedby={errorMessage ? 'own-player-photo-error' : undefined}
      >
        <FiCamera aria-hidden />
        {isUploading ? 'Subiendo foto…' : player.photoUrl ? 'Cambiar foto' : 'Subir foto'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event) => void handleChange(event)}
        tabIndex={-1}
        aria-hidden
        className="hidden"
      />
      <span role="status" className="sr-only">
        {isUploading ? 'Subiendo foto…' : ''}
      </span>
      {errorMessage && (
        <p id="own-player-photo-error" role="alert" className="text-sm text-orange-700">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
