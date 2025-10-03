import { prisma } from "@/lib/prisma";
import PlayersClient from "./playersClient";
import type { Player as StorePlayer } from "@/store/usePlayerStore";

export default async function PlayersPage() {
  const [players, matches] = await Promise.all([
    prisma.player.findMany({ orderBy: { name: "asc" } }),
    prisma.match.findMany({ orderBy: { date: "desc" }, include: { players: true } }),
  ]);

  const nameMap = new Map(players.map((p) => [p.id, p.name] as const));
  const shapedPlayers: StorePlayer[] = players.map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position,
    skill: p.skill ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))
  const shapedMatches = matches.map((m) => ({
    id: m.id,
    date: m.date.toISOString().slice(0, 10),
    type: m.type,
    name: m.name ?? undefined,
    teamAScore: m.teamAScore,
    teamBScore: m.teamBScore,
    teamA: m.players
      .filter((p) => p.team === "A")
      .map((p) => ({ id: p.playerId, name: nameMap.get(p.playerId) || "", goals: p.goals, performance: p.performance })),
    teamB: m.players
      .filter((p) => p.team === "B")
      .map((p) => ({ id: p.playerId, name: nameMap.get(p.playerId) || "", goals: p.goals, performance: p.performance })),
  }));

  return <PlayersClient players={shapedPlayers} matches={shapedMatches} />;
}
