import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerPlayerTools } from './tools/players'
import { registerMatchTools } from './tools/matches'
import { registerStatsTools } from './tools/stats'

async function main(): Promise<void> {
  const server = new McpServer({ name: 'fulbito', version: '0.1.0' })
  registerPlayerTools(server)
  registerMatchTools(server)
  registerStatsTools(server)

  await server.connect(new StdioServerTransport())
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
