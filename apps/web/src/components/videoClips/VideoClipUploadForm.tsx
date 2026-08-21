'use client'

import { useMemo, useRef, useState } from 'react'
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
  currentPlayerId?: string
  lockedMatchId?: string
  onSubmit: (data: UploadData, file: File) => Promise<void>
  onCancel: () => void
  error?: string | null
}

export default function VideoClipUploadForm({
  matches,
  currentPlayerId,
  lockedMatchId,
  onSubmit,
  onCancel,
  error,
}: Props) {
  const [matchId, setMatchId] = useState(lockedMatchId ?? '')
  const [playerIds, setPlayerIds] = useState<string[]>([])
  const [category, setCategory] = useState<VideoClipCategory>('highlight')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileChange = (selected: File | null) => {
    if (selected && !selected.type.startsWith('video/')) {
      setFile(null)
      setFileError(`"${selected.name}" no es un archivo de video.`)
      return
    }
    setFileError(null)
    setFile(selected)
  }

  const selectedMatch = useMemo(() => matches.find(m => m.id === matchId), [matches, matchId])
  const suggestedPlayers = useMemo(
    () => (selectedMatch ? [...selectedMatch.teamA, ...selectedMatch.teamB] : []),
    [selectedMatch],
  )

  const handleMatchChange = (id: string) => {
    setMatchId(id)
    setPlayerIds(id && currentPlayerId ? [currentPlayerId] : [])
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <span className="block text-sm font-semibold text-gray-900 mb-1.5">📅 Partido</span>
        {lockedMatchId ? (
          <div className="rounded-md border bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
            {selectedMatch ? `${new Date(selectedMatch.date).toLocaleDateString()} · ${selectedMatch.type}` : '—'}
          </div>
        ) : (
          <select
            id="clip-match"
            required
            value={matchId}
            onChange={e => handleMatchChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
          >
            <option value="">Elegí un partido</option>
            {matches.map(m => (
              <option key={m.id} value={m.id}>
                {new Date(m.date).toLocaleDateString()} · {m.type}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedMatch && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="block text-sm font-semibold text-gray-900">🙋 Jugadores en el clip</span>
            {playerIds.length > 0 && (
              <span className="text-xs font-medium text-brand bg-brand/10 rounded-full px-2 py-0.5">
                {playerIds.length} seleccionado{playerIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto border rounded-md p-2.5 bg-gray-50/50">
            {suggestedPlayers.map(p => {
              const active = playerIds.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlayer(p.id)}
                  aria-pressed={active}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {active ? '✓ ' : ''}
                  {p.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <span className="block text-sm font-semibold text-gray-900 mb-1.5">🏷️ Categoría</span>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Categoría del clip">
          {VIDEO_CLIP_CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={category === c.value}
              onClick={() => setCategory(c.value)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                category === c.value
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="clip-title" className="block text-sm font-semibold text-gray-900 mb-1.5">
          ✏️ Título <span className="font-normal text-gray-500">(opcional)</span>
        </label>
        <input
          id="clip-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Gol de tiro libre"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        />
      </div>

      <div>
        <span className="block text-sm font-semibold text-gray-900 mb-1.5">🎬 Archivo de video</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex items-center gap-3 rounded-md border-2 border-dashed px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand ${
            fileError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-brand hover:bg-brand/5'
          }`}
        >
          <span className="text-2xl" aria-hidden="true">
            {fileError ? '⚠️' : file ? '✅' : '📁'}
          </span>
          <span className="min-w-0 flex-1">
            {fileError ? (
              <>
                <span className="block text-sm font-medium text-red-800">{fileError}</span>
                <span className="block text-xs text-red-700">Click para elegir un archivo de video</span>
              </>
            ) : file ? (
              <>
                <span className="block text-sm font-medium text-gray-900 truncate">{file.name}</span>
                <span className="block text-xs text-gray-500">Click para cambiar el archivo</span>
              </>
            ) : (
              <>
                <span className="block text-sm font-medium text-gray-900">Elegí un video</span>
                <span className="block text-xs text-gray-500">Sin límite de tamaño</span>
              </>
            )}
          </span>
        </button>
        <input
          ref={fileInputRef}
          id="clip-file"
          type="file"
          accept="video/*"
          onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-gray-50 mt-4"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand/90 disabled:opacity-50 mt-4"
        >
          {submitting ? 'Subiendo...' : 'Subir clip'}
        </button>
      </div>
    </form>
  )
}
