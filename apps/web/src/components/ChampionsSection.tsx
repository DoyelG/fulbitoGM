'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { animate, motion, useReducedMotion } from 'framer-motion'
import { CHAMPIONSHIP_THRESHOLD, type ChampionshipProgress, type SeasonChampion } from '@fulbito/utils'

type Props = {
  championship: ChampionshipProgress
  champions: SeasonChampion[]
  /** null while browsing the Hall of Fame, where no single season is selected. */
  seasonYear: number | null
}

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

export function ChampionsSection({ championship, champions, seasonYear }: Props) {
  const reducedMotion = useReducedMotion()
  const streak = championship?.streak ?? 0
  const displayedStreak = useCountUp(streak, !reducedMotion && championship !== null)

  return (
    <section
      aria-label="Campeones"
      className="w-full border-t border-white/10 bg-gradient-to-br from-violet-950 via-brand-dark to-violet-950 text-white"
    >
      <div className="mx-auto max-w-4xl px-6 py-14">
        {seasonYear !== null && (
          <>
            <h2 className="mb-5 text-xs font-bold tracking-[0.2em] text-amber-300">CAMPEONES {seasonYear}</h2>

            {champions.length === 0 ? (
              <p className="text-lg text-white/80">Nadie pudo coronarse y alcanzar la gloria esta temporada.</p>
            ) : (
              <ul className="flex flex-wrap gap-6">
                {champions.map((champion) => (
                  <li key={champion.playerId} className="flex items-center gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full shadow-xl ring-4 ring-amber-300">
                      <Image
                        src={champion.playerPhotoUrl ?? '/silhouette.svg'}
                        alt={champion.playerName}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-3xl font-black italic leading-none">{champion.playerName}</p>
                      <p className="mt-2 text-sm font-semibold text-amber-300">
                        🏆 {champion.streak} VICTORIAS SEGUIDAS
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="my-10 h-px bg-white/10" />
          </>
        )}

        <h2 className="mb-4 text-xs font-bold tracking-[0.2em] text-white/70">CAMINO AL CAMPEONATO</h2>

        {championship === null ? (
          <p className="text-white/80">Todavía nadie está en racha ganadora.</p>
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full shadow-lg ring-2 ring-white/30">
              <Image
                src={championship.playerPhotoUrl ?? '/silhouette.svg'}
                alt={championship.playerName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <div className="overflow-hidden">
                <motion.p
                  className="text-3xl font-black italic leading-none"
                  initial={reducedMotion ? false : { y: '100%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  {championship.playerName}
                </motion.p>
              </div>
              <p className="mt-2 text-sm font-semibold text-white/90">
                {championship.isChampion
                  ? '🏆 CAMPEÓN'
                  : `${displayedStreak} de ${CHAMPIONSHIP_THRESHOLD} VICTORIAS AL DÍA DE LA FECHA`}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
