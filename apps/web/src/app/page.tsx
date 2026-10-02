import ChampionshipWidget from '@/components/home/ChampionshipWidget'
import LeaderboardWidget from '@/components/home/LeaderboardWidget'
import QuickLinks from '@/components/home/QuickLinks'
import ScoreboardHero from '@/components/home/ScoreboardHero'

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="sr-only">Inicio</h1>
      <ScoreboardHero />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:order-2">
          <ChampionshipWidget />
        </div>
        <div className="md:order-1">
          <LeaderboardWidget />
        </div>
      </div>
      <QuickLinks />
    </div>
  )
}
