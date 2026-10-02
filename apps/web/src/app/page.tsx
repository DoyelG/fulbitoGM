import ChampionshipWidget from '@/components/home/ChampionshipWidget'
import LeaderboardWidget from '@/components/home/LeaderboardWidget'
import QuickLinks from '@/components/home/QuickLinks'
import ScoreboardHero from '@/components/home/ScoreboardHero'
import VideosSection from '@/components/home/VideosSection'

export default function Home() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 sm:py-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <h1 className="sr-only">Inicio</h1>
      <div className="min-w-0 md:col-span-2 lg:row-start-1">
        <ScoreboardHero />
      </div>
      <div className="min-w-0 md:col-span-2 lg:col-span-3 lg:row-start-2">
        <QuickLinks />
      </div>
      <div className="min-w-0 lg:col-start-3 lg:row-start-1">
        <ChampionshipWidget />
      </div>
      <div className="min-w-0 lg:col-start-1 lg:row-start-3">
        <LeaderboardWidget />
      </div>
      <div className="min-w-0 md:col-span-2 lg:col-start-2 lg:row-start-3">
        <VideosSection />
      </div>
    </div>
  )
}
