import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMyTournaments } from '@fulbito/firebase'
import { withFirebase } from '../firebase'
import { jsonResult } from '../tool-result'

export const tournamentIdSchema = z
  .string()
  .min(1)
  .describe('Tournament id (from list_tournaments); every player and match belongs to one tournament')

export function registerTournamentTools(server: McpServer): void {
  server.registerTool(
    'list_tournaments',
    {
      title: 'List tournaments',
      description:
        'Tournaments the MCP account is a member of, with its role in each. Call this first: every other tool needs a tournamentId.',
      inputSchema: {},
    },
    withFirebase(async (uid) => {
      const tournaments = await getMyTournaments(uid)
      return jsonResult(
        tournaments.map(({ tournament, membership }) => ({
          id: tournament.id,
          name: tournament.name,
          description: tournament.description,
          role: membership.role,
        })),
      )
    }),
  )
}
