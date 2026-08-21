import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'

import { useMatchesData } from '@/hooks/use-matches-data'

import { MatchForm } from './matchForm'

export function NewMatch() {
  const router = useRouter()
  const { players, matches, addMatch } = useMatchesData()
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const handleCancel = () => {
    setFormKey((k) => k + 1)
    router.navigate('/(tabs)/history')
  }

  return (
    <MatchForm
      key={formKey}
      mode="create"
      players={players}
      allMatches={matches}
      saving={saving}
      onSave={async (m) => {
        setSaving(true)
        try {
          await addMatch(m)
          setFormKey((k) => k + 1)
          router.navigate('/(tabs)/history')
        } catch {
          Alert.alert('No se pudo crear el partido', 'Revisá tu conexión e intentá de nuevo.')
        } finally {
          setSaving(false)
        }
      }}
      onCancel={handleCancel}
    />
  )
}
