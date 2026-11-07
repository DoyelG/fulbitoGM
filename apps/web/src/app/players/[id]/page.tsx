"use client";

import { buttonClasses } from "@/components/Button";
import PageTitle from "@/components/PageTitle";
import { useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useMatchStore } from "@/store/useMatchStore";
import SkillBadge from "@/components/SkillBadge";
import StreakBadge from "@/components/StreakBadge";
import RadarChart from '@/components/RadarChart'
import PlayerCard from '@/components/PlayerCard'
import VideoClipsSection from '@/components/videoClips/VideoClipsSection'
import { calculateCurrentStreakForPlayer } from "@/lib/playerStats";
import { getShirtDutiesByPlayerId } from "@/lib/shirtDuty";
import { getMvpCountsByPlayerId, getGoalkeeping } from "@fulbito/utils";
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { selectActiveTournament, selectMyPlayerId, useTournamentStore } from '@/store/useTournamentStore'

export default function PlayerDetailPage() {
  const canManage = useCanManageTournament()
  const myPlayerId = useTournamentStore(selectMyPlayerId)
  const tournamentPhotoUrl = useTournamentStore(selectActiveTournament)?.tournament.photoUrl
  const { id } = useParams();
  const initPlayersLoad = usePlayerStore((state) => state.initLoad);
  const playersInit = usePlayerStore((state) => state.playersInit);
  const { matches, initLoad: initMatchesLoad, matchesInit } = useMatchStore();
  const player = usePlayerStore((state) =>
    state.players.find((playerRow) => playerRow.id === (id as string)),
  );

  useEffect(() => {
    if (playersInit !== 'loaded') initPlayersLoad();
    if (matchesInit !== 'loaded') initMatchesLoad();
  }, [playersInit, matchesInit, initPlayersLoad, initMatchesLoad]);

  const stats = useMemo(() => {
    const res = {
      matches: 0,
      goals: 0,
      totalPerformance: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      recent: [] as Array<{
        date: string;
        type: string;
        team: "A" | "B";
        goals: number;
        performance: number;
        score: string;
        result: "W" | "L" | "D";
        isFriendly: boolean;
      }>,
    };

    for (const match of matches) {
      const inA = match.teamA.find((playerRow) => playerRow.id === id);
      const inB = match.teamB.find((playerRow) => playerRow.id === id);
      if (!inA && !inB) continue;

      const playerInMatch = inA || inB;
      const team = inA ? ("A" as const) : ("B" as const);
      const teamAScore = match.teamAScore,
        teamBScore = match.teamBScore;
      res.matches++;
      res.goals += playerInMatch!.goals;
      res.totalPerformance += playerInMatch!.performance;
      if (team === "A") {
        if (teamAScore > teamBScore) res.wins++;
        else if (teamAScore < teamBScore) res.losses++;
        else res.draws++;
      } else {
        if (teamBScore > teamAScore) res.wins++;
        else if (teamBScore < teamAScore) res.losses++;
        else res.draws++;
      }
      res.recent.push({
        date: match.date,
        type: match.type,
        team,
        goals: playerInMatch!.goals,
        performance: playerInMatch!.performance,
        score: `${teamAScore} - ${teamBScore}`,
        result: (team === "A"
          ? teamAScore > teamBScore
            ? "W"
            : teamAScore < teamBScore
            ? "L"
            : "D"
          : teamBScore > teamAScore
          ? "W"
          : teamBScore < teamAScore
          ? "L"
          : "D") as "W" | "L" | "D",
        isFriendly: match.isFriendly ?? false,
      });
    }

    res.recent.sort((x, y) => (y.date > x.date ? 1 : -1));
    return res;
  }, [matches, id]);

  const currentStreak = useMemo(
    () => calculateCurrentStreakForPlayer(matches, id as string),
    [matches, id]
  );

  const shirtDutiesCount = useMemo(
    () => getShirtDutiesByPlayerId(matches).get(id as string) ?? 0,
    [matches, id]
  );

  const mvpCount = useMemo(
    () => getMvpCountsByPlayerId(matches).get(id as string) ?? 0,
    [matches, id]
  );

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="mb-4">Jugador no encontrado.</p>
          <Link href="/players" className="text-primary hover:underline">
            Volver a jugadores
          </Link>
        </div>
      </div>
    );
  }

  const gpm = stats.matches ? (stats.goals / stats.matches).toFixed(1) : "0.0";
  const winRate = stats.matches
    ? ((stats.wins / stats.matches) * 100).toFixed(1)
    : "0.0";
  const baseSkill =
    player.skill === null
      ? 5
      : typeof player.skill === "number"
      ? player.skill
      : 5;
  const catSkills = {
    physical: player.skills?.physical ?? baseSkill,
    technical: player.skills?.technical ?? baseSkill,
    tactical: player.skills?.tactical ?? baseSkill,
    psychological: player.skills?.psychological ?? baseSkill,
  };
  const overallAvg =
    (Number(catSkills.physical) +
      Number(catSkills.technical) +
      Number(catSkills.tactical) +
      Number(catSkills.psychological)) /
    4;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/players"
        className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-gray-700 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Jugadores
      </Link>
      <div className="mb-6 flex gap-5 items-center justify-between">
        <div className="space-y-2 grow">
          <PageTitle spacing={0}>{player.name}</PageTitle>
          <div className="flex flex-col gap-3 text-gray-800">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">General:</span>
                <SkillBadge skill={overallAvg} />
              {player.inactive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                  Inactivo
                </span>
              )}
              </div>
              <span className="text-sm">Posición: {player.position}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <Link href={`/players/edit/${player.id}`} className={buttonClasses()}>
              Editar jugador
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-8 mb-6 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-6">
          <PlayerCard
            name={player.name}
            position={player.position}
            overall={overallAvg}
            photoUrl={player.photoUrl}
            skills={catSkills}
            goalkeeping={getGoalkeeping(player)}
            tournamentPhotoUrl={tournamentPhotoUrl}
          />
          <RadarChart
            labels={['Físico','Técnico','Táctico','Mental']}
            values={[Number(catSkills.physical), Number(catSkills.technical), Number(catSkills.tactical), Number(catSkills.psychological)]}
            baseline={5}
            width={250}
            height={180}
            labelSize={11}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:auto-rows-fr">
          <div className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-gray-700">Partidos</div>
            <div className="text-2xl font-semibold">{stats.matches}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-gray-700">Goles totales</div>
            <div className="text-2xl font-semibold">{stats.goals}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-gray-700">Goles/Partido</div>
            <div className="text-2xl font-semibold">{gpm}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-gray-700">Rendimiento promedio</div>
            <div className="text-2xl font-semibold">
              {(stats.totalPerformance / (stats.matches || 1)).toFixed(1)}★
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-gray-700">Tasa de victorias</div>
            <div className="text-2xl font-semibold">{winRate}%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-gray-700">Rachas</div>
            <div className="flex items-center justify-center gap-2">
              <StreakBadge
                kind={currentStreak.kind}
                count={currentStreak.count}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-gray-700">Llevo las Camisetas</div>
            <div className="text-2xl font-semibold">{shirtDutiesCount} Veces</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center flex flex-col justify-center">
            <div className="text-sm text-gray-700 flex items-center justify-center gap-1.5">
              <span aria-hidden="true">🏆</span>
              MVP del partido
            </div>
            <div className="text-2xl font-semibold">{mvpCount} Veces</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Partidos recientes</h2>
        </div>
        <div className="p-4">
          {stats.recent.length === 0 ? (
            <div className="text-gray-800">No hay partidos para este jugador aún.</div>
          ) : (
            <div className="grid gap-2">
              {stats.recent.slice(0, 10).map((recentMatch, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center justify-between bg-gray-50 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-white text-xs ${
                        recentMatch.result === "W"
                          ? "bg-green-600"
                          : recentMatch.result === "L"
                          ? "bg-orange-700"
                          : "bg-gray-600"
                      }`}
                    >
                      {recentMatch.result}
                    </span>
                    <span className="text-sm">
                      {new Date(recentMatch.date).toLocaleDateString()}{" "}
                      <span className="ml-2 inline-block bg-secondary text-white text-xs px-2 py-0.5 rounded">
                        {recentMatch.type}
                      </span>
                      {recentMatch.isFriendly && (
                        <span
                          className="ml-1 inline-block bg-green-600 text-white text-xs px-2 py-0.5 rounded"
                          title="Partido amistoso"
                          aria-label="Partido amistoso"
                        >
                          A
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Equipo {recentMatch.team}</span>
                    <span className="font-semibold">{recentMatch.score}</span>
                    <span className="text-sm">
                      {recentMatch.goals}⚽ {recentMatch.performance}★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <VideoClipsSection
          playerId={player.id}
          matches={matches}
          canUpload={canManage || myPlayerId === player.id}
        />
      </div>
    </div>
  );
}
