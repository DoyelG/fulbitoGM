'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { FiCamera, FiCheck, FiUserCheck } from 'react-icons/fi'
import { uploadPlayerPhoto } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { positionLabels } from '@fulbito/utils'
import Button from '@/components/Button'
import { usePlayerStore } from '@/store/usePlayerStore'
import ProfileSection from './ProfileSection'

type PlayerSectionProps = {
  player: Player
  index: number
}

const inputClassName =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/50'

export default function PlayerSection({ player, index }: PlayerSectionProps) {
  const { players, updatePlayer } = usePlayerStore()
  const [name, setName] = useState(player.name)
  const [position, setPosition] = useState(player.position)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState(player.photoUrl ?? null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const trimmedName = name.trim()
  const hasChanges = trimmedName !== player.name || position !== player.position || photoFile !== null

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaved(false)
    const isNameTaken = players.some(
      (otherPlayer) =>
        otherPlayer.id !== player.id && otherPlayer.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    )
    if (isNameTaken) {
      setErrorMessage('Ya existe un jugador con ese nombre')
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    try {
      const photoUrl = photoFile ? await uploadPlayerPhoto(photoFile, player.id) : undefined
      await updatePlayer(player.id, { name: trimmedName, position, ...(photoUrl ? { photoUrl } : {}) })
      setPhotoFile(null)
      setIsSaved(true)
    } catch {
      setErrorMessage('No se pudieron guardar los cambios. Probá de nuevo más tarde.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileSection icon={FiUserCheck} title="Mi jugador" index={index}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-brand/30">
            <Image
              src={photoPreview ?? '/silhouette.svg'}
              alt="Foto del jugador"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <FiCamera aria-hidden className="mr-2 self-center" />
            Cambiar foto
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            aria-label="Subir foto del jugador"
            className="hidden"
          />
        </div>
        <div>
          <label htmlFor="player-name" className="block text-sm font-medium text-gray-900">
            Nombre
          </label>
          <input
            id="player-name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-describedby={errorMessage ? 'player-error' : undefined}
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="player-position" className="block text-sm font-medium text-gray-900">
            Posición
          </label>
          <select
            id="player-position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            className={inputClassName}
          >
            {Object.entries(positionLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {errorMessage && (
          <p id="player-error" role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
        )}
        {isSaved && (
          <p role="status" className="flex items-center gap-1 text-sm text-green-700">
            <FiCheck aria-hidden />
            Cambios guardados
          </p>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={!hasChanges || !trimmedName || isSaving}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </ProfileSection>
  )
}
