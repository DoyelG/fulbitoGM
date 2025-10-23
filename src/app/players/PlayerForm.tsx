'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlayerStore } from '@/store/usePlayerStore'

type Props = {
  mode: 'create' | 'edit'
  playerId?: string
}

export default function PlayerForm({ mode, playerId }: Props) {
  const router = useRouter()
  const { addPlayer, updatePlayer, getPlayer } = usePlayerStore()
  const [formData, setFormData] = useState({
    name: '',
    position: 'PLAYER',
    physical: '5',
    technical: '5',
    tactical: '5',
    psychological: '5'
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && playerId) {
      const p = getPlayer(playerId)
      if (p) {
        const base = p.skill === null ? 5 : p.skill
        setFormData({
          name: p.name,
          position: p.position,
          physical: String(p.skills?.physical ?? base),
          technical: String(p.skills?.technical ?? base),
          tactical: String(p.skills?.tactical ?? base),
          psychological: String(p.skills?.psychological ?? base)
        })
        setPhotoPreview(p.photoUrl ?? null)
      }
    }
  }, [mode, playerId, getPlayer])

  const avgPreview = useMemo(() => (
    (+formData.physical + +formData.technical + +formData.tactical + +formData.psychological) / 4
  ), [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const skills = {
      physical: parseInt(formData.physical, 10),
      technical: parseInt(formData.technical, 10),
      tactical: parseInt(formData.tactical, 10),
      psychological: parseInt(formData.psychological, 10),
    }
    const avg = (skills.physical + skills.technical + skills.tactical + skills.psychological) / 4

    let uploadedUrl: string | undefined
    if (photoFile) {
      const fd = new FormData()
      fd.append('file', photoFile)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        uploadedUrl = data.url
      }
    }

    if (mode === 'create') {
      await addPlayer({ name: formData.name.trim(), position: formData.position, skills, skill: avg, ...(uploadedUrl ? { photoUrl: uploadedUrl } : {}) })
    } else if (playerId) {
      await updatePlayer(playerId, { name: formData.name.trim(), position: formData.position, skills, skill: avg, ...(uploadedUrl ? { photoUrl: uploadedUrl } : {}) })
    }
    router.push('/players')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-black">Nombre del jugador</label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { key: 'physical', label: 'Físico' },
          { key: 'technical', label: 'Técnico' },
          { key: 'tactical', label: 'Táctico' },
          { key: 'psychological', label: 'Mental' },
        ].map(cat => (
          <div key={cat.key}>
            <label className="block text-sm font-medium text-black">{cat.label}</label>
            <select
              value={(formData as unknown as { [key: string]: number | string })[cat.key]}
              onChange={(e) => setFormData({ ...formData, [cat.key]: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-black">Foto</label>
        <div className="mt-2 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-gray-300 bg-white">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="preview" className="object-cover w-full h-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/silhouette.svg" alt="placeholder" className="object-cover w-full h-full" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null
              setPhotoFile(f)
              setPhotoPreview(f ? URL.createObjectURL(f) : photoPreview)
            }}
            className="text-sm"
          />
        </div>
      </div>

      <div className="text-sm text-gray-800">General (promedio): <span className="font-semibold">Lv {avgPreview}</span></div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-black">Posición</label>
        <select
          id="position"
          value={formData.position}
          onChange={(e) => setFormData({...formData, position: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        >
          <option value="GK">Arquero</option>
          <option value="DEF">Defensor</option>
          <option value="MID">Mediocampista</option>
          <option value="FWD">Delantero</option>
          <option value="PLAYER">Cualquier posición</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={() => router.push('/players')} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
          Cancelar
        </button>
        <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
          {mode === 'create' ? 'Guardar jugador' : 'Actualizar jugador'}
        </button>
      </div>
    </form>
  )
}


