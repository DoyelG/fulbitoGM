"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useMatchStore } from "@/store/useMatchStore";
import SkillBadge from "@/components/SkillBadge";
import StreakBadge from "@/components/StreakBadge";
import RadarChart from '@/components/RadarChart'
import { calculateCurrentStreakForPlayer } from "@/lib/playerStats";

export default function PlayerDetailPage() {
  const { id } = useParams();
  const { getPlayer, updatePlayer } = usePlayerStore();
  const { matches } = useMatchStore();

  const player = getPlayer(id as string);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    position: "PLAYER",
    physical: "5",
    technical: "5",
    tactical: "5",
    psychological: "5",
  });

  useEffect(() => {
    if (player) {
      const base =
        player.skill === "unknown"
          ? 5
          : typeof player.skill === "number"
          ? player.skill
          : 5;
      setForm({
        name: player.name,
        position: player.position,
        physical: String(player.skills?.physical ?? base),
        technical: String(player.skills?.technical ?? base),
        tactical: String(player.skills?.tactical ?? base),
        psychological: String(player.skills?.psychological ?? base),
      });
    }
  }, [player]);

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
      }>,
    };

    for (const m of matches) {
      const inA = m.teamA.find((p) => p.id === id);
      const inB = m.teamB.find((p) => p.id === id);
      if (!inA && !inB) continue;

      const me = inA || inB;
      const team = inA ? ("A" as const) : ("B" as const);
      const a = m.teamAScore,
        b = m.teamBScore;
      res.matches++;
      res.goals += me!.goals;
      res.totalPerformance += me!.performance;
      if (team === "A") {
        if (a > b) res.wins++;
        else if (a < b) res.losses++;
        else res.draws++;
      } else {
        if (b > a) res.wins++;
        else if (b < a) res.losses++;
        else res.draws++;
      }
      res.recent.push({
        date: m.date,
        type: m.type,
        team,
        goals: me!.goals,
        performance: me!.performance,
        score: `${a} - ${b}`,
        result: (team === "A"
          ? a > b
            ? "W"
            : a < b
            ? "L"
            : "D"
          : b > a
          ? "W"
          : b < a
          ? "L"
          : "D") as "W" | "L" | "D",
      });
    }

    res.recent.sort((x, y) => (y.date > x.date ? 1 : -1));
    return res;
  }, [matches, id]);

  const currentStreak = useMemo(
    () => calculateCurrentStreakForPlayer(matches, id as string),
    [matches, id]
  );
  const winGoalProgress =
    currentStreak.kind === "win" ? currentStreak.count : 0;

  if (!player) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="mb-4">Player not found.</p>
          <Link href="/players" className="text-brand hover:underline">
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = {
      physical: parseInt(form.physical, 10),
      technical: parseInt(form.technical, 10),
      tactical: parseInt(form.tactical, 10),
      psychological: parseInt(form.psychological, 10),
    };
    const avg =
      (skills.physical +
        skills.technical +
        skills.tactical +
        skills.psychological) /
      4;
    updatePlayer(player.id, {
      name: form.name.trim(),
      position: form.position,
      skills,
      skill: avg,
    });
    setEditMode(false);
  };

  const gpm = stats.matches ? (stats.goals / stats.matches).toFixed(1) : "0.0";
  const winRate = stats.matches
    ? ((stats.wins / stats.matches) * 100).toFixed(1)
    : "0.0";
  const baseSkill =
    player.skill === "unknown"
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
  const avgPreview =
    (+form.physical + +form.technical + +form.tactical + +form.psychological) /
    4;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex gap-5 items-center justify-between">
        <div className="space-y-2 grow">
          <h1 className="text-3xl font-bold">{player.name}</h1>
          <div className="flex flex-col gap-3 text-gray-800">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Overall:</span>
                <SkillBadge skill={overallAvg} />
              </div>
              <span className="text-sm">Position: {player.position}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/players"
            className="px-3 py-2 rounded border hover:bg-gray-50"
          >
            Back
          </Link>
          {!editMode ? (
            <>
              <Link
                href={`/players/edit/${player.id}`}
                className="px-3 py-2 rounded border hover:bg-gray-50"
              >
                Open Edit
              </Link>
              <button
                className="px-3 py-2 rounded bg-brand text-white hover:bg-brand/90"
                onClick={() => setEditMode(true)}
              >
                Quick Edit
              </button>
            </>
          ) : (
            <button
              className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Skills</h2>
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-700">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(270deg 78% 42%)' }} />
              Player
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'hsl(24deg 85% 48%)' }} />
              Baseline
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Physical</span>
              <SkillBadge skill={catSkills.physical} />
            </li>
            <li className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Technical</span>
              <SkillBadge skill={catSkills.technical} />
            </li>
            <li className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Tactical</span>
              <SkillBadge skill={catSkills.tactical} />
            </li>
            <li className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Mental</span>
              <SkillBadge skill={catSkills.psychological} />
            </li>
          </ul>

          <div className="flex justify-center">
            <RadarChart
              labels={['Physical','Technical','Tactical','Mental']}
              values={[Number(catSkills.physical), Number(catSkills.technical), Number(catSkills.tactical), Number(catSkills.psychological)]}
              baseline={5}
              width={250}
              height={180}
              labelSize={11}
              className="mx-auto"
            />
          </div>
        </div>
      </div>

      {editMode && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-lg shadow p-4 mb-6 grid sm:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:border-brand focus:ring-brand"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Physical</label>
            <select
              value={form.physical}
              onChange={(e) => setForm({ ...form, physical: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:border-brand focus:ring-brand"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Technical</label>
            <select
              value={form.technical}
              onChange={(e) => setForm({ ...form, technical: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:border-brand focus:ring-brand"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tactical</label>
            <select
              value={form.tactical}
              onChange={(e) => setForm({ ...form, tactical: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:border-brand focus:ring-brand"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Mental
            </label>
            <select
              value={form.psychological}
              onChange={(e) =>
                setForm({ ...form, psychological: e.target.value })
              }
              className="w-full border rounded px-3 py-2 focus:border-brand focus:ring-brand"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3 text-sm text-gray-800">
            Overall (avg):{" "}
            <span className="font-semibold">Lv {avgPreview}</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:border-brand focus:ring-brand"
            >
              <option value="GK">Goalkeeper</option>
              <option value="DEF">Defender</option>
              <option value="MID">Midfielder</option>
              <option value="FWD">Forward</option>
              <option value="PLAYER">Player (Any)</option>
            </select>
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-brand text-white hover:bg-brand/90"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-700">Matches</div>
          <div className="text-2xl font-semibold">{stats.matches}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-700">Total Goals</div>
          <div className="text-2xl font-semibold">{stats.goals}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-700">Goals/Match</div>
          <div className="text-2xl font-semibold">{gpm}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-700">Avg Performance</div>
          <div className="text-2xl font-semibold">
            {(stats.totalPerformance / (stats.matches || 1)).toFixed(1)}★
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-700">Win Rate</div>
          <div className="text-2xl font-semibold">{winRate}%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-700">Streaks</div>
          <div className="flex items-center justify-center gap-2">
            <StreakBadge
              kind={currentStreak.kind}
              count={currentStreak.count}
            />
          </div>
        </div>
      </div>

      {/* Recent matches card remains the same */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Recent Matches</h2>
        </div>
        <div className="p-4">
          {stats.recent.length === 0 ? (
            <div className="text-gray-800">No matches for this player yet.</div>
          ) : (
            <div className="grid gap-2">
              {stats.recent.slice(0, 10).map((rm, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center justify-between bg-gray-50 rounded px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-white text-xs ${
                        rm.result === "W"
                          ? "bg-green-600"
                          : rm.result === "L"
                          ? "bg-red-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {rm.result}
                    </span>
                    <span className="text-sm">
                      {new Date(rm.date).toLocaleDateString()}{" "}
                      <span className="ml-2 inline-block bg-accent text-white text-xs px-2 py-0.5 rounded">
                        {rm.type}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Team {rm.team}</span>
                    <span className="font-semibold">{rm.score}</span>
                    <span className="text-sm">
                      {rm.goals}⚽ {rm.performance}★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
