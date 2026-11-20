import React, { useState } from 'react'
import { mockEdition2026, mockNominees } from '../votation/mock-editions'
import { AwardCategory } from '@/constants/theme'

const allPlayers = Object.entries(mockNominees)
  .filter(([id]) => !id.startsWith('logo-'))
  .map(([id, data]) => ({ id, name: data.name }))

export default function AwardsAdminPage() {
  const [categories, setCategories] = useState<AwardCategory[]>(mockEdition2026.categories)
  const [form, setForm] = useState({
    title: '',
    description: '',
    tone: 'honor' as 'honor' | 'humor',
    order: categories.length + 1,
    nomineeIds: [] as string[],
  })

  const handleAdd = () => {
    if (!form.title || !form.description || form.nomineeIds.length === 0)
      return alert('Completa todos los campos y elegí nominados')
    setCategories(cats => [
      ...cats,
      {
        key: form.title.toLowerCase().split(' ').join('-'),
        tone: form.tone,
        order: form.order,
        title: form.title,
        description: form.description,
        nomineeIds: form.nomineeIds,
      },
    ])
    setForm({ title: '', description: '', tone: 'honor', order: categories.length + 2, nomineeIds: [] })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow mt-14">
      <h1 className="text-2xl font-bold mb-6">Admin · Ternas de premios Fulbito</h1>
      <div className="mb-8">
        <label className="block mb-2 font-semibold">Título</label>
        <input type="text" className="w-full border rounded p-2 mb-3" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <label className="block mb-2 font-semibold">Descripción</label>
        <input type="text" className="w-full border rounded p-2 mb-3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <label className="block mb-2 font-semibold">Tipo</label>
        <select className="w-full border rounded p-2 mb-3" value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value as 'honor' | 'humor' }))}>
          <option value="honor">Honor</option>
          <option value="humor">Humor</option>
        </select>
        <label className="block mb-2 font-semibold">Nominados (jugadores)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {allPlayers.map(player => (
            <label key={player.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.nomineeIds.includes(player.id)}
                onChange={e => {
                  setForm(f => e.target.checked
                    ? { ...f, nomineeIds: [...f.nomineeIds, player.id] }
                    : { ...f, nomineeIds: f.nomineeIds.filter(id => id !== player.id) })
                }}
              />
              {player.name}
            </label>
          ))}
        </div>
        <button className="mt-2 bg-brand text-white font-bold px-5 py-2 rounded" onClick={handleAdd}>Agregar terna</button>
      </div>
      <hr className="my-5" />
      <h2 className="text-lg font-semibold mb-3">Ternas existentes</h2>
      <ul>
        {categories.map(cat => (
          <li key={cat.key} className="mb-5 border rounded p-3 flex flex-col">
            <span className="font-bold text-brand">{cat.title}</span>
            <span className="text-xs text-gray-600">{cat.description}</span>
            <span className="text-xs">Tipo: {cat.tone}</span>
            <span className="text-xs">Nominados: {cat.nomineeIds.map(id => allPlayers.find(p => p.id === id)?.name).join(', ')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
