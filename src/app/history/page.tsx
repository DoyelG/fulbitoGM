export const dynamic = 'force-dynamic'

import { loadPlayersAndMatches } from "@/lib/shape";
import HistoryClient from "./historyClient";

export default async function HistoryPage() {
  const { players, matches } = await loadPlayersAndMatches();
  return <HistoryClient players={players} matches={matches} />;
}
