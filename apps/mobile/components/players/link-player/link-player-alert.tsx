import Feather from '@expo/vector-icons/Feather'
import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { dismissPrompt, isPromptDismissed } from '@/lib/dismissed-prompts'
import { useAppTheme } from '@/hooks/use-theme'

import LinkPlayerFlow, { linkPlayerStepTitles, type LinkPlayerStep } from './link-player-flow'
import { styles } from './link-player-alert.styles'

export default function LinkPlayerAlert() {
  const { user } = useFirebaseAuth()
  const { colors } = useAppTheme()
  const [isAlertDismissed, setIsAlertDismissed] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState<LinkPlayerStep>('select')

  const userId = user?.uid
  const isLinked = Boolean(user?.linkedPlayerId)
  const alertStorageKey = `linkPlayerAlertDismissed:${userId}`
  const modalStorageKey = `linkPlayerPromptDismissed:${userId}`

  useEffect(() => {
    if (!userId || isLinked) return
    let isCancelled = false
    void isPromptDismissed(alertStorageKey).then((isDismissed) => {
      if (!isCancelled) setIsAlertDismissed(isDismissed)
    })
    return () => {
      isCancelled = true
    }
  }, [userId, isLinked, alertStorageKey])

  if (!user || isLinked) return null

  const dismissAlert = () => {
    void dismissPrompt(alertStorageKey)
    setIsAlertDismissed(true)
  }

  const handleRequestSent = () => {
    void dismissPrompt(modalStorageKey)
    dismissAlert()
  }

  return (
    <>
      {!isAlertDismissed && (
        <View style={[styles.container, { backgroundColor: colors.brandSoft }]} accessibilityLiveRegion="polite">
          <View style={styles.textWrap}>
            <Text style={[styles.text, { color: colors.text }]}>
              ¿Necesitás vincular tu cuenta con algún jugador?{' '}
              <Text
                style={[styles.link, { color: colors.brand }]}
                onPress={() => setIsModalOpen(true)}
                accessibilityRole="link"
                accessibilityLabel="Solicitar vinculación con un jugador"
              >
                Solicitalo ahora
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={dismissAlert}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar aviso"
          >
            <Feather name="x" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>
      )}
      <BottomSheet
        visible={isModalOpen}
        title={linkPlayerStepTitles[step]}
        hideTitle={step === 'sent' || step === 'revert'}
        closeLabel="Cerrar"
        onConfirm={() => setIsModalOpen(false)}
      >
        <LinkPlayerFlow
          user={user}
          step={step}
          onStepChange={setStep}
          onAnswerNo={() => setIsModalOpen(false)}
          onRequestSent={handleRequestSent}
          onFinish={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </BottomSheet>
    </>
  )
}
