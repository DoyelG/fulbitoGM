'use client'

import { useEffect, useState, useMemo } from 'react'
import { useMatchStore, Match } from '@/store/useMatchStore'
import { usePlayerStore, Player } from '@/store/usePlayerStore'

type MatchType = "5v5" | "6v6" | "7v7" | "8v8" | "9v9";
const MATCH_TYPES: MatchType[] = ["5v5", "6v6", "7v7", "8v8", "9v9"];

type RecordingPlayer = { id: string; name: string };

export default function HistoryClient({ matches, players }: { matches: Match[], players: Player [] }) {
  const { hydrateMatches, addMatch, deleteMatch } = useMatchStore()
  const { hydratePlayers } = usePlayerStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    hydrateMatches(matches)
    hydratePlayers(players)
  }, [matches, hydrateMatches, hydratePlayers, players])

  if (open) {
    return <RecordModal onClose={() => setOpen(false)} onSave={(m) => {
      addMatch(m)
      setOpen(false)
    }} />
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Historial de partidos</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          Cargar partido
        </button>
      </div>
      <div className="space-y-4 mb-10">
        {matches.length === 0 ? (
          <div className="text-black">No se encontraron partidos.</div>
        ) : (
          matches.slice(0, 10).map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  {m.name && (
                    <div className="text-lg mb-1 font-bold">{m.name}</div>
                  )}
                  <strong>{new Date(m.date).toLocaleDateString()}</strong>
                  <span className="ml-2 inline-block bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">
                    {m.type}
                  </span>
                </div>
                <div className="text-indigo-600 font-bold text-xl">
                  {m.teamAScore} - {m.teamBScore}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 items-start">
                <div className="bg-gray-50 rounded p-3">
                  <h4 className="text-center font-semibold mb-2">Equipo A</h4>
                  {m.teamA.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between border-b last:border-b-0 py-1"
                    >
                      <span>{p.name}</span>
                      <span>
                        {p.goals}⚽ {p.performance}★
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-center font-bold text-black">VS</div>
                <div className="bg-gray-50 rounded p-3">
                  <h4 className="text-center font-semibold mb-2">Equipo B</h4>
                  {m.teamB.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between border-b last:border-b-0 py-1"
                    >
                      <span>{p.name}</span>
                      <span>
                        {p.goals}⚽ {p.performance}★
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right mt-3">
                <button
                  className="text-red-600 hover:text-red-800 text-sm"
                  onClick={() => deleteMatch(m.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RecordModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (m: Omit<Match, "id">) => void;
}) {
  const { players } = usePlayerStore();
  const [matchType, setMatchType] = useState<MatchType>("5v5");
  const playersPerTeam = useMemo(
    () => parseInt(matchType.split("v")[0], 10),
    [matchType]
  );

  const [teamA, setTeamA] = useState<RecordingPlayer[]>([]);
  const [teamB, setTeamB] = useState<RecordingPlayer[]>([]);

  const unassigned = useMemo(() => {
    const ids = new Set([...teamA, ...teamB].map((p) => p.id));
    return players
      .filter((p) => !ids.has(p.id))
      .map((p) => ({ id: p.id, name: p.name }));
  }, [players, teamA, teamB]);

  const [teamAScore, setTeamAScore] = useState<number | "">("");
  const [teamBScore, setTeamBScore] = useState<number | "">("");
  const [matchName, setMatchName] = useState<string>("");

  const [goalsA, setGoalsA] = useState<Record<string, number>>({});
  const [perfA, setPerfA] = useState<Record<string, number>>({});
  const [goalsB, setGoalsB] = useState<Record<string, number>>({});
  const [perfB, setPerfB] = useState<Record<string, number>>({});

  const totalGoalsA = useMemo(
    () => Object.values(goalsA).reduce((s, n) => s + (n || 0), 0),
    [goalsA]
  );
  const totalGoalsB = useMemo(
    () => Object.values(goalsB).reduce((s, n) => s + (n || 0), 0),
    [goalsB]
  );

  const move = (p: RecordingPlayer, target: "unassigned" | "a" | "b") => {
    setTeamA((prev) => prev.filter((x) => x.id !== p.id));
    setTeamB((prev) => prev.filter((x) => x.id !== p.id));
    if (target === "a")
      setTeamA((prev) => (prev.length >= playersPerTeam ? prev : [...prev, p]));
    if (target === "b")
      setTeamB((prev) => (prev.length >= playersPerTeam ? prev : [...prev, p]));
  };

  const onDrop = (
    e: React.DragEvent<HTMLDivElement>,
    target: "unassigned" | "a" | "b"
  ) => {
    const json = e.dataTransfer.getData("application/json");
    if (!json) return;
    const p: RecordingPlayer = JSON.parse(json);
    move(p, target);
  };

  const Draggable = ({ p }: { p: RecordingPlayer }) => (
    <div
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData("application/json", JSON.stringify(p))
      }
      className="bg-white border rounded px-3 py-2 text-center hover:shadow"
      onClick={() => {
        const choice = prompt(
          `Move ${p.name} to:\n1. Unassigned\n2. Team A\n3. Team B\n\nEnter 1, 2, or 3:`
        );
        if (choice === "1") move(p, "unassigned");
        if (choice === "2") move(p, "a");
        if (choice === "3") move(p, "b");
      }}
    >
      {p.name}
    </div>
  );

  const proceedToScoring = () => {
    if (teamA.length !== playersPerTeam) {
      alert(`Team A needs exactly ${playersPerTeam} players.`);
      return;
    }
    if (teamB.length !== playersPerTeam) {
      alert(`Team B needs exactly ${playersPerTeam} players.`);
      return;
    }
  };

  const canSave = (() => {
    const a = typeof teamAScore === "number" ? teamAScore : 0;
    const b = typeof teamBScore === "number" ? teamBScore : 0;
    return (
      a === totalGoalsA &&
      b === totalGoalsB &&
      teamA.length === playersPerTeam &&
      teamB.length === playersPerTeam
    );
  })();

  const handleSave = () => {
    if (!canSave) return;
    const m: Omit<Match, "id"> = {
      date: new Date().toISOString().slice(0, 10),
      type: matchType,
      teamAScore: teamAScore as number,
      teamBScore: teamBScore as number,
      teamA: teamA.map((p) => ({
        id: p.id,
        name: p.name,
        goals: goalsA[p.id] || 0,
        performance: perfA[p.id] || 5,
      })),
      teamB: teamB.map((p) => ({
        id: p.id,
        name: p.name,
        goals: goalsB[p.id] || 0,
        performance: perfB[p.id] || 5,
      })),
      name: matchName.trim() || undefined,
    };
    onSave(m);
    alert("Match recorded successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">Record Match Result</h2>
          <button className="text-black hover:text-black" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="border rounded px-3 py-2 w-full"
              onChange={() => {}}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Match Type</label>
            <select
              value={matchType}
              onChange={(e) => {
                setTeamA([]);
                setTeamB([]);
                setMatchType(e.target.value as MatchType);
              }}
              className="border rounded px-3 py-2 w-full"
            >
              {MATCH_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium mb-1">Match Name</label>
            <input
              type="text"
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <DropCol
            title="Available Players"
            onDrop={(e) => onDrop(e, "unassigned")}
          >
            {unassigned.map((p) => (
              <Draggable key={p.id} p={p} />
            ))}
          </DropCol>
          <DropCol
            title={`Team A (${teamA.length}/${playersPerTeam})`}
            onDrop={(e) => onDrop(e, "a")}
          >
            {teamA.map((p) => (
              <Draggable key={p.id} p={p} />
            ))}
          </DropCol>
          <DropCol
            title={`Team B (${teamB.length}/${playersPerTeam})`}
            onDrop={(e) => onDrop(e, "b")}
          >
            {teamB.map((p) => (
              <Draggable key={p.id} p={p} />
            ))}
          </DropCol>
        </div>

        <div className="flex gap-3 justify-center mb-6">
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={() => {
              setTeamA([]);
              setTeamB([]);
            }}
          >
            Reset Teams
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={proceedToScoring}
          >
            Proceed to Scoring
          </button>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <div className="bg-gray-50 rounded p-3">
            <h4 className="text-center font-semibold mb-2">Team A</h4>
            <input
              type="number"
              min={0}
              placeholder="Team Goals"
              value={teamAScore}
              onChange={(e) =>
                setTeamAScore(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-24 text-center border rounded px-2 py-1 mb-2"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamA.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white border rounded px-3 py-2"
                >
                  <span className="font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={goalsA[p.id] ?? 0}
                      onChange={(e) =>
                        setGoalsA((s) => ({
                          ...s,
                          [p.id]: Number(e.target.value || 0),
                        }))
                      }
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={perfA[p.id] ?? 5}
                      onChange={(e) =>
                        setPerfA((s) => ({
                          ...s,
                          [p.id]: Number(e.target.value || 5),
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
              Total: {totalGoalsA} goals
            </div>
          </div>

          <div className="text-center font-bold text-black">VS</div>

          <div className="bg-gray-50 rounded p-3">
            <h4 className="text-center font-semibold mb-2">Team B</h4>
            <input
              type="number"
              min={0}
              placeholder="Team Goals"
              value={teamBScore}
              onChange={(e) =>
                setTeamBScore(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-24 text-center border rounded px-2 py-1 mb-2"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamB.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-white border rounded px-3 py-2"
                >
                  <span className="font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={goalsB[p.id] ?? 0}
                      onChange={(e) =>
                        setGoalsB((s) => ({
                          ...s,
                          [p.id]: Number(e.target.value || 0),
                        }))
                      }
                      className="w-16 text-center border rounded px-2 py-1"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={perfB[p.id] ?? 5}
                      onChange={(e) =>
                        setPerfB((s) => ({
                          ...s,
                          [p.id]: Number(e.target.value || 5),
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
              Total: {totalGoalsB} goals
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="border px-4 py-2 rounded hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              canSave
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!canSave}
            onClick={handleSave}
          >
            Save Match
          </button>
        </div>
      </div>
    </div>
  );
}

function DropCol({
  title,
  onDrop,
  children,
}: {
  title: string;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="border-2 border-dashed rounded p-3 min-h-48"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <h4 className="text-center font-semibold mb-2">{title}</h4>
      <div className="grid gap-2 max-h-60 overflow-y-auto">{children}</div>
    </div>
  );
}