import React, { useState } from 'react'
import { AwardCategory } from '@/constants/theme'

interface Nominee {
  name: string
  avatar: string
}

export const CategoryStep = ({
  category,
  nominees,
  selected,
  onSelect,
  onNext,
  progress,
  total,
}: {
  category: AwardCategory
  nominees: Record<string, Nominee>
  selected: string | null
  onSelect: (nomineeId: string | null) => void
  onNext: () => void
  progress: number
  total: number
}) => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gala-bg" style={{ fontFamily: 'Bodoni Moda, serif' }}>
      <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-lg p-8 relative">
        <div className="mb-2 text-sm font-bold tracking-wide text-gala-accent uppercase">
          {category.tone === 'honor' ? 'Premio de honor' : 'Premio de humor'}
        </div>
        <div className="flex items-baseline gap-4 mb-3">
          <span className="text-3xl text-gala-gold font-display">{String(progress).padStart(2, '0')}/<span className="text-xl">{total}</span></span>
          <h2 className="text-2xl font-bold text-gala-shadow">{category.title}</h2>
        </div>
        <p className="text-gray-700 mb-7">{category.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {category.nomineeIds.map(id => (
            <button
              key={id}
              type="button"
              className={`group flex flex-col items-center py-4 px-2 bg-white border-2 rounded-xl transition shadow-md ${selected === id ? 'border-gala-gold scale-105' : 'border-gray-300'}`}
              onClick={() => onSelect(id)}
              aria-pressed={selected === id}
              tabIndex={0}
            >
              <img
                src={nominees[id]?.avatar || '/awards/avatar-default.jpg'}
                alt={nominees[id]?.name || ''}
                className={`w-20 h-20 object-cover rounded-full mb-2 border-2 ${selected === id ? 'border-gala-gold' : 'border-gray-300'} grayscale ${selected === id ? '' : 'opacity-70'}`}
              />
              <span className={`font-bold text-lg ${selected === id ? 'text-gala-gold' : 'text-gray-900'}`}>{nominees[id]?.name}</span>
              {selected === id && <div className="mt-1 text-xs text-gala-accent font-semibold">TU VOTO ✓</div>}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-6">
          <button className="text-sm py-2 px-6 bg-gala-shadow text-white rounded-full mr-2" onClick={() => onSelect(null)}>
            Prefiero no votar
          </button>
          <button
            className={`text-lg font-bold px-6 py-3 rounded-full bg-gradient-to-r from-gala-gold to-gala-gold-dark text-gala-shadow shadow-xl transition ${selected ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'}`}
            onClick={selected ? onNext : undefined}
            disabled={!selected}
          >
            {selected && nominees[selected]?.name ? `Votar a ${nominees[selected].name}` : 'Votar'}
          </button>
        </div>
      </div>
    </section>
  )
}
