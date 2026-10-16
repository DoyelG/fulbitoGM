export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>
  isError?: boolean
}

export function jsonResult(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
}

export function errorResult(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true }
}
