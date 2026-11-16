'use client'

import { useEffect, useState } from 'react'
import { FiCheck, FiShare2 } from 'react-icons/fi'
import type { MatchImageData } from '@/lib/match-image'

type CopyState = 'idle' | 'working' | 'copied' | 'shared' | 'downloaded' | 'error'

export type CopyMatchImageButtonProps = { data: MatchImageData; variant?: 'text' | 'action'; className?: string }

const FILE_NAME = 'partido.png'
const RESET_AFTER_MS = 2500

const TEXT_BUTTON_CLASS =
  'rounded text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60'

const BUTTON_LABELS: Record<CopyState, string> = {
  idle: 'Compartir partido',
  working: 'Compartir partido',
  copied: 'Copiada',
  shared: 'Compartido',
  downloaded: 'Compartir partido',
  error: 'Compartir partido',
}

const ACTION_LABELS: Record<CopyState, string> = {
  idle: 'Compartir',
  working: 'Compartir',
  copied: 'Copiada',
  shared: 'Compartido',
  downloaded: 'Compartir',
  error: 'Compartir',
}

const STATUS_MESSAGES: Record<CopyState, string> = {
  idle: '',
  working: 'Generando la imagen…',
  copied: 'Imagen copiada. Pegala en Slack o WhatsApp.',
  shared: '',
  downloaded: 'No se pudo copiar, así que la imagen se descargó.',
  error: 'No se pudo generar la imagen. Probá de nuevo.',
}

async function fetchMatchImage(data: MatchImageData): Promise<Blob> {
  const res = await fetch('/api/match-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`match image: ${res.status}`)
  return res.blob()
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = FILE_NAME
  link.click()
  URL.revokeObjectURL(url)
}

function prefersShareSheet(): boolean {
  return typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches
}

export default function CopyMatchImageButton({ data, variant = 'text', className }: CopyMatchImageButtonProps) {
  const [state, setState] = useState<CopyState>('idle')

  useEffect(() => {
    if (state === 'idle' || state === 'working') return
    const timeout = window.setTimeout(() => setState('idle'), RESET_AFTER_MS)
    return () => window.clearTimeout(timeout)
  }, [state])

  const handleClick = async () => {
    setState('working')
    const image = fetchMatchImage(data)
    try {
      if (prefersShareSheet()) {
        const file = new File([await image], FILE_NAME, { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file] })
          setState('shared')
          return
        }
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': image })])
      setState('copied')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setState('idle')
        return
      }
      try {
        downloadBlob(await image)
        setState('downloaded')
      } catch {
        setState('error')
      }
    }
  }

  const message = STATUS_MESSAGES[state]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'working'}
        aria-busy={state === 'working'}
        aria-label={variant === 'action' ? 'Compartir partido' : undefined}
        className={className ?? TEXT_BUTTON_CLASS}
      >
        {variant === 'text' ? (
          BUTTON_LABELS[state]
        ) : (
          <>
            {state === 'copied' || state === 'shared' ? (
              <FiCheck className="h-[18px] w-[18px] sm:h-4 sm:w-4" aria-hidden />
            ) : (
              <FiShare2 className="h-[18px] w-[18px] sm:h-4 sm:w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">{ACTION_LABELS[state]}</span>
          </>
        )}
      </button>
      <p
        role="status"
        aria-live="polite"
        className={`absolute top-full right-0 z-10 mt-1 w-max max-w-64 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg ${message ? '' : 'sr-only'}`}
      >
        {message}
      </p>
    </div>
  )
}
