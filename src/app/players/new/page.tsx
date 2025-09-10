'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'

export default function NewPlayerPage() {
  const router = useRouter()
  const addPlayer = usePlayerStore(state => state.addPlayer)
  const [formData, setFormData] = useState({
    name: '',
    position: 'PLAYER',
    physical: '5',
    technical: '5',
    tactical: '5',
    psychological: '5'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter a player name')
      return
    }

    const skills = {
      physical: parseInt(formData.physical, 10),
      technical: parseInt(formData.technical, 10),
      tactical: parseInt(formData.tactical, 10),
      psychological: parseInt(formData.psychological, 10),
    }
    const avg = (skills.physical + skills.technical + skills.tactical + skills.psychological) / 4

    addPlayer({
      name: formData.name.trim(),
      position: formData.position,
      skills,
      skill: avg
    })
    router.push('/players')
  }

  const avgPreview = (+formData.physical + +formData.technical + +formData.tactical + +formData.psychological) / 4

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Player</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-black">Player Name</label>
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
            { key: 'physical', label: 'Physical' },
            { key: 'technical', label: 'Technical' },
            { key: 'tactical', label: 'Tactical' },
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

        <div className="text-sm text-gray-800">Overall (avg): <span className="font-semibold">Lv {avgPreview}</span></div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-black">Position</label>
          <select
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
          >
            <option value="GK">Goalkeeper</option>
            <option value="DEF">Defender</option>
            <option value="MID">Midfielder</option>
            <option value="FWD">Forward</option>
            <option value="PLAYER">Player (Any position)</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={() => router.push('/players')} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
            Cancel
          </button>
          <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
            Save Player
          </button>
        </div>
      </form>
    </div>
  )
}