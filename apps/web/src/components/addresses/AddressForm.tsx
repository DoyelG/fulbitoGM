'use client'

import { useState } from 'react'
import type { AddressInput } from '@/store/useAddressStore'

type Props = {
  initial?: AddressInput
  submitLabel: string
  onCancel: () => void
  onSubmit: (data: AddressInput) => Promise<void>
}

type Coords = { lat: number; lon: number }

async function geocode(street: string): Promise<Coords | null> {
  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    q: street,
    countrycodes: 'ar',
    viewbox: '-59.3,-34.2,-57.8,-35.2',
    bounded: '1',
  })
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
    const results = (await res.json()) as Array<{ lat: string; lon: string }>
    return results[0] ? { lat: Number(results[0].lat), lon: Number(results[0].lon) } : null
  } catch {
    return null
  }
}

export default function AddressForm({ initial, submitLabel, onCancel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [street, setStreet] = useState(initial?.street ?? '')
  const [coords, setCoords] = useState<Coords | null | undefined>(undefined)

  const mapUrl =
    coords &&
    `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.005},${coords.lat - 0.005},${
      coords.lon + 0.005
    },${coords.lat + 0.005}&marker=${coords.lat},${coords.lon}`

  return (
    <div>
      <label htmlFor="address-name" className="block text-sm font-medium mb-1">
        Nombre
      </label>
      <input
        id="address-name"
        placeholder="Ingresar el Nombre de la cancha"
        value={name}
        onChange={(event) => {
          setName(event.target.value)
          setCoords(undefined)
        }}
        className="h-10 border rounded px-3 w-full"
      />

      <label htmlFor="address-street" className="block text-sm font-medium mb-1 mt-3">
        Dirección
      </label>
      <input
        id="address-street"
        placeholder="Ingresar la Dirección de la cancha"
        value={street}
        onChange={(event) => {
          setStreet(event.target.value)
          setCoords(undefined)
        }}
        className="h-10 border rounded px-3 w-full"
      />

      {mapUrl && (
        <iframe title="Vista previa de la ubicación" src={mapUrl} className="mt-3 h-60 w-full rounded border" />
      )}
      {coords === null && <p className="mt-3 text-sm text-gray-500">No se encontró esa dirección.</p>}

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel} className="flex-1 rounded-md border py-2 text-sm">
          Cancelar
        </button>
        {coords === undefined ? (
          <button
            type="button"
            onClick={async () => setCoords(await geocode(street))}
            disabled={!name || !street}
            className="flex-1 rounded-md bg-brand py-2 text-sm text-white disabled:opacity-50"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSubmit({ name, street })}
            disabled={!coords}
            className="flex-1 rounded-md bg-brand py-2 text-sm text-white disabled:opacity-50"
          >
            {submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}
