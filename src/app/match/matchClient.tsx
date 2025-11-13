'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePlayerStore , Player} from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'
import { buildPlayedBeforeSet, getEligiblePlayerIds, computeLeastAssignedPoolIds } from '@/lib/shirtDuty'
import { balanceRemainingPlayers, balanceTeams, PlayerInfo, TeamResult } from '@/lib/teamUtils'
import { DropColumn, DraggableItem } from '@/components/DragAndDrop'

type MatchType = '5v5' | '6v6' | '7v7' | '8v8' | '9v9'
const MATCH_TYPES: MatchType[] = ['5v5', '6v6', '7v7', '8v8', '9v9']

export default function MatchClient({ players }: { players: Player[] }) {
  const { hydratePlayers } = usePlayerStore()
  const { matches: allMatches, initLoad: initMatchesLoad } = useMatchStore()
  const [matchType, setMatchType] = useState<MatchType>('5v5')
  const playersPerTeam = useMemo(() => parseInt(matchType.split('v')[0], 10), [matchType])
  const requiredPlayers = playersPerTeam * 2

  // hydrate on mount after commit to avoid setState during render
  useEffect(() => {
    hydratePlayers(players)
    initMatchesLoad()
  }, [players, hydratePlayers, initMatchesLoad])

  const [selectionOpen, setSelectionOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [autoTeams, setAutoTeams] = useState<{ teamA: TeamResult, teamB: TeamResult } | null>(null)
  const [shirtsResponsibleId, setShirtsResponsibleId] = useState<string | null>(null)
  const [dutyPool, setDutyPool] = useState<PlayerInfo[]>([])

  // manual builder
  const [manualOpen, setManualOpen] = useState(false)
  const [manualA, setManualA] = useState<PlayerInfo[]>([])
  const [manualB, setManualB] = useState<PlayerInfo[]>([])

  // search in player selection
  const [playerQuery, setPlayerQuery] = useState('')

  const playedBefore = useMemo(() => buildPlayedBeforeSet(allMatches), [allMatches])

  const selectedPlayers: PlayerInfo[] = useMemo(() => {
    const ids = new Set(selected)
    return players
      .filter(p => ids.has(p.id))
      .map(p => ({ id: p.id, name: p.name, skill: (p.skill ?? 'unknown') as number | 'unknown', position: p.position }))
  }, [players, selected])

  const unassignedManual = useMemo(() => {
    const ids = new Set([...manualA, ...manualB].map(p => p.id))
    return selectedPlayers.filter(p => !ids.has(p.id))
  }, [selectedPlayers, manualA, manualB])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  const openSelection = () => {
    if (players.length < requiredPlayers) {
      alert(`Necesitas al menos ${requiredPlayers} jugadores para ${matchType}. Actualmente tienes ${players.length}.`)
      return
    }
    setSelected(new Set())
    setAutoTeams(null)
    setManualOpen(false)
    setSelectionOpen(true)
  }

  const doAuto = async () => {
    await initMatchesLoad()
    if (selected.size !== requiredPlayers) {
      alert(`Por favor, selecciona exactamente ${requiredPlayers} jugadores para ${matchType}.`)
      return
    }
    const teams = balanceTeams(selectedPlayers, playersPerTeam)
    setAutoTeams(teams)
    const teamIds = [...teams.teamA.players, ...teams.teamB.players].map(p => p.id)
    const consideredIds = getEligiblePlayerIds(teamIds, playedBefore)
    const { poolIds } = computeLeastAssignedPoolIds(consideredIds, players)
    const poolObjs = [...teams.teamA.players, ...teams.teamB.players].filter(p => poolIds.includes(p.id))
    setDutyPool(poolObjs)
    setShirtsResponsibleId(poolIds.length ? poolIds[Math.floor(Math.random() * poolIds.length)] : null)
    setManualOpen(false)
  }

  const regenerate = async () => {
    await initMatchesLoad()
    if (!selectedPlayers.length) return
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5)
    const teams = balanceTeams(shuffled, playersPerTeam)
    setAutoTeams(teams)
    const teamIds = [...teams.teamA.players, ...teams.teamB.players].map(p => p.id)
    const consideredIds = getEligiblePlayerIds(teamIds, playedBefore)
    const { poolIds } = computeLeastAssignedPoolIds(consideredIds, players)
    const poolObjs = [...teams.teamA.players, ...teams.teamB.players].filter(p => poolIds.includes(p.id))
    setDutyPool(poolObjs)
    setShirtsResponsibleId(poolIds.length ? poolIds[Math.floor(Math.random() * poolIds.length)] : null)
  }

  const finishManual = async () => {
    await initMatchesLoad()
    const assigned = [...manualA, ...manualB]
    const unassigned = selectedPlayers.filter(p => !assigned.some(a => a.id === p.id))
    if (unassigned.length === 0) {
      if (manualA.length !== playersPerTeam || manualB.length !== playersPerTeam) {
        alert(`Each team needs exactly ${playersPerTeam} players.`)
        return
      }
      const sum = (t: PlayerInfo[]) => t.reduce((s, p) => s + (p.skill === 'unknown' ? 5 : p.skill), 0)
      const teams = {
        teamA: { players: manualA, totalSkill: sum(manualA) },
        teamB: { players: manualB, totalSkill: sum(manualB) }
      }
      setAutoTeams(teams)
      const teamIds = [...teams.teamA.players, ...teams.teamB.players].map(p => p.id)
      const consideredIds = getEligiblePlayerIds(teamIds, playedBefore)
      const { poolIds } = computeLeastAssignedPoolIds(consideredIds, players)
      const poolObjs = [...teams.teamA.players, ...teams.teamB.players].filter(p => poolIds.includes(p.id))
      setDutyPool(poolObjs)
      setShirtsResponsibleId(poolIds.length ? poolIds[Math.floor(Math.random() * poolIds.length)] : null)
    } else {
      const teams = balanceRemainingPlayers(unassigned, manualA, manualB, playersPerTeam)
      setAutoTeams(teams)
      const teamIds = [...teams.teamA.players, ...teams.teamB.players].map(p => p.id)
      const consideredIds = getEligiblePlayerIds(teamIds, playedBefore)
      const { poolIds } = computeLeastAssignedPoolIds(consideredIds, players)
      const poolObjs = [...teams.teamA.players, ...teams.teamB.players].filter(p => poolIds.includes(p.id))
      setDutyPool(poolObjs)
      setShirtsResponsibleId(poolIds.length ? poolIds[Math.floor(Math.random() * poolIds.length)] : null)
    }
    setManualOpen(false)
  }

  const moveManual = (player: PlayerInfo, target: 'unassigned' | 'a' | 'b') => {
    setManualA(prev => prev.filter(p => p.id !== player.id))
    setManualB(prev => prev.filter(p => p.id !== player.id))
    if (target === 'a') {
      setManualA(prev => (prev.length >= playersPerTeam ? prev : [...prev, player]))
    } else if (target === 'b') {
      setManualB(prev => (prev.length >= playersPerTeam ? prev : [...prev, player]))
    }
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>, target: 'unassigned' | 'a' | 'b') => {
    const json = e.dataTransfer.getData('application/json')
    if (!json) return
    const p: PlayerInfo = JSON.parse(json)
    moveManual(p, target)
  }

  const Draggable = ({ p }: { p: PlayerInfo }) => (
    <DraggableItem data={p} label={p.name} />
  )

  const totalSkillA = autoTeams?.teamA.totalSkill ?? 0
  const totalSkillB = autoTeams?.teamB.totalSkill ?? 0
  const combinedSkill = totalSkillA + totalSkillB
  const probA = combinedSkill > 0 ? Math.round((totalSkillA / combinedSkill) * 100) : 50
  const probB = combinedSkill > 0 ? 100 - probA : 50

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Preparar partido</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="font-medium">Tipo de partido</label>
          <select
            value={matchType}
            onChange={e => setMatchType(e.target.value as MatchType)}
            className="border rounded px-4 py-1 text-center appearance-none cursor-pointer"
          >
            {MATCH_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={openSelection}
          >
            Seleccionar jugadores
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-800">
          {(() => {
            const selectedCount = selected.size
            const missing = Math.max(0, requiredPlayers - selectedCount)
            return (
              <span>
                Seleccionados: <span className="font-semibold">{selectedCount}</span> / {requiredPlayers}
                <span className={`ml-3 px-2 py-0.5 rounded ${missing === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  Faltan: {missing}
                </span>
              </span>
            )
          })()}
        </div>
      </div>

      {selectionOpen && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-xl font-semibold mb-4">Seleccionar jugadores</h3>
          <div className="mb-2 text-sm text-gray-800">
            {(() => {
              const selectedCount = selected.size
              const missing = Math.max(0, requiredPlayers - selectedCount)
              return (
                <span>
                  Seleccionados: <span className="font-semibold">{selectedCount}</span> / {requiredPlayers}
                  <span className={`ml-3 px-2 py-0.5 rounded ${missing === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    Faltan: {missing}
                  </span>
                </span>
              )
            })()}
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={playerQuery}
              onChange={e => setPlayerQuery(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              placeholder="Buscar jugadores por nombre..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {players
              .filter(p => {
                const q = playerQuery.trim().toLowerCase()
                if (!q) return true
                return p.name.toLowerCase().includes(q)
              })
              .map(p => (
              <label key={p.id} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                />
                <span className="font-medium">{p.name}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 justify-center mt-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={doAuto}>
              🎲 Auto-Generar equipos balanceados
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setManualOpen(true)}>
              ⚽ Manual Team Setup
            </button>
          </div>
        </div>
      )}

      {manualOpen && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-xl font-semibold mb-2">Configuración manual de equipos</h3>
          <p className="text-black mb-4">Arrastre jugadores para asignarlos a equipos, luego generar jugadores restantes.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DropColumn title="Jugadores disponibles" onDrop={e => onDrop(e, 'unassigned')}>
              {unassignedManual.map(p => <Draggable key={p.id} p={p} />)}
            </DropColumn>
            <DropColumn title={`Equipo A (${manualA.length}/${playersPerTeam})`} onDrop={e => onDrop(e, 'a')}>
              {manualA.map(p => <Draggable key={p.id} p={p} />)}
            </DropColumn>
            <DropColumn title={`Equipo B (${manualB.length}/${playersPerTeam})`} onDrop={e => onDrop(e, 'b')}>
              {manualB.map(p => <Draggable key={p.id} p={p} />)}
            </DropColumn>
          </div>
          <div className="flex gap-3 justify-center mt-4">
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700" onClick={() => { setManualA([]); setManualB([]) }}>
              Reiniciar
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={finishManual}>
              Generar jugadores restantes
            </button>
          </div>
        </div>
      )}

      {autoTeams && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-3 justify-center mb-4">
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700" onClick={() => setManualOpen(true)}>
              Configuración manual de equipos
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={regenerate}>
              🔄 Re-generar equipos
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <TeamCard title="Team A" team={autoTeams.teamA} color="blue" winProbability={probA} />
            <TeamCard title="Team B" team={autoTeams.teamB} color="red" winProbability={probB} />
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="text-sm">
                <div className="font-semibold">Encargado de camisetas</div>
                <div className="text-black">
                  {shirtsResponsibleId
                    ? (players.find(p => p.id === shirtsResponsibleId)?.name ?? '—')
                    : (dutyPool.length
                      ? `${players.find(p => p.id === dutyPool[0].id)?.name ?? '—'} (entre ${dutyPool.length} con menos asignaciones)`
                      : 'Seleccione jugadores y genere equipos')}
                </div>
              </div>
              <div className="flex-1">
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={shirtsResponsibleId ?? ''}
                  onChange={(e) => setShirtsResponsibleId(e.target.value || null)}
                >
                  <option value="">(aleatorio entre elegibles con menos asignaciones)</option>
                  {(() => {
                    const current = [...(autoTeams.teamA.players), ...(autoTeams.teamB.players)]
                    const played = new Set<string>()
                    for (const m of allMatches) {
                      for (const p of m.teamA) played.add(p.id)
                      for (const p of m.teamB) played.add(p.id)
                    }
                    const eligibleExists = current.some(p => played.has(p.id))
                    return current.map(p => (
                      <option key={p.id} value={p.id} disabled={eligibleExists && !played.has(p.id)}>
                        {p.name} (#{(players.find(pp => pp.id === p.id)?.shirtDutiesCount ?? 0)}){eligibleExists && !played.has(p.id) ? ' — nuevo' : ''}
                      </option>
                    ))
                  })()}
                </select>
              </div>
              <div>
                <button
                  className="border rounded px-3 py-2 hover:bg-gray-50"
                  onClick={() => {
                    if (!dutyPool.length) return
                    setShirtsResponsibleId(dutyPool[Math.floor(Math.random() * dutyPool.length)].id)
                  }}
                >
                  🎲 Elegir aleatorio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TeamCard({ title, team, color, winProbability }: { title: string, team: TeamResult, color: 'blue' | 'red', winProbability?: number }) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className={`text-center font-semibold mb-3 ${color === 'blue' ? 'text-blue-700' : 'text-red-700'}`}>{title}</h3>
      <div className="grid gap-2 mb-3">
        {team.players.map(p => (
          <div key={p.id} className="bg-gray-50 rounded px-3 py-2 text-center">
            <strong>{p.name}</strong>
          </div>
        ))}
      </div>
      <div className="bg-gray-100 rounded px-3 py-2 text-center font-semibold">
        <span className="mr-2">Total habilidad:</span>
        {team.totalSkill}
        <span className="mx-2">|</span>
        <span className="mr-2">Probabilidad de victoria:</span>
        {winProbability != null ? `${winProbability}%` : '—'}
      </div>
    </div>
  )
}


