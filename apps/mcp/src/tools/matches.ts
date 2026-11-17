import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMatch, getMatches } from '@fulbito/firebase'
import { isDraft } from '@fulbito/types'
import { onlyFinalMatches } from '@fulbito/utils'
import { withFirebase } from '../firebase'
import { errorResult, jsonResult } from '../tool-result'
import { tournamentIdSchema } from './tournaments'

export function registerMatchTools(server: McpServer): void {
  server.registerTool(
    'list_matches',
    {
      title: 'List matches',
      description:
        'All matches ordered by date (newest first), each with scores and both rosters including per-player goals and performance. Optionally filter by status and cap the amount returned.',
      inputSchema: {
        tournamentId: tournamentIdSchema,
        status: z.enum(['draft', 'final']).optional().describe('Only matches with this status'),
        limit: z.number().int().positive().optional().describe('Max matches to return'),
      },
    },
    withFirebase(async (_uid, { tournamentId, status, limit }) => {
      let matches = await getMatches(tournamentId)
      if (status) matches = status === 'draft' ? matches.filter(isDraft) : onlyFinalMatches(matches)
      if (limit) matches = matches.slice(0, limit)
      return jsonResult(matches)
    }),
  )

  server.registerTool(
    'get_match',
    {
      title: 'Get match',
      description: 'One match by id, with scores, both rosters, MVP and goalkeeper ids.',
      inputSchema: { tournamentId: tournamentIdSchema, id: z.string().min(1).describe('Match id') },
    },
    withFirebase(async (_uid, { tournamentId, id }) => {
      const match = await getMatch(tournamentId, id)
      return match ? jsonResult(match) : errorResult(`Match ${id} not found`)
    }),
  )
}
