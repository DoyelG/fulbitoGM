'use client'

import { useEffect, useState } from 'react'
import { animate, motion, useReducedMotion } from 'framer-motion'
import type { ChampionshipProgress } from '@/hooks/use-annual-awards'

const THRESHOLD = 7

type Props = { championship: ChampionshipProgress }

function useCountUp(target: number, shouldAnimate: boolean): number {
  const [value, setValue] = useState(shouldAnimate ? 0 : target)

  useEffect(() => {
    if (!shouldAnimate) {
      setValue(target)
      return
    }
    const controls = animate(0, target, {
      duration: 1,
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [target, shouldAnimate])

  return value
}

export function ChampionshipHero({ championship }: Props) {
  const reducedMotion = useReducedMotion()
  const streak = championship?.streak ?? 0
  const displayedStreak = useCountUp(streak, !reducedMotion && championship !== null)

  return (
    <section
      aria-label="Camino al campeonato"
      className="w-full bg-gradient-to-br from-brand to-brand-dark text-white"
    >
      <div className="max-w-5xl mx-auto px-6 py-16">
        {championship === null ? (
          <p className="text-white/90">Todavía nadie está en racha ganadora este año.</p>
        ) : (
          <>
            <p className="text-xs tracking-[0.2em] text-white/90 mb-2">CAMINO AL CAMPEONATO</p>
            <div className="overflow-hidden">
              <motion.h2
                className="text-5xl font-black italic leading-none"
                initial={reducedMotion ? false : { y: '100%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                {championship.playerName}
              </motion.h2>
            </div>
            <p className="mt-4 text-lg font-semibold">
              {championship.isChampion ? '🏆 CAMPEÓN' : `${displayedStreak}/${THRESHOLD} VICTORIAS SEGUIDAS AHORA`}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
