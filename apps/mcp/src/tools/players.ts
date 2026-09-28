import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getPlayer, getPlayers } from '@fulbito/firebase'
import { normalizeForSearch } from '@fulbito/utils'
import { withFirebase } from '../firebase'
import { errorResult, jsonResult } from '../tool-result'

export function registerPlayerTools(server: McpServer): void {
  server.registerTool(
    'list_players',
    {
      title: 'List players',
      description:
        'All registered players with position, skill rating, detailed skills and goalkeeping rating, ordered by skill (highest first).',
      inputSchema: {},
    },
    withFirebase(async () => jsonResult(await getPlayers())),
  )

  server.registerTool(
    'get_player',
    {
      title: 'Get player',
      description: 'One player by id.',
      inputSchema: { id: z.string().min(1).describe('Player id') },
    },
    withFirebase(async ({ id }) => {
      const player = await getPlayer(id)
      return player ? jsonResult(player) : errorResult(`Player ${id} not found`)
    }),
  )

  server.registerTool(
    'search_players',
    {
      title: 'Search players',
      description: 'Find players by (partial, case- and accent-insensitive) name and/or position.',
      inputSchema: {
        name: z.string().optional().describe('Partial name to match'),
        position: z.string().optional().describe('Partial position to match'),
      },
    },
    withFirebase(async ({ name, position }) => {
      const players = await getPlayers()
      const byName = name ? normalizeForSearch(name) : undefined
      const byPosition = position ? normalizeForSearch(position) : undefined
      return jsonResult(
        players.filter(
          (p) =>
            (!byName || normalizeForSearch(p.name).includes(byName)) &&
            (!byPosition || normalizeForSearch(p.position).includes(byPosition)),
        ),
      )
    }),
  )
}
