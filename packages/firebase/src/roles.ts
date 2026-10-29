import type { Role } from '@fulbito/types'

export function normalizeRoles(storedRole: Role[] | Role | null | undefined): Role[] {
  if (!storedRole) return ['USER']
  return Array.isArray(storedRole) ? storedRole : [storedRole]
}
