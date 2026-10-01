'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { uploadPlayerPhoto } from '@fulbito/firebase'
import { usePlayerStore } from '@/store/usePlayerStore'
import { getGoalkeeping } from '@fulbito/utils'
import Button from '@/components/Button'
import Modal from '@/components/Modal'
import Tooltip from '@/components/Tooltip'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'

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

type PlayerFormValues = {
  name: string
  position: string
  physical: string
  technical: string
  tactical: string
  psychological: string
  inactive: boolean
}

type OriginalPlayerData = PlayerFormValues & { goalkeeping: string }

type SummaryRow = {
  label: string
  before?: string
  after: string
  beforeImg?: string | null
  afterImg?: string | null
}

const skillLabels = {
  physical: 'Físico',
  technical: 'Técnico',
  tactical: 'Táctico',
  psychological: 'Mental',
} as const

type SkillKey = keyof typeof skillLabels

const skillKeys = Object.keys(skillLabels) as SkillKey[]

const statusLabel = (inactive: boolean) => (inactive ? 'Inactivo' : 'Activo')
const photoStatusLabel = (photoUrl: string | null) => (photoUrl ? 'Con foto' : 'Sin foto')

const positionLabel = (position: string) => positionLabels[position] ?? position

export default function PlayerForm({ mode, playerId }: Props) {
  const router = useRouter()
  const { addPlayer, updatePlayer, getPlayer } = usePlayerStore()
  const [formData, setFormData] = useState({
    name: '',
    position: 'PLAYER',
    physical: '5',
    technical: '5',
    tactical: '5',
    psychological: '5',
    inactive: false,
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [originalPhotoUrl, setOriginalPhotoUrl] = useState<string | null>(null)
  const [goalkeeping, setGoalkeeping] = useState<string>('5')
  const [gkTouched, setGkTouched] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [originalData, setOriginalData] = useState<OriginalPlayerData | null>(null)

  useEffect(() => {
    if (mode === 'edit' && playerId) {
      const player = getPlayer(playerId)
      if (player) {
        const defaultSkill = player.skill === null ? 5 : player.skill
        const loadedFormData = {
          name: player.name,
          position: player.position,
          physical: String(player.skills?.physical ?? defaultSkill),
          technical: String(player.skills?.technical ?? defaultSkill),
          tactical: String(player.skills?.tactical ?? defaultSkill),
          psychological: String(player.skills?.psychological ?? defaultSkill),
          inactive: player.inactive ?? false,
        }
        setFormData(loadedFormData)
        setPhotoPreview(player.photoUrl ?? null)
        setOriginalPhotoUrl(player.photoUrl ?? null)
        const loadedGoalkeeping = String(getGoalkeeping(player))
        setGoalkeeping(loadedGoalkeeping)
        setGkTouched(player.goalkeeping != null)
        setOriginalData({ ...loadedFormData, goalkeeping: loadedGoalkeeping })
      }
    }
  }, [mode, playerId, getPlayer])

  const avgPreview = useMemo(() => (
    (+formData.physical + +formData.technical + +formData.tactical + +formData.psychological) / 4
  ), [formData])

  const gkValue = gkTouched ? goalkeeping : String(Math.round(avgPreview))

  const photoChanged = photoPreview !== originalPhotoUrl

  const summaryRows = useMemo(() => {
    const getOriginalValue = (selectValue: (original: OriginalPlayerData) => string) =>
      originalData ? selectValue(originalData) : undefined

    const fieldRows: SummaryRow[] = [
      { label: 'Nombre', before: getOriginalValue((original) => original.name), after: formData.name.trim() },
      {
        label: 'Posición',
        before: getOriginalValue((original) => positionLabel(original.position)),
        after: positionLabel(formData.position),
      },
      ...skillKeys.map((skillKey) => ({
        label: skillLabels[skillKey],
        before: getOriginalValue((original) => original[skillKey]),
        after: formData[skillKey],
      })),
      { label: 'Nivel de arquero', before: getOriginalValue((original) => original.goalkeeping), after: gkValue },
      {
        label: 'Estado',
        before: getOriginalValue((original) => statusLabel(original.inactive)),
        after: statusLabel(formData.inactive),
      },
    ]

    const photoRow: SummaryRow = {
      label: 'Foto',
      before: getOriginalValue(() => photoStatusLabel(originalPhotoUrl)),
      after: photoStatusLabel(photoPreview),
      beforeImg: originalPhotoUrl,
      afterImg: photoPreview,
    }

    const visibleFieldRows = mode === 'create' ? fieldRows : fieldRows.filter((row) => row.before !== row.after)
    const shouldShowPhotoRow = mode === 'create' ? !!photoPreview : photoChanged

    return shouldShowPhotoRow ? [...visibleFieldRows, photoRow] : visibleFieldRows
  }, [mode, originalData, formData, gkValue, originalPhotoUrl, photoPreview, photoChanged])

  const canSubmit = mode === 'create' ? formData.name.trim().length > 0 : summaryRows.length > 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setModalOpen(true)
  }

  const savePlayer = async () => {
    const skills = {
      physical: parseInt(formData.physical, 10),
      technical: parseInt(formData.technical, 10),
      tactical: parseInt(formData.tactical, 10),
      psychological: parseInt(formData.psychological, 10),
    }
    const avg = (skills.physical + skills.technical + skills.tactical + skills.psychological) / 4
    const goalkeepingValue = gkTouched ? parseInt(goalkeeping, 10) : Math.round(avg)

    let uploadedUrl: string | undefined
    if (photoFile) {
      const photoId = mode === 'edit' && playerId ? playerId : crypto.randomUUID()
      uploadedUrl = await uploadPlayerPhoto(photoFile, photoId)
    }

    if (mode === 'create') {
      await addPlayer({ name: formData.name.trim(), position: formData.position, skills, skill: avg, goalkeeping: goalkeepingValue, inactive: formData.inactive, ...(uploadedUrl ? { photoUrl: uploadedUrl } : {}) })
    } else if (playerId) {
      await updatePlayer(playerId, { name: formData.name.trim(), position: formData.position, skills, skill: avg, goalkeeping: goalkeepingValue, inactive: formData.inactive, ...(photoChanged ? { photoUrl: uploadedUrl ?? null } : {}) })
    }
    setModalOpen(false)
    router.push(mode === 'edit' && playerId ? `/players/${playerId}` : '/players')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-black">Nombre del jugador</label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(event) => setFormData({...formData, name: event.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { key: 'physical', label: 'Físico' },
          { key: 'technical', label: 'Técnico' },
          { key: 'tactical', label: 'Táctico' },
          { key: 'psychological', label: 'Mental' },
        ].map(cat => (
          <div key={cat.key}>
            <label className="block text-sm font-medium text-black">{cat.label}</label>
            <select
              value={(formData as unknown as { [key: string]: number | string })[cat.key]}
              onChange={(event) => setFormData({ ...formData, [cat.key]: event.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div>
        <div className="relative mt-2 w-16 h-16">
          <div
            className="relative w-16 h-16 rounded-full overflow-hidden ring-1 ring-gray-300 bg-white cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Subir foto"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click() }}
          >
            {photoPreview ? (
              <Image src={photoPreview} alt="preview" fill unoptimized className="object-cover" />
            ) : (
              <Image src="/silhouette.svg" alt="placeholder" fill unoptimized className="object-cover" />
            )}
          </div>

          {photoPreview && (
            <div className="absolute -top-1 -right-1">
              <Tooltip label="Eliminar foto" variant="danger" position="top">
                <button
                  type="button"
                  aria-label="Eliminar foto"
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="w-6 h-6 rounded-full bg-white ring-1 ring-gray-300 shadow flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <FiTrash2 size={14} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const f = event.target.files?.[0] || null
            setPhotoFile(f)
            setPhotoPreview(f ? URL.createObjectURL(f) : photoPreview)
          }}
          className="hidden"
        />
      </div>

      <div className="text-sm text-gray-800">General (promedio): <span className="font-semibold">Lv {avgPreview}</span></div>

      <div>
        <label htmlFor="goalkeeping" className="block text-sm font-medium text-black">Nivel de arquero</label>
        <select
          id="goalkeeping"
          value={gkValue}
          onChange={(event) => { setGkTouched(true); setGoalkeeping(event.target.value) }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        >
          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <p className="mt-1 text-xs text-gray-700">Por defecto sigue el promedio del jugador. Editalo para fijar un valor.</p>
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium text-black">Posición</label>
        <select
          id="position"
          value={formData.position}
          onChange={(event) => setFormData({...formData, position: event.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand"
        >
          <option value="GK">Arquero</option>
          <option value="DEF">Defensor</option>
          <option value="MID">Mediocampista</option>
          <option value="FWD">Delantero</option>
          <option value="PLAYER">Cualquier posición</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-1">Estado</label>
        <div
          role="group"
          aria-label="Estado del jugador"
          className="inline-flex rounded-md border border-gray-300 overflow-hidden"
        >
          <button
            type="button"
            aria-pressed={!formData.inactive}
            onClick={() => setFormData({ ...formData, inactive: false })}
            className={`w-20 px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
              !formData.inactive ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Activo
          </button>
          <button
            type="button"
            aria-pressed={formData.inactive}
            onClick={() => setFormData({ ...formData, inactive: true })}
            className={`w-20 px-3 py-1.5 text-sm font-medium border-l border-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
              formData.inactive ? 'bg-gray-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Inactivo
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => (mode === 'edit' && playerId ? router.back() : router.push("/players"))}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {mode === 'create' ? 'Guardar jugador' : 'Actualizar jugador'}
        </Button>
      </div>

      <Modal
        title={`${mode === 'edit' ? 'Actualizar' : 'Guardar'} datos`}
        open={modalOpen}
        onClose={() => setModalOpen(false)}>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-brand/10">
              <FiEdit2 className="text-brand" size={20} />
            </div>
            <p className="text-gray-600">
              ¿Confirmás {mode === 'edit' ? 'actualizar' : 'guardar'} los datos de{' '}
              <span className="font-medium text-gray-900">{formData.name}</span>?
            </p>
            {summaryRows.length > 0 && (
              <div className="mt-3 space-y-1 text-sm text-gray-600 text-left">
                {summaryRows.map((row) =>
                  row.label === 'Foto' ? (
                    <div key={row.label} className="flex items-center gap-2">
                      <span>{row.label}:</span>
                      {row.beforeImg && (
                        <Image src={row.beforeImg} alt="Foto anterior" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300 opacity-50" />
                      )}
                      {row.beforeImg && <span className="text-gray-400">→</span>}
                      {row.afterImg ? (
                        <Image src={row.afterImg} alt="Foto nueva" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-1 ring-brand" />
                      ) : (
                        <span className="font-medium text-black">Sin foto</span>
                      )}
                    </div>
                  ) : (
                    <p key={row.label}>
                      {row.label}:{' '}
                      {row.before !== undefined && (
                        <span className="line-through text-gray-400">{row.before}</span>
                      )}{' '}
                      <span className="font-medium text-black">{row.after}</span>
                    </p>
                  )
                )}
              </div>
            )}
            <div className="flex justify-center gap-3 mt-6">
              <Button type="button" variant="secondary" block onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" block onClick={savePlayer}>
                {mode === 'create' ? 'Guardar jugador' : 'Actualizar jugador'}
              </Button>
            </div>
          </div>
        </Modal>
       
      
      
    </form>
  )
}


