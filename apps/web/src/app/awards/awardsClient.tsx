'use client'

import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import type { Match, Player } from '@fulbito/types'
import { AwardCard } from '@/components/AwardCard'
import { ChampionshipHero } from '@/components/ChampionshipHero'
import { AWARD_ICONS } from '@/constants/award-icons'
import { useAnnualAwards } from '@/hooks/use-annual-awards'

type Props = { players: Player[]; matches: Match[] }

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function AwardsClient({ players, matches }: Props) {
  const { currentYear, availableYears, onSelectYear, winners, championship } = useAnnualAwards(players, matches)

  return (
    <MotionConfig reducedMotion="user">
      <ChampionshipHero championship={championship} />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Premios del Año</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="award-year" className="text-sm font-medium">
              Temporada
            </label>
            <select
              id="award-year"
              value={currentYear}
              onChange={(e) => onSelectYear(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentYear}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {winners.length === 0 ? (
              <p className="text-gray-600 text-center py-16">Todavía no hay premios este año.</p>
            ) : (
              <div className="flex flex-col gap-16">
                {winners.map((winner, index) => (
                  <motion.div
                    key={winner.def.key}
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    className={`flex flex-col items-center gap-8 border-b border-gray-100 pb-16 last:border-b-0 last:pb-0 sm:gap-10 ${
                      index % 2 === 1 ? 'sm:flex-row-reverse' : 'sm:flex-row'
                    }`}
                  >
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-black italic tracking-tight">{winner.def.title}</h2>
                      <p className="mt-2 text-gray-600">{winner.def.subtitle}</p>
                    </div>
                    <div className="w-full max-w-[220px] shrink-0">
                      <AwardCard
                        Icon={AWARD_ICONS[winner.def.key]}
                        accent={winner.def.accent}
                        winnerName={winner.row.name}
                        winnerPhotoUrl={winner.row.photoUrl}
                        value={winner.value}
                        unitLabel={winner.def.unitLabel}
                        href={`/players/${winner.row.id}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
