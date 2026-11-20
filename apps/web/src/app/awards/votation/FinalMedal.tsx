import React from 'react'

export const FinalMedal = ({ userName }: { userName: string }) => (
  <section className="flex flex-col items-center justify-center min-h-screen bg-gala-bg">
    <div className="w-full max-w-md mx-auto bg-white/90 rounded-2xl shadow-lg p-8 flex flex-col items-center">
      {/* Medalla animada (puedes reemplazar con SVG + animación) */}
      <div className="my-8">
        <svg width="70" height="70" fill="none" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r="33" stroke="#d6b36a" strokeWidth="4" />
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fill="#d6b36a" fontFamily="Bodoni Moda, serif">🏅</text>
        </svg>
      </div>
      <h2 className="text-2xl font-display text-gala-gold mb-2">¡Gracias, {userName}!</h2>
      <p className="mb-4 text-lg text-gala-accent">Tus votos están enviados. Nos vemos en la gala de premios.</p>
      <div className="mt-6 text-sm text-gray-700 text-center">Agendá la gala para el 15 de diciembre 2026.<br/>Tu boleta fue enviada exitosamente.</div>
    </div>
  </section>
)