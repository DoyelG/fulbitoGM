import { loadPlayersAndMatches } from "@/lib/shape";
import HistoryClient from "./historyClient";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { players, matches } = await loadPlayersAndMatches();
  return <HistoryClient players={players} matches={matches} />;
}
