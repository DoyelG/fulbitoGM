import { loadPlayersAndMatches } from "@/lib/shape";
import PlayersClient from "./playersClient";

export default async function PlayersPage() {
  const { players, matches } = await loadPlayersAndMatches();
  return <PlayersClient players={players} matches={matches} />;
}
