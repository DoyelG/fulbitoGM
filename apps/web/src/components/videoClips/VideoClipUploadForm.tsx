'use client'

import { useMemo, useState } from 'react'
import type { Match, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'

type UploadData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

type Props = {
  matches: Match[]
  currentPlayerId: string
  onSubmit: (data: UploadData, file: File) => Promise<void>
  onCancel: () => void
}

export default function VideoClipUploadForm({ matches, currentPlayerId, onSubmit, onCancel }: Props) {
  const [matchId, setMatchId] = useState('')
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [category, setCategory] = useState<VideoClipCategory>('highlight')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedMatch = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId])
  const suggestedPlayers = useMemo(
    () => (selectedMatch ? [...selectedMatch.teamA, ...selectedMatch.teamB] : []),
    [selectedMatch],
  )

  const handleMatchChange = (id: string) => {
    setMatchId(id)
    setPlayerIds(id ? [currentPlayerId] : [])
  }

  const togglePlayer = (id: string) => {
    setPlayerIds(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]))
  }

  const canSubmit = matchId !== '' && playerIds.length > 0 && file !== null && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !file) return
    setSubmitting(true)
    try {
      await onSubmit({ matchId, playerIds, category, title: title.trim() || undefined }, file)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="clip-match" className="block text-sm font-medium text-black">
          Partido
        </label>
        <select
          id="clip-match"
          required
          value={matchId}
          onChange={e => handleMatchChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        >
          <option value="">Elegí un partido</option>
          {matches.map(m => (
            <option key={m.id} value={m.id}>
              {new Date(m.date).toLocaleDateString()} · {m.type}
            </option>
          ))}
        </select>
      </div>

      {selectedMatch && (
        <div>
          <span className="block text-sm font-medium text-black">Jugadores en el clip</span>
          <div className="mt-1 grid grid-cols-2 gap-1 max-h-40 overflow-y-auto border rounded-md p-2">
            {suggestedPlayers.map(p => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={playerIds.includes(p.id)}
                  onChange={() => togglePlayer(p.id)}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="clip-category" className="block text-sm font-medium text-black">
          Categoría
        </label>
        <select
          id="clip-category"
          value={category}
          onChange={e => setCategory(e.target.value as VideoClipCategory)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        >
          {VIDEO_CLIP_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="clip-title" className="block text-sm font-medium text-black">
          Título (opcional)
        </label>
        <input
          id="clip-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        />
      </div>

      <div>
        <label htmlFor="clip-file" className="block text-sm font-medium text-black">
          Archivo de video
        </label>
        <input
          id="clip-file"
          type="file"
          required
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand/90 disabled:opacity-50"
        >
          {submitting ? 'Subiendo...' : 'Subir clip'}
        </button>
      </div>
    </form>
  )
}
