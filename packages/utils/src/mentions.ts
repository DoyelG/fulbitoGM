import type { Player, TournamentMember } from '@fulbito/types'
import { normalizeForSearch } from './search'

export type MentionCandidate = { handle: string; name: string }

export type ActiveMention = { start: number; end: number; query: string }

export type CommentSegment = { text: string; mention: boolean }

export const MENTION_SUGGESTION_LIMIT = 5

const MENTION_BEFORE_CARET = /(^|\s)@([\p{L}\p{N}-]*)$/u
const MENTION_AFTER_CARET = /^[\p{L}\p{N}-]*/u
const MENTION_IN_TEXT = /(^|\s)(@[a-z0-9]+(?:-[a-z0-9]+)*)/g

export function mentionHandle(name: string): string {
  return normalizeForSearch(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildMentionCandidates(
  players: Pick<Player, 'id' | 'name' | 'inactive'>[],
  members: Pick<TournamentMember, 'playerId' | 'email'>[],
): MentionCandidate[] {
  const linkedPlayerIds = new Set(members.flatMap((member) => (member.playerId ? [member.playerId] : [])))
  const names = [
    ...players.filter((player) => !player.inactive || linkedPlayerIds.has(player.id)).map((player) => player.name),
    ...members.filter((member) => !member.playerId).map((member) => member.email.split('@')[0] ?? ''),
  ]
  const byHandle = new Map<string, MentionCandidate>()
  for (const name of names) {
    const handle = mentionHandle(name)
    if (handle && !byHandle.has(handle)) byHandle.set(handle, { handle, name: name.trim() })
  }
  return [...byHandle.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function activeMention(text: string, caret: number): ActiveMention | null {
  const before = MENTION_BEFORE_CARET.exec(text.slice(0, caret))
  if (!before) return null
  const query = before[2] ?? ''
  const rest = MENTION_AFTER_CARET.exec(text.slice(caret))?.[0] ?? ''
  return { start: caret - query.length - 1, end: caret + rest.length, query }
}

export function suggestMentions(
  candidates: MentionCandidate[],
  query: string,
  limit = MENTION_SUGGESTION_LIMIT,
): MentionCandidate[] {
  const needle = normalizeForSearch(query).replace(/[^a-z0-9-]/g, '')
  const rank = ({ handle }: MentionCandidate) => {
    if (handle.startsWith(needle)) return 0
    if (handle.includes(`-${needle}`)) return 1
    return handle.includes(needle) ? 2 : -1
  }
  return candidates
    .map((candidate) => ({ candidate, rank: rank(candidate) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}

export function insertMention(text: string, mention: ActiveMention, handle: string): { text: string; caret: number } {
  const inserted = `@${handle} `
  const after = text.slice(mention.end).replace(/^\s/, '')
  return { text: `${text.slice(0, mention.start)}${inserted}${after}`, caret: mention.start + inserted.length }
}

export function splitMentions(text: string, handles: ReadonlySet<string>): CommentSegment[] {
  const segments: CommentSegment[] = []
  let cursor = 0
  for (const match of text.matchAll(MENTION_IN_TEXT)) {
    const token = match[2] ?? ''
    if (!handles.has(token.slice(1))) continue
    const start = (match.index ?? 0) + (match[1] ?? '').length
    if (start > cursor) segments.push({ text: text.slice(cursor, start), mention: false })
    segments.push({ text: token, mention: true })
    cursor = start + token.length
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), mention: false })
  return segments
}
