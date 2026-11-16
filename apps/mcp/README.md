# @fulbito/mcp

Read-only [MCP](https://modelcontextprotocol.io) server that lets Claude answer questions about the fulbito app: players, matches, stats, streaks and shirt duties.

It reuses `@fulbito/firebase` (client SDK) and `@fulbito/utils` directly — no `firebase-admin`, no service account. Data is scoped per tournament, so the server signs in as a regular email/password account and only sees the tournaments that account is a member of. Use a dedicated account with the MEMBER role — the server never writes.

## Setup

Requires Node 22.23.4+.

```bash
cp apps/mcp/.env.example apps/mcp/.env
```

Fill it with the same public Firebase client config the web/mobile apps use (Firebase console → Project settings → Your apps), plus `FIREBASE_MCP_EMAIL` and `FIREBASE_MCP_PASSWORD` for the account the server signs in as. Invite that account to each tournament it should read. `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID` and both account variables are required. The variables can also be provided through the environment instead of the file.

Without config the server still connects and lists its tools — calling any tool returns these setup instructions instead of data.

## Run

```bash
pnpm --silent --filter @fulbito/mcp start
```

The server speaks MCP over stdio — it is meant to be launched by an MCP client, not used standalone. `--silent` matters: without it pnpm prints its run banner to stdout, which corrupts the JSON-RPC stream.

## Use with Claude Code

The repo-root `.mcp.json` already registers the server as `fulbito`. Open Claude Code in the repo, approve the server when prompted, and ask away ("who has the longest win streak?", "when did we last play?").

## Use with Claude Desktop

Add to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "fulbito": {
      "command": "pnpm",
      "args": ["-C", "/path/to/fulbitoGM", "--silent", "--filter", "@fulbito/mcp", "start"]
    }
  }
}
```

Claude Desktop's config supports only `command`, `args` and `env` (no `cwd`), so the repo path goes through pnpm's `-C` flag.

## Tools

| Tool                    | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `list_tournaments`      | Tournaments the account belongs to, with its role           |
| `list_players`          | All players, ordered by skill                               |
| `get_player`            | One player by id                                            |
| `search_players`        | Filter players by partial name/position                     |
| `list_matches`          | All matches, newest first; optional status filter and limit |
| `get_match`             | One match by id, with rosters                               |
| `get_player_stats`      | Aggregated per-player stats over final matches              |
| `get_streaks`           | Active win/loss streak per player (streakless omitted)      |
| `get_shirt_duty_counts` | Shirt-washing duty count per player (zero-count omitted)    |

Every tool except `list_tournaments` takes a `tournamentId`. All tools are read-only. There are deliberately no create/update/delete tools.
