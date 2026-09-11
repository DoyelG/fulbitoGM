import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { computePlayerStats, getMatches, getPlayers } from '@fulbito/firebase'
import type { Match } from '@fulbito/types'
import { calculateAllCurrentStreaks, getShirtDutiesByPlayerId, onlyFinalMatches } from '@fulbito/utils'
import { withFirebase } from '../firebase'
import { jsonResult } from '../tool-result'

function rosterNamesById(matches: Match[]): Map<string, string> {
  const names = new Map<string, string>()
  for (const m of matches) {
    for (const p of [...m.teamA, ...m.teamB]) {
      if (p.name) names.set(p.id, p.name)
    }
  }
  return names
}

export function registerStatsTools(server: McpServer): void {
  server.registerTool(
    'get_player_stats',
    {
      title: 'Get player stats',
      description:
        'Aggregated stats per player across all final (non-draft) matches: matches played, goals, average performance, wins, losses and draws.',
      inputSchema: {},
    },
    withFirebase(async () => {
      const [players, matches] = await Promise.all([getPlayers(), getMatches()])
      return jsonResult(computePlayerStats(players, onlyFinalMatches(matches)))
    }),
  )

  server.registerTool(
    'get_streaks',
    {
      title: 'Get current streaks',
      description:
        'Current win/loss streak per player, computed over final matches (draws do not break a streak). Only players with an active streak are listed.',
      inputSchema: {},
    },
    withFirebase(async () => {
      const finals = onlyFinalMatches(await getMatches())
      const streaks = calculateAllCurrentStreaks(finals)
      const names = rosterNamesById(finals)
      return jsonResult(
        Object.entries(streaks)
          .filter(([, s]) => s.kind !== null)
          .map(([playerId, s]) => ({ playerId, name: names.get(playerId) ?? playerId, ...s }))
          .sort((a, b) => b.count - a.count),
      )
    }),
  )

  server.registerTool(
    'get_shirt_duty_counts',
    {
      title: 'Get shirt duty counts',
      description:
        'How many times each player has been responsible for washing the shirts, over final matches. Players who never had shirt duty are omitted (there are no zero-count rows).',
      inputSchema: {},
    },
    withFirebase(async () => {
      const finals = onlyFinalMatches(await getMatches())
      const duties = getShirtDutiesByPlayerId(finals)
      const names = rosterNamesById(finals)
      return jsonResult(
        [...duties.entries()]
          .map(([playerId, count]) => ({ playerId, name: names.get(playerId) ?? playerId, count }))
          .sort((a, b) => b.count - a.count),
      )
    }),
  )
}
