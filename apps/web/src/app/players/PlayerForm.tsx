'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPlayerPhoto } from '@fulbito/firebase'
import { usePlayerStore } from '@/store/usePlayerStore'
import { getGoalkeeping } from '@fulbito/utils'
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
  const [originalData, setOriginalData] = useState<{
    name: string
    position: string
    physical: string
    technical: string
    tactical: string
    psychological: string
    inactive: boolean
    goalkeeping: string
  } | null>(null)

  useEffect(() => {
    if (mode === 'edit' && playerId) {
      const p = getPlayer(playerId)
      if (p) {
        const base = p.skill === null ? 5 : p.skill
        const loaded = {
          name: p.name,
          position: p.position,
          physical: String(p.skills?.physical ?? base),
          technical: String(p.skills?.technical ?? base),
          tactical: String(p.skills?.tactical ?? base),
          psychological: String(p.skills?.psychological ?? base),
          inactive: p.inactive ?? false,
        }
        setFormData(loaded)
        setPhotoPreview(p.photoUrl ?? null)
        setOriginalPhotoUrl(p.photoUrl ?? null)
        const loadedGoalkeeping = String(getGoalkeeping(p))
        setGoalkeeping(loadedGoalkeeping)
        setGkTouched(p.goalkeeping != null)
        setOriginalData({ ...loaded, goalkeeping: loadedGoalkeeping })
      }
    }
  }, [mode, playerId, getPlayer])

  const avgPreview = useMemo(() => (
    (+formData.physical + +formData.technical + +formData.tactical + +formData.psychological) / 4
  ), [formData])

  const gkValue = gkTouched ? goalkeeping : String(Math.round(avgPreview))

  const photoChanged = photoPreview !== originalPhotoUrl

  const summaryRows = useMemo(() => {
    const fields: { label: string; before?: string; after: string; beforeImg?: string | null; afterImg?: string | null }[] = [
      { label: 'Nombre', before: originalData?.name, after: formData.name.trim() },
      { label: 'Posición', before: originalData ? (positionLabels[originalData.position] ?? originalData.position) : undefined, after: positionLabels[formData.position] ?? formData.position },
      { label: 'Físico', before: originalData?.physical, after: formData.physical },
      { label: 'Técnico', before: originalData?.technical, after: formData.technical },
      { label: 'Táctico', before: originalData?.tactical, after: formData.tactical },
      { label: 'Mental', before: originalData?.psychological, after: formData.psychological },
      { label: 'Nivel de arquero', before: originalData?.goalkeeping, after: gkValue },
      { label: 'Estado', before: originalData ? (originalData.inactive ? 'Inactivo' : 'Activo') : undefined, after: formData.inactive ? 'Inactivo' : 'Activo' },
    ]
    const filtered = mode === 'create' ? fields : fields.filter((f) => f.before !== f.after)

    if (mode === 'create' ? !!photoPreview : photoChanged) {
      filtered.push({
        label: 'Foto',
        before: originalData ? (originalPhotoUrl ? 'Con foto' : 'Sin foto') : undefined,
        after: photoPreview ? 'Con foto' : 'Sin foto',
        beforeImg: originalPhotoUrl,
        afterImg: photoPreview,
      })
    }

    return filtered
  }, [mode, originalData, formData, gkValue, originalPhotoUrl, photoPreview, photoChanged])

  const canSubmit = mode === 'create' ? formData.name.trim().length > 0 : summaryRows.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
          onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              onChange={(e) => setFormData({ ...formData, [cat.key]: e.target.value })}
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
            className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-gray-300 bg-white cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Subir foto"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          >
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="preview" className="object-cover w-full h-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/silhouette.svg" alt="placeholder" className="object-cover w-full h-full" />
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
          onChange={(e) => {
            const f = e.target.files?.[0] || null
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
          onChange={(e) => { setGkTouched(true); setGoalkeeping(e.target.value) }}
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
          onChange={(e) => setFormData({...formData, position: e.target.value})}
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
        <button type="button" onClick={() => (mode === 'edit' && playerId ? router.back() : router.push("/players"))} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
            canSubmit ? 'bg-brand text-white hover:bg-brand/90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {mode === 'create' ? 'Guardar jugador' : 'Actualizar jugador'}
        </button>
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
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.beforeImg} alt="Foto anterior" className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300 opacity-50" />
                      )}
                      {row.beforeImg && <span className="text-gray-400">→</span>}
                      {row.afterImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.afterImg} alt="Foto nueva" className="w-8 h-8 rounded-full object-cover ring-1 ring-brand" />
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
              <button type="button" onClick={() => setModalOpen(false)} className="flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
                Cancelar
              </button>
              <button type="button" onClick={savePlayer} className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2">
                {mode === 'create' ? 'Guardar jugador' : 'Actualizar jugador'}
              </button>
            </div>
          </div>
        </Modal>
       
      
      
    </form>
  )
}


