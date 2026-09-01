// Shared by web, mobile and the MCP server so player search behaves identically
// on every surface — "martin" must match "Martín" everywhere or nowhere.
export function normalizeForSearch(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
