'use client'

import { AnimatePresence, motion, MotionConfig } from 'framer-motion'
import { Fragment } from 'react'
import type { Match, Player } from '@fulbito/types'
import type { AwardAccent } from '@fulbito/utils'
import { AwardCard } from '@/components/AwardCard'
import { AwardRunnersUp } from '@/components/AwardRunnersUp'
import { ChampionsSection } from '@/components/ChampionsSection'
import { HallOfFame } from '@/components/HallOfFame'
import { AWARD_ICONS } from '@/constants/award-icons'
import { HALL_OF_FAME, useAnnualAwards } from '@/hooks/use-annual-awards'

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

const ACCENT_CHIP: Record<AwardAccent, string> = {
  brand: 'bg-[var(--color-brand)]',
  secondary: 'bg-orange-700',
  muted: 'bg-gray-600',
}

const ACCENT_WASH: Record<AwardAccent, string> = {
  brand: 'bg-gradient-to-b from-violet-100 via-violet-50 to-white',
  secondary: 'bg-gradient-to-b from-orange-100 via-orange-50 to-white',
  muted: 'bg-gradient-to-b from-gray-200 via-gray-100 to-white',
}

export function AwardsClient({ players, matches }: Props) {
  const { selection, isHallOfFame, availableYears, onSelectSeason, podiums, seasonChampions, hallOfFame, championship } =
    useAnnualAwards(players, matches)

  return (
    <MotionConfig reducedMotion="user">
      <ChampionsSection
        championship={championship}
        champions={seasonChampions}
        seasonYear={isHallOfFame ? null : (selection as number)}
      />

      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <h1 className="text-3xl font-black italic tracking-tight">
            {isHallOfFame ? 'Hall of Fame' : 'Premios del Año'}
          </h1>
          <div className="flex items-center gap-2">
            <label htmlFor="award-season" className="text-sm font-medium">
              Temporada
            </label>
            <select
              id="award-season"
              value={selection}
              onChange={(e) => onSelectSeason(e.target.value === HALL_OF_FAME ? HALL_OF_FAME : Number(e.target.value))}
              className="rounded border px-3 py-2"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
              <option value={HALL_OF_FAME}>🏆 Hall of Fame</option>
            </select>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={String(selection)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {isHallOfFame ? (
            <HallOfFame entries={hallOfFame} />
          ) : podiums.length === 0 ? (
            <div className="mx-auto max-w-4xl px-6 py-16">
              <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
                Todavía no hay premios este año.
              </p>
            </div>
          ) : (
            podiums.map((podium, index) => {
              const Icon = AWARD_ICONS[podium.def.key]
              return (
                <Fragment key={podium.def.key}>
                  <section className={ACCENT_WASH[podium.def.accent]}>
                    <motion.div
                      variants={sectionVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-12 sm:items-start sm:gap-10 ${
                        index % 2 === 1 ? 'sm:flex-row-reverse' : 'sm:flex-row'
                      }`}
                    >
                      <div className="flex-1 text-center sm:text-left">
                        <span className={`mb-3 inline-block h-1.5 w-10 rounded-full ${ACCENT_BAR[podium.def.accent]}`} />
                        <h2 className="text-2xl font-black italic tracking-tight">{podium.def.title}</h2>
                        <p className="mt-2 text-gray-700">{podium.def.subtitle}</p>
                        <AwardRunnersUp entries={podium.runnersUp} unitLabel={podium.def.unitLabel} />
                      </div>
                      <div className="w-full max-w-[220px] shrink-0">
                        <AwardCard
                          Icon={Icon}
                          accent={podium.def.accent}
                          winnerName={podium.winner.row.name}
                          winnerPhotoUrl={podium.winner.row.photoUrl}
                          value={podium.winner.value}
                          unitLabel={podium.def.unitLabel}
                          href={`/players/${podium.winner.row.id}`}
                        />
                      </div>
                    </motion.div>
                  </section>

                  {index < podiums.length - 1 && (
                    <div className="bg-white">
                      <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
                        <div className="h-px flex-1 bg-gray-200" />
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md ${ACCENT_CHIP[podium.def.accent]}`}
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
