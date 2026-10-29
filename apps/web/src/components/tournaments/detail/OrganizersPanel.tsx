import Image from 'next/image'
import type { TournamentMember } from '@fulbito/types'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { ROLE_LABELS, ROLE_STYLES } from '@/components/tournaments/tournament-roles'
import DetailSection from './DetailSection'

type Props = {
  members: TournamentMember[]
  currentUid: string
  playerNameById: Map<string, string>
  photoByUid: Map<string, string>
}

function initials(label: string): string {
  return label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function OrganizersPanel({ members, currentUid, playerNameById, photoByUid }: Props) {
  const organizers = members.filter((member) => member.role !== 'MEMBER')

  return (
    <DetailSection id="organizers-title" title="Organizadores" icon={ShieldCheckIcon}>
      <ul className="space-y-3">
        {organizers.map((member) => {
          const playerName = member.playerId ? playerNameById.get(member.playerId) : undefined
          const label = playerName ?? member.email
          const photoUrl = photoByUid.get(member.uid)
          return (
            <li key={member.uid} className="flex items-center gap-3">
              {photoUrl ? (
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  <Image src={photoUrl} alt="" fill unoptimized sizes="40px" className="object-cover" />
                </span>
              ) : (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
                  aria-hidden
                >
                  {initials(label)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {label}
                  {member.uid === currentUid && <span className="font-normal text-gray-700"> (vos)</span>}
                </p>
                {playerName && <p className="truncate text-xs text-gray-700">{member.email}</p>}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_STYLES[member.role]}`}
              >
                {ROLE_LABELS[member.role]}
              </span>
            </li>
          )
        })}
      </ul>
    </DetailSection>
  )
}
