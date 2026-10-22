'use client'

import type { MatchLocation } from '@fulbito/types'
import { matchLocationMapsUrl } from '@fulbito/utils'
import Tooltip from '@/components/Tooltip'

type Props = {
  location: MatchLocation
}

export default function MatchLocationLink({ location }: Props) {
  return (
    <Tooltip label={location.street} variant="neutral">
      <a
        href={matchLocationMapsUrl(location)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand hover:underline"
      >
        {location.name}
      </a>
    </Tooltip>
  )
}
