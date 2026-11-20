import React from 'react'
import { GalaColors, GalaFonts } from '@/constants/theme'

export const Welcome = ({ onStart }: { onStart: () => void }) => (
  <section
    className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden"
    style={{ background: GalaColors.background, fontFamily: GalaFonts.display }}
  >
    {/* Video, overlay, y contenido central */}
    <div className="absolute inset-0 -z-10">
      <video src="/awards/fulbito-awards.mp4" autoPlay muted loop poster="/awards/poster.jpg" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-60" />
    </div>
    <div className="z-10 mt-24 mb-10 flex flex-col items-center w-full px-4">
      <span className="text-base font-semibold tracking-widest text-gala-accent uppercase mb-2">Gala de premios · Temporada 2026</span>
      <h1 className="text-5xl md:text-6xl" style={{ fontFamily: GalaFonts.display, color: GalaColors.gold }}>Premios <em className="text-gala-accent not-italic">Fulbito</em> 2026</h1>
      <p className="mt-6 text-xl text-white max-w-xl text-center leading-relaxed font-sans">Celebramos el talento y pasión del año. Sumate a la votación y elegí a tus favoritos. Votación abierta hasta el 15 de diciembre.</p>
      <button
        className="mt-10 px-7 py-3 rounded-full bg-gradient-to-r from-gala-gold to-gala-gold-dark text-gala-shadow text-lg font-bold shadow-xl hover:scale-105 transition"
        onClick={onStart}
      >
        Empezar a votar
      </button>
    </div>
  </section>
)