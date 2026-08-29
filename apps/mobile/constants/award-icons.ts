import type { AwardKey } from '@fulbito/utils'
import type { AwardIcon } from '@/hooks/use-annual-awards'

export const AWARD_ICONS: Record<AwardKey, AwardIcon> = {
  matches: { lib: 'mci', name: 'run' },
  wins: { lib: 'ionicons', name: 'ribbon' },
  losses: { lib: 'mci', name: 'emoticon-sad-outline' },
  shirts: { lib: 'mci', name: 'washing-machine' },
  mvps: { lib: 'ionicons', name: 'star' },
  streak: { lib: 'mci', name: 'fire' },
}
