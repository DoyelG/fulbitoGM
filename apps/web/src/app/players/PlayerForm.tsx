'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { InvitationError, TournamentMemberError, uploadPlayerPhoto } from '@fulbito/firebase'
import type { SkillValue } from '@fulbito/types'
import { getGoalkeeping } from '@fulbito/utils'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import SkillBadge from '@/components/SkillBadge'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournamentMembers } from '@/hooks/use-tournament-members'
import { getActiveTournamentId } from '@/store/active-tournament'
import { usePlayerStore, type PlayerLink } from '@/store/usePlayerStore'
import { useTournamentStore } from '@/store/useTournamentStore'
import FormSection from './form/FormSection'
import PlayerLinkSection from './form/PlayerLinkSection'
import PlayerPhotoField from './form/PlayerPhotoField'
import PlayerSaveSummary, { type SummaryRow } from './form/PlayerSaveSummary'
import SkillSlider from './form/SkillSlider'
import StatusToggle from './form/StatusToggle'

type Props = {
  mode: 'create' | 'edit'
  playerId?: string
}

const positionLabels: Record<string, string> = {
  GK: 'Arquero',
  DEF: 'Defensor',
  MID: 'Mediocampista',
  FWD: 'Delantero',
  PLAYER: 'Cualquier posición',
}

const skillLabels = {
  physical: 'Físico',
  technical: 'Técnico',
  tactical: 'Táctico',
  psychological: 'Mental',
} as const

type SkillKey = keyof typeof skillLabels

const skillKeys = Object.keys(skillLabels) as SkillKey[]

type PlayerFormValues = {
  name: string
  position: string
  inactive: boolean
} & Record<SkillKey, number>

type OriginalPlayerData = PlayerFormValues & { goalkeeping: number }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const fieldClassName =
  'mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40'

const statusLabel = (inactive: boolean) => (inactive ? 'Inactivo' : 'Activo')
const photoStatusLabel = (photoUrl: string | null) => (photoUrl ? 'Con foto' : 'Sin foto')
const positionLabel = (position: string) => positionLabels[position] ?? position
const toLevel = (value: SkillValue | null | undefined, fallback: number) =>
  typeof value === 'number' ? Math.round(value) : fallback

function linkErrorMessage(error: unknown): string {
  if (error instanceof InvitationError || error instanceof TournamentMemberError) return error.message
  return 'Intentá de nuevo desde la pantalla de miembros del torneo.'
}

export default function PlayerForm({ mode, playerId }: Props) {
  const router = useRouter()
  const { user } = useFirebaseAuth()
  const { players, addPlayer, updatePlayer, linkPlayer } = usePlayerStore()
  const activeTournamentId = useTournamentStore((state) => state.activeTournamentId)
  const members = useTournamentMembers(mode === 'create' ? activeTournamentId : null)
  const [formData, setFormData] = useState<PlayerFormValues>({
    name: '',
    position: 'PLAYER',
    physical: 5,
    technical: 5,
    tactical: 5,
    psychological: 5,
    inactive: false,
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null)
  const [goalkeeping, setGoalkeeping] = useState(5)
  const [gkTouched, setGkTouched] = useState(false)
  const [link, setLink] = useState<PlayerLink>({ kind: 'none' })
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState<OriginalPlayerData | null>(null)

  useEffect(() => {
    if (mode !== 'edit' || !playerId || originalData) return
    const player = players.find(({ id }) => id === playerId)
    if (!player) return
    const defaultSkill = toLevel(player.skill, 5)
    const loadedFormData = {
      name: player.name,
      position: player.position,
      physical: toLevel(player.skills?.physical, defaultSkill),
      technical: toLevel(player.skills?.technical, defaultSkill),
      tactical: toLevel(player.skills?.tactical, defaultSkill),
      psychological: toLevel(player.skills?.psychological, defaultSkill),
      inactive: player.inactive ?? false,
    }
    setFormData(loadedFormData)
    setPhotoPreview(player.photoUrl ?? null)
    setOriginalPhotoUrl(player.photoUrl ?? null)
    const loadedGoalkeeping = getGoalkeeping(player)
    setGoalkeeping(loadedGoalkeeping)
    setGkTouched(player.goalkeeping != null)
    setOriginalData({ ...loadedFormData, goalkeeping: loadedGoalkeeping })
  }, [mode, playerId, players, originalData])

  const average = (formData.physical + formData.technical + formData.tactical + formData.psychological) / 4
  const gkValue = gkTouched ? goalkeeping : Math.round(average)
  const photoChanged = photoPreview !== originalPhotoUrl

  const inviteEmail = link.kind === 'invite' ? link.email.trim().toLowerCase() : ''
  const emailError = useMemo(() => {
    if (link.kind !== 'invite' || !inviteEmail) return null
    if (!EMAIL_PATTERN.test(inviteEmail)) return 'Ingresá un email válido.'
    if (members.some((member) => member.email === inviteEmail)) {
      return 'Ese email ya es miembro del torneo. Elegilo en "Miembro del torneo".'
    }
    return null
  }, [link.kind, inviteEmail, members])
  const linkIsValid =
    link.kind === 'none' || (link.kind === 'member' ? Boolean(link.uid) : Boolean(inviteEmail) && !emailError)

  const linkLabel = useMemo(() => {
    if (link.kind === 'member') return members.find((member) => member.uid === link.uid)?.email ?? 'Miembro del torneo'
    if (link.kind === 'invite') return `Invitación a ${inviteEmail}`
    return 'Sin vincular'
  }, [link, members, inviteEmail])

  const summaryRows = useMemo(() => {
    const before = <T,>(select: (original: OriginalPlayerData) => T) =>
      originalData ? String(select(originalData)) : undefined

    const fieldRows: SummaryRow[] = [
      { label: 'Nombre', before: before((original) => original.name), after: formData.name.trim() },
      {
        label: 'Posición',
        before: before((original) => positionLabel(original.position)),
        after: positionLabel(formData.position),
      },
      ...skillKeys.map((skillKey) => ({
        label: skillLabels[skillKey],
        before: before((original) => original[skillKey]),
        after: String(formData[skillKey]),
      })),
      { label: 'Nivel de arquero', before: before((original) => original.goalkeeping), after: String(gkValue) },
      {
        label: 'Estado',
        before: before((original) => statusLabel(original.inactive)),
        after: statusLabel(formData.inactive),
      },
    ]

    const photoRow: SummaryRow = {
      label: 'Foto',
      before: before(() => photoStatusLabel(originalPhotoUrl)),
      after: photoStatusLabel(photoPreview),
      beforeImg: originalPhotoUrl,
      afterImg: photoPreview,
    }

    if (mode === 'create') {
      return [...fieldRows, ...(photoPreview ? [photoRow] : []), { label: 'Vínculo', after: linkLabel }]
    }
    const changedRows = fieldRows.filter((row) => row.before !== row.after)
    return photoChanged ? [...changedRows, photoRow] : changedRows
  }, [mode, originalData, formData, gkValue, originalPhotoUrl, photoPreview, photoChanged, linkLabel])

  const canSubmit = mode === 'create' ? formData.name.trim().length > 0 && linkIsValid : summaryRows.length > 0
  const goToPlayers = () => router.push(mode === 'edit' && playerId ? `/players/${playerId}` : '/players')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSaveError(null)
    setModalOpen(true)
  }

  const savePlayer = async () => {
    setSaving(true)
    setSaveError(null)
    let savedPlayerId: string
    try {
      let uploadedUrl: string | undefined
      if (photoFile) {
        const photoId = mode === 'edit' && playerId ? playerId : crypto.randomUUID()
        uploadedUrl = await uploadPlayerPhoto(photoFile, getActiveTournamentId(), photoId)
      }

      const playerData = {
        name: formData.name.trim(),
        position: formData.position,
        skills: {
          physical: formData.physical,
          technical: formData.technical,
          tactical: formData.tactical,
          psychological: formData.psychological,
        },
        skill: average,
        goalkeeping: gkValue,
        inactive: formData.inactive,
      }

      if (mode === 'create') {
        savedPlayerId = await addPlayer({ ...playerData, ...(uploadedUrl ? { photoUrl: uploadedUrl } : {}) })
      } else if (playerId) {
        await updatePlayer(playerId, { ...playerData, ...(photoChanged ? { photoUrl: uploadedUrl ?? null } : {}) })
        savedPlayerId = playerId
      } else {
        return
      }
    } catch {
      setSaveError('No se pudo guardar el jugador. Intentá de nuevo.')
      setSaving(false)
      return
    }

    if (mode === 'create' && link.kind !== 'none' && user) {
      try {
        await linkPlayer(
          savedPlayerId,
          link.kind === 'invite' ? { kind: 'invite', email: inviteEmail } : link,
          user.uid,
        )
      } catch (error) {
        setLinkError(linkErrorMessage(error))
        setSaving(false)
        return
      }
    }

    setModalOpen(false)
    goToPlayers()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormSection id="player-data-title" title="Datos del jugador">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <PlayerPhotoField
            previewUrl={photoPreview}
            onSelect={(file) => {
              setPhotoFile(file)
              setPhotoPreview(URL.createObjectURL(file))
            }}
            onRemove={() => {
              setPhotoFile(null)
              setPhotoPreview(null)
            }}
          />
          <div className="grid flex-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                required
                placeholder="Ej: Juan Pérez"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className={fieldClassName}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-900">
                  Posición
                </label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={(event) => setFormData({ ...formData, position: event.target.value })}
                  className={fieldClassName}
                >
                  {Object.entries(positionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <StatusToggle
                inactive={formData.inactive}
                onChange={(inactive) => setFormData({ ...formData, inactive })}
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection id="player-skills-title" title="Habilidades" description="Se usan para armar equipos parejos.">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {skillKeys.map((skillKey) => (
            <SkillSlider
              key={skillKey}
              id={`skill-${skillKey}`}
              label={skillLabels[skillKey]}
              value={formData[skillKey]}
              onChange={(value) => setFormData({ ...formData, [skillKey]: value })}
            />
          ))}
        </div>
        <div className="mt-6 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3" aria-live="polite">
            <span className="text-sm font-medium text-gray-900">General (promedio)</span>
            <SkillBadge skill={average} />
          </div>
          <SkillSlider
            id="goalkeeping"
            label="Nivel de arquero"
            value={gkValue}
            isGoalkeeper
            hint={gkTouched ? 'Valor fijado a mano.' : 'Sigue el promedio hasta que lo cambies.'}
            onChange={(value) => {
              setGkTouched(true)
              setGoalkeeping(value)
            }}
          />
        </div>
      </FormSection>

      {mode === 'create' && (
        <PlayerLinkSection value={link} onChange={setLink} members={members} emailError={emailError} />
      )}

      <div className="flex justify-end gap-3 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={() => (mode === 'edit' ? router.back() : router.push('/players'))}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {mode === 'create' ? 'Guardar jugador' : 'Actualizar jugador'}
        </Button>
      </div>

      <Modal
        title={`${mode === 'edit' ? 'Actualizar' : 'Guardar'} datos`}
        open={modalOpen}
        onClose={() => {
          if (saving) return
          if (linkError) goToPlayers()
          setModalOpen(false)
        }}
      >
        <PlayerSaveSummary
          mode={mode}
          playerName={formData.name.trim()}
          rows={summaryRows}
          saving={saving}
          error={saveError}
          linkError={linkError}
          onCancel={() => setModalOpen(false)}
          onConfirm={savePlayer}
          onContinue={goToPlayers}
        />
      </Modal>
    </form>
  )
}
