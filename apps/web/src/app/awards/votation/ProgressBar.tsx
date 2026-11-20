import React from 'react'

export const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2 w-full max-w-md mx-auto mt-4 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`flex-1 h-2 rounded-full transition-all duration-300 ${current > i ? 'bg-gala-gold' : 'bg-gala-silver-dark bg-gradient-to-r from-gala-silver to-gala-shadow'}`}
      />
    ))}
  </div>
)