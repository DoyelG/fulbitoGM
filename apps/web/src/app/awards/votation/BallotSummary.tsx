import React from 'react'
import { AwardCategory, AwardBallot } from '@/constants/theme'

interface Nominee {
  name: string
  avatar: string
}

export const BallotSummary = ({
  categories,
  ballot,
  nominees,
  onEdit,
  onSubmit,
}: {
  categories: AwardCategory[]
  ballot: AwardBallot
  nominees: Record<string, Nominee>
  onEdit: (categoryKey: string) => void
  onSubmit: () => void
}) => (
  <section className="flex flex-col items-center justify-center min-h-screen bg-gala-bg">
    <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-display text-gala-gold mb-4">Tu boleta de votación</h2>
      <ol className="mb-6 space-y-4">
        {categories.map(cat => (
          <li key={cat.key} className="flex items-center gap-3 border-b border-gray-200 py-3">
            <span className="text-gala-accent font-bold mr-2">{cat.title}</span>
            {ballot.votes[cat.key] ? (
              <div className="flex items-center gap-2">
                <img src={nominees[ballot.votes[cat.key]]?.avatar || '/awards/avatar-default.jpg'} alt={nominees[ballot.votes[cat.key]]?.name} className="w-10 h-10 rounded-full border border-gala-gold" />
                <span className="font-bold text-gala-gold">{nominees[ballot.votes[cat.key]]?.name}</span>
              </div>
            ) : <span className="text-gray-500">Sin voto</span>}
            <button className="ml-auto text-sm px-4 py-2 rounded-full bg-gala-shadow text-white hover:bg-gala-gold transition font-bold" onClick={() => onEdit(cat.key)}>Cambiar</button>
          </li>
        ))}
      </ol>
      <button className="w-full py-4 rounded-full font-bold bg-gradient-to-r from-gala-gold to-gala-gold-dark text-gala-shadow shadow-xl text-xl mt-6 hover:scale-105 transition" onClick={onSubmit}>Enviar mis votos</button>
      <p className="mt-4 text-xs text-gray-700 text-center">Tu voto es secreto y puedes cambiarlo hasta el cierre de la gala.</p>
    </div>
  </section>
)