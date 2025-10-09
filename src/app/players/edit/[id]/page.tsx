'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'

export default function EditPlayerPage() {
  const router = useRouter()
  const { id } = useParams()
  const { getPlayer, updatePlayer } = usePlayerStore()
  const [formData, setFormData] = useState({
    name: '',
    position: 'PLAYER',
    physical: '5',
    technical: '5',
    tactical: '5',
    psychological: '5'
  })

  useEffect(() => {
    const p = getPlayer(id as string)
    if (p) {
      const physical = String(p.skills?.physical ?? (p.skill === null ? 5 : p.skill))
      const technical = String(p.skills?.technical ?? (p.skill === null ? 5 : p.skill))
      const tactical = String(p.skills?.tactical ?? (p.skill === null ? 5 : p.skill))
      const psychological = String(p.skills?.psychological ?? (p.skill === null ? 5 : p.skill))
      setFormData({
        name: p.name,
        position: p.position,
        physical, technical, tactical, psychological
      })
    }
  }, [id, getPlayer])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const skills = {
      physical: parseInt(formData.physical, 10),
      technical: parseInt(formData.technical, 10),
      tactical: parseInt(formData.tactical, 10),
      psychological: parseInt(formData.psychological, 10),
    }
    const avg = (skills.physical + skills.technical + skills.tactical + skills.psychological) / 4

    updatePlayer(id as string, {
      name: formData.name,
      position: formData.position,
      skills,
      skill: avg
    })
    router.push('/players')
  }

  const avgPreview = (+formData.physical + +formData.technical + +formData.tactical + +formData.psychological) / 4

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar jugador</h1>

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
            Actualizar jugador
          </button>
        </div>
      </form>
    </div>
  )
}