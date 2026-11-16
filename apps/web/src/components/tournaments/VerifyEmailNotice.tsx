'use client'

import { useState } from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import { resendVerificationEmail } from '@fulbito/firebase'
import Button from '@/components/Button'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

type Status = { tone: 'info' | 'error'; text: string }

export default function VerifyEmailNotice({ email }: { email: string }) {
  const { refreshUser } = useFirebaseAuth()
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)

  const run = async (action: () => Promise<Status | null>) => {
    setBusy(true)
    setStatus(null)
    try {
      setStatus(await action())
    } catch {
      setStatus({ tone: 'error', text: 'No se pudo completar la acción. Intentá de nuevo en un rato.' })
    } finally {
      setBusy(false)
    }
  }

  const resend = () =>
    run(async () => {
      await resendVerificationEmail()
      return { tone: 'info', text: `Te mandamos un email a ${email}.` }
    })

  const checkVerified = () =>
    run(async () => {
      await refreshUser()
      return { tone: 'info', text: 'Todavía no está verificado. Abrí el link del email y probá de nuevo.' }
    })

  return (
    <section aria-labelledby="verify-email-title" className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <h2 id="verify-email-title" className="flex items-center gap-2 font-semibold text-gray-900">
        <EnvelopeIcon className="h-5 w-5 text-amber-700" aria-hidden />
        Verificá tu email para ver tus torneos
      </h2>
      <p className="mt-1 text-sm text-gray-800">
        Te mandamos un link a <span className="font-medium">{email}</span>. Para crear torneos y ver tus torneos e
        invitaciones necesitás tener el email verificado.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={busy} onClick={resend}>
          Reenviar email
        </Button>
        <Button type="button" disabled={busy} aria-busy={busy} onClick={checkVerified}>
          Ya lo verifiqué
        </Button>
      </div>
      {status && (
        <p
          role={status.tone === 'error' ? 'alert' : 'status'}
          className={`mt-3 text-sm ${status.tone === 'error' ? 'text-orange-700' : 'text-gray-800'}`}
        >
          {status.text}
        </p>
      )}
    </section>
  )
}
