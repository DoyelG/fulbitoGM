export const dynamic = 'force-dynamic'

import { loadPlayersAndMatches } from "@/lib/shape";
import StatisticsClient from "./statisticsClient";

export default async function StatisticsPage() {
  const { players, matches } = await loadPlayersAndMatches();
  return <StatisticsClient players={players} matches={matches} />;
}
