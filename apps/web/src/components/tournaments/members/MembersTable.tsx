'use client'

import type { ReactNode } from 'react'
import { FiLink, FiShield, FiTrash2 } from 'react-icons/fi'
import type { TournamentMember, TournamentRole } from '@fulbito/types'
import { canChangeMemberRole, canRemoveMember } from '@fulbito/utils'
import Tooltip from '@/components/Tooltip'
import { ROLE_LABELS, ROLE_STYLES } from '../tournament-roles'

type Props = {
  members: TournamentMember[]
  currentUid: string
  currentRole: TournamentRole
  playerNameById: Map<string, string>
  onAssignPlayer: (member: TournamentMember) => void
  onChangeRole: (member: TournamentMember) => void
  onRemove: (member: TournamentMember) => void
}

const headerClassName = 'px-4 py-3 text-left text-sm font-semibold text-gray-700'

function IconButton({
  label,
  variant,
  onClick,
  children,
}: {
  label: string
  variant: 'primary' | 'danger'
  onClick: () => void
  children: ReactNode
}) {
  const hover = variant === 'danger' ? 'hover:text-red-600 hover:bg-red-50' : 'hover:text-brand hover:bg-brand/10'
  return (
    <Tooltip label={label} position="bottom" variant={variant}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={`flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${hover}`}
      >
        {children}
      </button>
    </Tooltip>
  )
}

export default function MembersTable({
  members,
  currentUid,
  currentRole,
  playerNameById,
  onAssignPlayer,
  onChangeRole,
  onRemove,
}: Props) {
  const canManage = currentRole !== 'MEMBER'

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className={headerClassName}>
                Mail
              </th>
              <th scope="col" className={headerClassName}>
                Rol
              </th>
              <th scope="col" className={headerClassName}>
                Jugador
              </th>
              {canManage && (
                <th scope="col" className={`${headerClassName} text-right`}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => {
              const playerName = member.playerId ? playerNameById.get(member.playerId) : undefined
              const isMe = member.uid === currentUid
              return (
                <tr key={member.uid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {member.email}
                    {isMe && <span className="text-gray-700"> (vos)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ROLE_STYLES[member.role]}`}
                    >
                      {ROLE_LABELS[member.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {playerName ?? <span className="text-gray-700">Sin jugador</span>}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          label={`Cambiar el jugador de ${member.email}`}
                          variant="primary"
                          onClick={() => onAssignPlayer(member)}
                        >
                          <FiLink size={17} aria-hidden />
                        </IconButton>
                        {canChangeMemberRole(currentRole, member.role) && (
                          <IconButton
                            label={`Cambiar el rol de ${member.email}`}
                            variant="primary"
                            onClick={() => onChangeRole(member)}
                          >
                            <FiShield size={17} aria-hidden />
                          </IconButton>
                        )}
                        {!isMe && canRemoveMember(currentRole, member.role) && (
                          <IconButton
                            label={`Eliminar a ${member.email}`}
                            variant="danger"
                            onClick={() => onRemove(member)}
                          >
                            <FiTrash2 size={17} aria-hidden />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
