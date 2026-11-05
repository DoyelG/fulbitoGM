import Feather from '@expo/vector-icons/Feather'
import { resendVerificationEmail } from '@fulbito/firebase'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { ProfileButton } from '@/components/profile/profile-button'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './notice.styles'

type Status = { tone: 'info' | 'error'; text: string }

export function VerifyEmailNotice({ email }: { email: string }) {
  const { colors } = useAppTheme()
  const { refreshUser } = useFirebaseAuth()
  const [isBusy, setIsBusy] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)

  const run = async (action: () => Promise<Status | null>) => {
    setIsBusy(true)
    setStatus(null)
    try {
      setStatus(await action())
    } catch {
      setStatus({ tone: 'error', text: 'No se pudo completar la acción. Intentá de nuevo en un rato.' })
    } finally {
      setIsBusy(false)
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
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.warning }]}>
      <View style={styles.titleRow}>
        <Feather name="mail" size={18} color={colors.warning} accessible={false} />
        <Text style={[styles.cardTitle, { color: colors.text }]} accessibilityRole="header">
          Verificá tu email para ver tus torneos
        </Text>
      </View>
      <Text style={[styles.text, { color: colors.muted }]}>
        Te mandamos un link a <Text style={[styles.strong, { color: colors.text }]}>{email}</Text>. Para crear torneos y
        ver tus torneos e invitaciones necesitás tener el email verificado.
      </Text>
      <View style={[styles.actions, styles.actionsCentered]}>
        <ProfileButton label="Reenviar email" variant="secondary" onPress={() => void resend()} disabled={isBusy} />
        <ProfileButton label="Ya lo verifiqué" onPress={() => void checkVerified()} disabled={isBusy} />
      </View>
      {status && (
        <Text
          style={[styles.status, { color: status.tone === 'error' ? colors.danger : colors.text }]}
          accessibilityLiveRegion="polite"
        >
          {status.text}
        </Text>
      )}
    </View>
  )
}
