"use client";

import { useEffect, useMemo, useState } from "react";

import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import type { Match, MatchInput } from "@fulbito/types";
import { useMatchStore } from "@/store/useMatchStore";
import { useVideoClipStore, type NewVideoClipData } from "@/store/useVideoClipStore";
import Modal from "@/components/Modal";
import VideoClipUploadForm from "@/components/videoClips/VideoClipUploadForm";
import VideoClipCarousel from "@/components/videoClips/VideoClipCarousel";
import {
  buildPlayedBeforeSet,
  getEligiblePlayerIds,
  computeLeastAssignedPoolIds,
  getShirtDutiesByPlayerId,
} from "@/lib/shirtDuty";
import {
  onlyFinalMatches,
  buildMatchSchedule,
  parseMatchDate,
  formatMatchHour,
  formatMatchDate,
} from "@fulbito/utils";
import HourField from "@/components/HourField";
import { usePlayerStore } from "@/store/usePlayerStore";
import { DropColumn, DraggableItem } from "@/components/DragAndDrop";
import { Pagination } from "../shared/Pagination";
import { InfiniteScrollSentinel } from "../shared/InfiniteScrollSentinel";
import { usePagination } from "../shared/use-pagination";
import { MatchDescription } from "./matchDescription";
import { Backdrop } from "@/components/Backdrop";
import { FiTrash2 } from "react-icons/fi";

type MatchType = "5v5" | "6v6" | "7v7" | "8v8" | "9v9" | "10v10";
const MATCH_TYPES: MatchType[] = ["5v5", "6v6", "7v7", "8v8", "9v9", "10v10"];

type RecordingPlayer = { id: string; name: string };

export default function HistoryClient() {
  const { isAdmin } = useFirebaseAuth();
  const {
    addMatch,
    updateMatch,
    deleteMatch,
    matches: storeMatches,
    matchesInit,
  } = useMatchStore();
  const { players: storePlayers } = usePlayerStore();
  const [open, setOpen] = useState<
    false | { mode: "create" } | { mode: "edit"; match: Match }
  >(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const addVideoClip = useVideoClipStore((state) => state.addVideoClip);
  const deleteVideoClip = useVideoClipStore((state) => state.deleteVideoClip);
  const videoClips = useVideoClipStore((state) => state.videoClips);
  const videoClipsInit = useVideoClipStore((state) => state.videoClipsInit);
  const initVideoClipsLoad = useVideoClipStore((state) => state.initLoad);
  const [videoUploadMatch, setVideoUploadMatch] = useState<Match | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [viewClipsMatch, setViewClipsMatch] = useState<Match | null>(null);
  const [viewPlaybackClipId, setViewPlaybackClipId] = useState<string | null>(null);
  const [viewDeleteError, setViewDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (videoClipsInit !== "loaded") initVideoClipsLoad();
  }, [videoClipsInit, initVideoClipsLoad]);

  const viewClips = useMemo(
    () => (viewClipsMatch ? videoClips.filter((c) => c.matchId === viewClipsMatch.id) : []),
    [videoClips, viewClipsMatch],
  );
  const viewMatchById = useMemo(
    () => (viewClipsMatch ? new Map([[viewClipsMatch.id, viewClipsMatch]]) : new Map()),
    [viewClipsMatch],
  );
  const viewPlaybackClip = viewPlaybackClipId
    ? (viewClips.find((c) => c.id === viewPlaybackClipId) ?? null)
    : null;

  const handleViewDelete = async (clipId: string) => {
    if (!window.confirm("¿Eliminar este clip?")) return;
    setViewDeleteError(null);
    try {
      await deleteVideoClip(clipId);
    } catch (err) {
      setViewDeleteError(err instanceof Error ? err.message : "No se pudo eliminar el clip.");
    }
  };

  const selectedMatch = useMemo(
    () => storeMatches.find((match) => match.id === selectedMatchId) ?? null,
    [storeMatches, selectedMatchId],
  )

  const handleVideoUpload = async (data: NewVideoClipData, file: File) => {
    setVideoUploadError(null);
    try {
      await addVideoClip(data, file);
      setVideoUploadMatch(null);
    } catch (err) {
      setVideoUploadError(
        err instanceof Error ? err.message : "No se pudo subir el clip.",
      );
      throw err;
    }
  };

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isLoadingMatches = matchesInit === "idle" || matchesInit === "loading";

  const filteredMatches = storeMatches.filter((match) => {
    const matchDateOnly = parseMatchDate(match).date;
    if (fromDate && matchDateOnly < fromDate) return false;
    if (toDate && matchDateOnly > toDate) return false;
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      const matchesTitle =
        match.name?.toLowerCase().includes(normalizedQuery) ?? false;
      const matchesPlayerName = [...match.teamA, ...match.teamB].some(
        (player) => player.name.toLowerCase().includes(normalizedQuery),
      );
      if (!matchesTitle && !matchesPlayerName) return false;
    }
    return true;
  });

  const {
    items: displayedMatches,
    page,
    totalPages,
    setPage,
    showPagination,
    hasMore,
    sentinelRef,
  } = usePagination(filteredMatches, {
    resetKey: `${fromDate}|${toDate}|${searchQuery}`,
  });

  const handleDelete = (matchId: string) => {
    setShowModal(true);
    setSelectedMatchId(matchId);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMatch(selectedMatchId as string);
    } catch {
      alert("Error al eliminar el partido");
    } finally {
      setShowModal(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Historial de partidos</h1>
        {isAdmin && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setOpen({ mode: "create" })}
          >
            Cargar partido
          </button>
        )}
      </div>
      <div className="mb-4 flex flex-col md:flex-row md:items-end gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por título o jugador..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="border rounded pl-9 pr-3 py-2 w-full"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          {(fromDate || toDate) && (
            <div className="flex items-end">
              <button
                className="border rounded px-3 py-2 hover:bg-gray-50"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4 mb-10">
        {isLoadingMatches ? (
          <div
            className="flex items-center gap-2 text-gray-600"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="animate-spin text-lg leading-none" aria-hidden="true">
              ⚽
            </span>
            Buscando partidos…
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-black">
            No se encontraron partidos que coincidan con la búsqueda.
          </div>
        ) : (
          displayedMatches
            .map((match) => {
              const isDraft = match.status === "draft";
              const { date: matchDay, hour } = parseMatchDate(match);
              return (
                <div
                  key={match.id}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 ${isDraft ? "border-amber-400" : match.isFriendly ? "border-green-400" : "border-indigo-500"}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      {match.name && (
                        <div className="text-lg mb-1 font-bold">{match.name}</div>
                      )}
                      <strong>
                        {formatMatchDate(matchDay)}
                        {hour != null ? ` ${formatMatchHour(hour)}` : ''}
                      </strong>
                      <span className="ml-2 inline-block bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">
                        {match.type}
                      </span>
                      {isDraft && (
                        <span className="ml-2 inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">
                          Borrador
                        </span>
                      )}
                      {match.isFriendly && (
                        <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                          Amistoso
                        </span>
                      )}
                    </div>
                    {!isDraft && (
                      <div className="text-indigo-600 font-bold text-xl">
                        {match.teamAScore} - {match.teamBScore}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 items-start">
                    <div
                      className={`flex-1 min-w-0 ${
                        isDraft
                          ? "bg-gray-50"
                          : match.teamAScore > match.teamBScore
                            ? "bg-green-50"
                            : match.teamAScore < match.teamBScore
                              ? "bg-red-50"
                              : "bg-gray-50"
                      } rounded p-2`}
                    >
                      <h4 className="text-center font-semibold mb-2 text-sm">Equipo A</h4>
                      {match.teamA.map((player: Match["teamA"][number]) => (
                        <div
                          key={player.id}
                          className="flex justify-between items-center border-b last:border-b-0 py-0.5 gap-1"
                        >
                          <span className="text-sm truncate">{player.name}</span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                            {match.goalkeeperIds?.includes(player.id) && (
                              <span aria-label="Arquero" role="img">
                                🧤
                              </span>
                            )}
                            {!isDraft && (
                              <>
                                {match.mvpId === player.id && (
                                  <span aria-label="MVP" role="img">
                                    🏆
                                  </span>
                                )}
                                {player.goals}⚽ {player.performance}★
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div
                      className={`flex-1 min-w-0 ${
                        isDraft
                          ? "bg-gray-50"
                          : match.teamBScore > match.teamAScore
                            ? "bg-green-50"
                            : match.teamBScore < match.teamAScore
                              ? "bg-red-50"
                              : "bg-gray-50"
                      } rounded p-2`}
                    >
                      <h4 className="text-center font-semibold mb-2 text-sm">Equipo B</h4>
                      {match.teamB.map((player: Match["teamB"][number]) => (
                        <div
                          key={player.id}
                          className="flex justify-between items-center border-b last:border-b-0 py-0.5 gap-1"
                        >
                          <span className="text-sm truncate">{player.name}</span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                            {match.goalkeeperIds?.includes(player.id) && (
                              <span aria-label="Arquero" role="img">
                                🧤
                              </span>
                            )}
                            {!isDraft && (
                              <>
                                {match.mvpId === player.id && (
                                  <span aria-label="MVP" role="img">
                                    🏆
                                  </span>
                                )}
                                {player.goals}⚽ {player.performance}★
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={match.description ? "" : "flex py-2"}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      {match.shirtsResponsibleId && (
                        <div className="text-gray-700">
                          🎽 Camisetas:{" "}
                          <span className="font-medium">
                            {storePlayers.find(
                              (player) => player.id === match.shirtsResponsibleId,
                            )?.name ?? "—"}
                          </span>
                        </div>
                      )}
                    </div>
                    {match.description && (
                      <MatchDescription text={match.description}/>
                    )}
                    <div className="flex justify-end gap-3 shrink-0 ml-auto">
                      <button
                        type="button"
                        className="text-sm px-3 py-1 rounded border hover:bg-gray-50 flex items-center gap-1"
                        onClick={() => setViewClipsMatch(match)}
                        aria-label={`Ver clips del partido${match.name ? `: ${match.name}` : ""}`}
                      >
                        <span aria-hidden="true">🎥</span>
                        {videoClips.filter((clip) => clip.matchId === match.id).length > 0 && (
                          <span className="text-xs bg-brand text-white rounded-full px-1.5">
                            {videoClips.filter((clip) => clip.matchId === match.id).length}
                          </span>
                        )}
                      </button>
                      {isAdmin && (
                        <>
                          {isDraft ? (
                            <>
                              <button
                                className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                                onClick={() =>
                                  setOpen({ mode: "edit", match })
                                }
                              >
                                Editar
                              </button>
                              <button
                                className="text-sm px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                                onClick={() =>
                                  setOpen({ mode: "edit", match })
                                }
                              >
                                Completar resultado
                              </button>
                            </>
                          ) : (
                            <button
                              className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
                              onClick={() => setOpen({ mode: "edit", match })}
                            >
                              Editar
                            </button>
                          )}
                          <button
                            className="text-red-600 hover:text-red-800 text-sm"
                            onClick={() => handleDelete(match.id)}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
      {hasMore && (
        <InfiniteScrollSentinel
          sentinelRef={sentinelRef}
          label="Cargando más partidos…"
          className="mb-4"
        />
      )}
      {showPagination && !isLoadingMatches && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          label="Paginación del historial"
          className="mb-10"
        />
      )}

      <Modal 
        title="Confirmar eliminación"
        open={showModal}
        onClose={() => setShowModal(false)}>
          <div className="p-2 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-red-100">
              <FiTrash2 className="text-red-600" size={20} />
            </div>
              <p className="text-gray-600">
                ¿Estás seguro de que querés eliminar al partido: {' '}
                <span className="font-medium text-gray-900">{selectedMatch?.name}</span>?
              </p>
            <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="flex-1 px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              Eliminar
            </button>
          </div>
          </div>
      </Modal>

      {open && <RecordModal
        mode={open.mode}
        initial={open.mode === "edit" ? open.match : undefined}
        onClose={() => setOpen(false)}
        onSave={async (match) => {
          if (open.mode === "edit" && open.match) {
            await updateMatch(open.match.id, match);
          } else {
            await addMatch(match);
          }
        }}
      />}

      <Modal
        open={videoUploadMatch !== null}
        onClose={() => {
          setVideoUploadMatch(null);
          setVideoUploadError(null);
        }}
        title="Subir clip"
      >
        {videoUploadMatch && (
          <VideoClipUploadForm
            matches={[videoUploadMatch]}
            lockedMatchId={videoUploadMatch.id}
            onSubmit={handleVideoUpload}
            onCancel={() => {
              setVideoUploadMatch(null);
              setVideoUploadError(null);
            }}
            error={videoUploadError}
          />
        )}
      </Modal>

      <Modal
        open={viewClipsMatch !== null}
        onClose={() => {
          setViewClipsMatch(null);
          setViewDeleteError(null);
        }}
        title={`Clips${viewClipsMatch?.name ? `: ${viewClipsMatch.name}` : ""}`}
        size="large"
      >
        {isAdmin && viewClipsMatch && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              className="text-sm px-3 py-1.5 rounded bg-brand text-white hover:bg-brand/90"
              onClick={() => {
                setVideoUploadError(null);
                setVideoUploadMatch(viewClipsMatch);
                setViewClipsMatch(null);
              }}
            >
              + Subir clip
            </button>
          </div>
        )}
        {viewDeleteError && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            <span>{viewDeleteError}</span>
            <button
              type="button"
              onClick={() => setViewDeleteError(null)}
              className="ml-3 text-red-800 hover:text-red-950 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
              aria-label="Descartar error"
            >
              ✕
            </button>
          </div>
        )}
        {videoClipsInit === "error" ? (
          <div role="alert" className="text-red-800">
            No se pudieron cargar los clips.
          </div>
        ) : viewClips.length === 0 ? (
          videoClipsInit === "loading" ? (
            <div className="text-gray-800">Cargando clips...</div>
          ) : null
        ) : (
          <VideoClipCarousel
            clips={viewClips}
            matchById={viewMatchById}
            isAdmin={isAdmin}
            onOpen={setViewPlaybackClipId}
            onDelete={handleViewDelete}
          />
        )}
      </Modal>

      <Modal
        open={viewPlaybackClip !== null}
        onClose={() => setViewPlaybackClipId(null)}
        title={viewPlaybackClip?.title || "Clip"}
        size="large"
      >
        {viewPlaybackClip && (
          <video controls autoPlay className="w-full max-h-[75vh] rounded" src={viewPlaybackClip.url}>
            Tu navegador no soporta la reproducción de video.
          </video>
        )}
      </Modal>
    </div>
  );
}

function RecordModal({
  mode = "create",
  initial,
  onClose,
  onSave,
}: {
  mode?: "create" | "edit";
  initial?: Match;
  onClose: () => void;
  onSave: (match: MatchInput) => void;
}) {
  const { players } = usePlayerStore();
  const { matches: allMatches } = useMatchStore();
  const finalMatches = useMemo(
    () => onlyFinalMatches(allMatches),
    [allMatches],
  );
  const playedBefore = useMemo(
    () => buildPlayedBeforeSet(finalMatches),
    [finalMatches],
  );
  const dutiesById = useMemo(
    () => getShirtDutiesByPlayerId(finalMatches),
    [finalMatches],
  );
  const [matchDate, setMatchDate] = useState<string>(
    initial ? parseMatchDate(initial).date : new Date().toISOString().slice(0, 10),
  );
  const [matchHour, setMatchHour] = useState<number | null>(
    initial ? parseMatchDate(initial).hour : null,
  );

  const [matchType, setMatchType] = useState<MatchType>(
    (initial?.type as MatchType) || "5v5",
  );
  const playersPerTeam = useMemo(
    () => parseInt(matchType.split("v")[0], 10),
    [matchType],
  );

  const [isLoading, setIsLoading] = useState(false);
  const isDraft = initial?.status === "draft";

  const [teamA, setTeamA] = useState<RecordingPlayer[]>(
    initial?.teamA?.map((player: Match["teamA"][number]) => ({
      id: player.id,
      name: player.name,
    })) || [],
  );
  const [teamB, setTeamB] = useState<RecordingPlayer[]>(
    initial?.teamB?.map((player: Match["teamB"][number]) => ({
      id: player.id,
      name: player.name,
    })) || [],
  );

  const unassigned = useMemo(() => {
    const ids = new Set([...teamA, ...teamB].map((player) => player.id));
    return players
      .filter((player) => !ids.has(player.id) && !player.inactive)
      .map((player) => ({ id: player.id, name: player.name }));
  }, [players, teamA, teamB]);

  const [teamAScore, setTeamAScore] = useState<number | "">(
    typeof initial?.teamAScore === "number" ? initial.teamAScore : "",
  );
  const [teamBScore, setTeamBScore] = useState<number | "">(
    typeof initial?.teamBScore === "number" ? initial.teamBScore : "",
  );
  const [matchName, setMatchName] = useState<string>(initial?.name || "");
  const [matchDescription, setMatchDescription] = useState<string>(
    initial?.description || "",
  );
  const [isFriendly, setIsFriendly] = useState<boolean>(initial?.isFriendly ?? false);
  const selectedPlayersForDuty = useMemo(() => {
    const all = [...teamA, ...teamB];
    const teamIds = all.map((player) => player.id);
    const consideredIds = getEligiblePlayerIds(teamIds, playedBefore);
    const { poolIds, min } = computeLeastAssignedPoolIds(
      consideredIds,
      dutiesById,
    );
    const pool = all.filter((player) => poolIds.includes(player.id));
    return { pool, min };
  }, [teamA, teamB, dutiesById, playedBefore]);
  const [shirtsResponsibleId, setShirtsResponsibleId] = useState<string | null>(
    initial?.shirtsResponsibleId ?? null,
  );
  const [mvpId, setMvpId] = useState<string | null>(initial?.mvpId ?? null);
  const [goalkeeperIds, setGoalkeeperIds] = useState<string[]>(
    initial?.goalkeeperIds ?? [],
  );
  const MAX_GOALKEEPERS = 2;

  useEffect(() => {
    if (!mvpId) return;
    const inTeams = [...teamA, ...teamB].some((player) => player.id === mvpId);
    if (!inTeams) setMvpId(null);
  }, [teamA, teamB, mvpId]);

  useEffect(() => {
    const ids = new Set([...teamA, ...teamB].map((player) => player.id));
    setGoalkeeperIds((prev) => {
      const next = prev.filter((id) => ids.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [teamA, teamB]);

  const toggleGoalkeeper = (id: string) =>
    setGoalkeeperIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_GOALKEEPERS
          ? prev
          : [...prev, id],
    );

  const [goalsA, setGoalsA] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (initial?.teamA || []).map((player: Match["teamA"][number]) => [
        player.id,
        player.goals,
      ]),
    ),
  );
  const [perfA, setPerfA] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (initial?.teamA || []).map((player: Match["teamA"][number]) => [
        player.id,
        player.performance || 5,
      ]),
    ),
  );
  const [goalsB, setGoalsB] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (initial?.teamB || []).map((player: Match["teamB"][number]) => [
        player.id,
        player.goals,
      ]),
    ),
  );
  const [perfB, setPerfB] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (initial?.teamB || []).map((player: Match["teamB"][number]) => [
        player.id,
        player.performance || 5,
      ]),
    ),
  );

  const totalGoalsA = useMemo(
    () => Object.values(goalsA).reduce((sum, n) => sum + (n || 0), 0),
    [goalsA],
  );
  const totalGoalsB = useMemo(
    () => Object.values(goalsB).reduce((sum, n) => sum + (n || 0), 0),
    [goalsB],
  );

  const move = (player: RecordingPlayer, target: "unassigned" | "a" | "b") => {
    setTeamA((prev) => prev.filter((teamPlayer) => teamPlayer.id !== player.id));
    setTeamB((prev) => prev.filter((teamPlayer) => teamPlayer.id !== player.id));
    if (target === "a")
      setTeamA((prev) =>
        prev.length >= playersPerTeam ? prev : [...prev, player],
      );
    if (target === "b")
      setTeamB((prev) =>
        prev.length >= playersPerTeam ? prev : [...prev, player],
      );
  };

  const onDrop = (
    event: React.DragEvent<HTMLDivElement>,
    target: "unassigned" | "a" | "b",
  ) => {
    const json = event.dataTransfer.getData("application/json");
    if (!json) return;
    const player: RecordingPlayer = JSON.parse(json);
    move(player, target);
  };

  const Draggable = ({ player }: { player: RecordingPlayer }) => (
    <DraggableItem
      data={player}
      label={player.name}
      onClick={() => {
        const choice = prompt(
          `Move ${player.name} to:\n1. Unassigned\n2. Team A\n3. Team B\n\nEnter 1, 2, or 3:`,
        );
        if (choice === "1") move(player, "unassigned");
        if (choice === "2") move(player, "a");
        if (choice === "3") move(player, "b");
      }}
    />
  );

  const teamsComplete =
    teamA.length === playersPerTeam && teamB.length === playersPerTeam;
  const canConfirm =
    (typeof teamAScore === "number" ? teamAScore : 0) === totalGoalsA &&
    (typeof teamBScore === "number" ? teamBScore : 0) === totalGoalsB &&
    teamsComplete;
  const canUpdateDraft = teamsComplete;

  const buildPayload = (status: "draft" | "final"): MatchInput => {
    const isFinal = status === "final";
    const pool = selectedPlayersForDuty.pool;
    const chosen =
      shirtsResponsibleId ||
      (pool.length
        ? pool[Math.floor(Math.random() * pool.length)].id
        : undefined);

    return {
      ...buildMatchSchedule(matchDate, matchHour),
      type: matchType,
      status,
      teamAScore: isFinal ? (teamAScore as number) : 0,
      teamBScore: isFinal ? (teamBScore as number) : 0,
      teamA: teamA.map((player) => ({
        id: player.id,
        name: player.name,
        goals: isFinal ? goalsA[player.id] || 0 : 0,
        performance: isFinal ? perfA[player.id] || 5 : 0,
      })),
      teamB: teamB.map((player) => ({
        id: player.id,
        name: player.name,
        goals: isFinal ? goalsB[player.id] || 0 : 0,
        performance: isFinal ? perfB[player.id] || 5 : 0,
      })),
      name: matchName.trim() || undefined,
      description: matchDescription.trim() || undefined,
      shirtsResponsibleId: chosen ?? null,
      mvpId: isFinal ? mvpId : null,
      goalkeeperIds,
      isFriendly,
    };
  };

  const handleSave = async (targetStatus: "draft" | "final") => {
    if (targetStatus === "final" && !canConfirm) return;
    if (targetStatus === "draft" && !canUpdateDraft) return;

    setIsLoading(true);

    try {
      await onSave(buildPayload(targetStatus));

      alert(
        targetStatus === "final"
          ? "Partido guardado correctamente!"
          : "Borrador actualizado!",
      );
      onClose();
    } catch {
      alert("Error al guardar el partido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Backdrop onClose={onClose} title='Registrar Resultado del Partido'>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">
            Registrar Resultado del Partido
          </h2>
          <button className="text-black hover:text-black" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid sm:grid-cols-[auto_1fr_1fr_auto] gap-3 mb-3">
          <HourField id="match-hour" value={matchHour} onChange={setMatchHour} />
          <div>
            <label htmlFor="match-date" className="block text-sm font-medium mb-1">Fecha</label>
            <input
              id="match-date"
              type="date"
              value={matchDate}
              onChange={(event) => setMatchDate(event.target.value)}
              className="h-10 border rounded px-3 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Modo de Partido
            </label>
            <select
              value={matchType}
              onChange={(event) => {
                setTeamA([]);
                setTeamB([]);
                setMatchType(event.target.value as MatchType);
              }}
              className="h-10 border rounded px-3 w-full"
            >
              {MATCH_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fiendly-match" className="block text-sm font-medium mb-1">
              Tipo de partido
            </label>
            <button
              id="fiendly-match"
              type="button"
              role="switch"
              aria-checked={isFriendly}
              aria-label="Partido amistoso"
              onClick={() => setIsFriendly((current) => !current)}
              className={`relative inline-flex h-10 w-28 shrink-0 items-center overflow-hidden rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${
                isFriendly ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-brand to-accent"
              }`}
            >
              <span
                className={`absolute left-9 whitespace-nowrap text-xs font-semibold text-white transition-transform duration-[600ms] ease-in-out ${
                  isFriendly ? "translate-x-[76px]" : "translate-x-0"
                }`}
              >
                Competitivo
              </span>

              <span
                className={`absolute -left-[60px] whitespace-nowrap text-xs font-semibold text-white transition-transform duration-[600ms] ease-in-out ${
                  isFriendly ? "translate-x-[76px]" : "translate-x-0"
                }`}
              >
                Amistoso
              </span>

              <span
                className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-[600ms] ease-in-out ${
                  isFriendly ? "translate-x-[76px]" : "translate-x-0"
                }`}
              >
                <span className="text-md">{isFriendly ? "🤝" : "⚔️"}</span>
              </span>
            </button>
          </div>
          <div className="sm:col-span-3">
            <label className="block text-lg font-medium mb-1">
              Nombre del Partido
            </label>
            <input
              type="text"
              value={matchName}
              onChange={(event) => setMatchName(event.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <DropColumn
            title="Jugadores Disponibles"
            onDrop={(event) => onDrop(event, "unassigned")}
          >
            {unassigned.map((player) => (
              <Draggable key={player.id} player={player} />
            ))}
          </DropColumn>
          <DropColumn
            title={`Equipo A (${teamA.length}/${playersPerTeam})`}
            onDrop={(event) => onDrop(event, "a")}
          >
            {teamA.map((player) => (
              <Draggable key={player.id} player={player} />
            ))}
          </DropColumn>
          <DropColumn
            title={`Equipo B (${teamB.length}/${playersPerTeam})`}
            onDrop={(event) => onDrop(event, "b")}
          >
            {teamB.map((player) => (
              <Draggable key={player.id} player={player} />
            ))}
          </DropColumn>
        </div>

        <div className="mb-4">
          <label htmlFor="match-description-history" className="block text-sm font-medium mb-1">
            Crónica
          </label>
          <textarea
            id="match-description-history"
            value={matchDescription}
            onChange={(event) => setMatchDescription(event.target.value)}
            placeholder="Escribí la crónica del partido"
            className="border min-w-full rounded px-3 py-2 w-full"
          />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <div className="bg-gray-50 rounded p-3">
            <h4 className="text-center font-semibold mb-2">Equipo A</h4>
            <input
              type="number"
              min={0}
              placeholder="Goles del Equipo A"
              value={teamAScore}
              onChange={(event) =>
                setTeamAScore(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              className="w-24 text-center border rounded px-2 py-1 mb-2"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamA.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-white border rounded px-3 py-2"
                >
                  <span className="font-medium">{player.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={goalsA[player.id] ?? 0}
                      onChange={(event) =>
                        setGoalsA((prev) => ({
                          ...prev,
                          [player.id]: Number(event.target.value || 0),
                        }))
                      }
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={perfA[player.id] ?? 5}
                      onChange={(event) =>
                        setPerfA((prev) => ({
                          ...prev,
                          [player.id]: Number(event.target.value || 5),
                        }))
                      }
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`mt-2 text-center font-semibold rounded px-2 py-1 ${
                teamAScore === totalGoalsA
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Total: {totalGoalsA} goles
            </div>
          </div>

          <div className="text-center font-bold text-black">VS</div>

          <div className="bg-gray-50 rounded p-3">
            <h4 className="text-center font-semibold mb-2">Equipo B</h4>
            <input
              type="number"
              min={0}
              placeholder="Goles del Equipo B"
              value={teamBScore}
              onChange={(event) =>
                setTeamBScore(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              className="w-24 text-center border rounded px-2 py-1 mb-2"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamB.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-white border rounded px-3 py-2"
                >
                  <span className="font-medium">{player.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={goalsB[player.id] ?? 0}
                      onChange={(event) =>
                        setGoalsB((prev) => ({
                          ...prev,
                          [player.id]: Number(event.target.value || 0),
                        }))
                      }
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={perfB[player.id] ?? 5}
                      onChange={(event) =>
                        setPerfB((prev) => ({
                          ...prev,
                          [player.id]: Number(event.target.value || 5),
                        }))
                      }
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`mt-2 text-center font-semibold rounded px-2 py-1 ${
                teamBScore === totalGoalsB
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Total: {totalGoalsB} goles
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">Encargado de camisetas</div>
              <div className="text-gray-800">
                {(() => {
                  const name = shirtsResponsibleId
                    ? (players.find((player) => player.id === shirtsResponsibleId)
                        ?.name ?? "—")
                    : "Seleccione un jugador";
                  return name;
                })()}
              </div>
            </div>
            <div className="flex-1">
              <select
                className="border rounded px-3 py-2 w-full"
                value={shirtsResponsibleId ?? ""}
                onChange={(event) => setShirtsResponsibleId(event.target.value || null)}
              >
                <option disabled={!!shirtsResponsibleId} value="">
                  Seleccione un Jugador
                </option>
                {(() => {
                  const current = [...teamA, ...teamB];
                  const eligibleExists = current.some((pp) =>
                    playedBefore.has(pp.id),
                  );
                  return current.map((player) => (
                    <option
                      key={player.id}
                      value={player.id}
                      disabled={eligibleExists && !playedBefore.has(player.id)}
                    >
                      {player.name} (#{dutiesById.get(player.id) ?? 0})
                      {eligibleExists && !playedBefore.has(player.id)
                        ? " — nuevo"
                        : ""}
                    </option>
                  ));
                })()}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold flex items-center gap-1.5">
                <span aria-hidden="true">🏆</span>
                MVP del partido
              </div>
              <div className="text-gray-800">
                {mvpId
                  ? (players.find((player) => player.id === mvpId)?.name ?? "—")
                  : "Opcional — elegí al jugador del partido"}
              </div>
            </div>
            <div className="flex-1">
              <select
                className="border rounded px-3 py-2 w-full bg-white"
                value={mvpId ?? ""}
                onChange={(event) => setMvpId(event.target.value || null)}
              >
                <option value="">Sin MVP</option>
                {(() => {
                  const current = [...teamA, ...teamB];
                  const topPerfId = (() => {
                    const all = [
                      ...current.map((player) => ({
                        id: player.id,
                        perf: perfA[player.id] ?? perfB[player.id] ?? 0,
                      })),
                    ];
                    return all.sort((statA, statB) => statB.perf - statA.perf)[0]?.id;
                  })();
                  return current.map((player) => {
                    const perf = perfA[player.id] ?? perfB[player.id] ?? 0;
                    const goals = goalsA[player.id] ?? goalsB[player.id] ?? 0;
                    const isSuggested = player.id === topPerfId && perf > 0;
                    return (
                      <option key={player.id} value={player.id}>
                        {player.name} — ⚽ {goals} · ★ {perf}
                        {isSuggested ? " · sugerido" : ""}
                      </option>
                    );
                  });
                })()}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-purple-50 border border-purple-200 rounded p-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-sm">
              <div className="font-semibold flex items-center gap-1.5">
                <span aria-hidden="true">🧤</span>
                Arqueros
              </div>
              <div className="text-gray-800">
                Marcá quién atajó (máximo {MAX_GOALKEEPERS})
              </div>
            </div>
            <span className="text-sm px-2 py-0.5 rounded bg-purple-100 text-purple-800 shrink-0">
              {goalkeeperIds.length} / {MAX_GOALKEEPERS}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...teamA, ...teamB].length === 0 ? (
              <span className="text-sm text-gray-600">
                Asigná jugadores a los equipos para elegir arqueros.
              </span>
            ) : (
              [...teamA, ...teamB].map((player) => {
                const active = goalkeeperIds.includes(player.id);
                const disabled =
                  !active && goalkeeperIds.length >= MAX_GOALKEEPERS;
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => toggleGoalkeeper(player.id)}
                    disabled={disabled}
                    aria-pressed={active}
                    className={`text-sm px-3 py-1 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      active
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    🧤 {player.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="border px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          {isDraft && (
            <button
              className={`px-4 py-2 rounded text-white ${
                canUpdateDraft
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!canUpdateDraft || isLoading}
              onClick={() => handleSave("draft")}
            >
              {isLoading ? "Actualizando..." : "Actualizar borrador"}
            </button>
          )}
          <button
            className={`px-4 py-2 rounded text-white ${
              canConfirm
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!canConfirm || isLoading}
            onClick={() => handleSave("final")}
          >
            {isLoading
              ? isDraft
                ? "Confirmando..."
                : mode === "edit"
                  ? "Actualizando..."
                  : "Guardando..."
              : isDraft
                ? "Confirmar partido"
                : mode === "edit"
                  ? "Actualizar Partido"
                  : "Guardar Partido"}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

