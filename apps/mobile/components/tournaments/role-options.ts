import type { InvitationRole } from '@fulbito/types'
import { ASSIGNABLE_ROLES, TOURNAMENT_ROLE_HINTS, TOURNAMENT_ROLE_LABELS } from '@fulbito/utils'

import type { Option } from './option-list'

export const roleOptions: Option<InvitationRole>[] = ASSIGNABLE_ROLES.map((role) => ({
  value: role,
  label: TOURNAMENT_ROLE_LABELS[role],
  description: TOURNAMENT_ROLE_HINTS[role],
}))
