'use client'

import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Fragment } from 'react'
import type { Match, Player } from '@fulbito/types'
import type { AwardAccent } from '@fulbito/utils'
import { AwardCard } from '@/components/AwardCard'
import { ChampionshipHero } from '@/components/ChampionshipHero'
import { AWARD_ICONS } from '@/constants/award-icons'
import { useAnnualAwards } from '@/hooks/use-annual-awards'

type Props = { players: Player[]; matches: Match[] }

const sectionVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

const ACCENT_BAR: Record<AwardAccent, string> = {
  brand: 'bg-[var(--color-brand)]',
  secondary: 'bg-[var(--color-accent)]',
  muted: 'bg-gray-400',
}

// A soft, distinct wash per award identity — replaces flat alternating
// white/gray bands so each section reads as its own colored "chapter".
const ACCENT_WASH: Record<AwardAccent, string> = {
  brand: 'bg-gradient-to-b from-violet-100 via-violet-50 to-white',
  secondary: 'bg-gradient-to-b from-orange-100 via-orange-50 to-white',
  muted: 'bg-gradient-to-b from-gray-200 via-gray-100 to-white',
}

export function AwardsClient({ players, matches }: Props) {
  const { currentYear, availableYears, onSelectYear, winners, championship } = useAnnualAwards(players, matches)

  return (
    <MotionConfig reducedMotion="user">
      <ChampionshipHero championship={championship} />

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
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
            winners.map((winner, index) => {
              const Icon = AWARD_ICONS[winner.def.key]
              return (
                <Fragment key={winner.def.key}>
                  <motion.section
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={ACCENT_WASH[winner.def.accent]}
                  >
                    <div
                      className={`max-w-5xl mx-auto flex flex-col items-center gap-8 px-6 py-16 sm:gap-12 ${
                        index % 2 === 1 ? 'sm:flex-row-reverse' : 'sm:flex-row'
                      }`}
                    >
                      <div className="flex-1 text-center sm:text-left">
                        <span className={`mb-3 inline-block h-1.5 w-10 rounded-full ${ACCENT_BAR[winner.def.accent]}`} />
                        <h2 className="text-2xl font-black italic tracking-tight">{winner.def.title}</h2>
                        <p className="mt-2 text-gray-700">{winner.def.subtitle}</p>
                      </div>
                      <div className="w-full max-w-[220px] shrink-0">
                        <AwardCard
                          Icon={Icon}
                          accent={winner.def.accent}
                          winnerName={winner.row.name}
                          winnerPhotoUrl={winner.row.photoUrl}
                          value={winner.value}
                          unitLabel={winner.def.unitLabel}
                          href={`/players/${winner.row.id}`}
                        />
                      </div>
                    </div>
                  </motion.section>

                  {index < winners.length - 1 && (
                    <div className="bg-white">
                      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
                        <div className="h-px flex-1 bg-gray-200" />
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md ${ACCENT_BAR[winner.def.accent]}`}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    </div>
                  )}
                </Fragment>
              )
            })
          )}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  )
}
