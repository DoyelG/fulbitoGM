import { useNavigation, useRouter } from 'expo-router'
import { useLayoutEffect, useState } from 'react'

import { useMatchesData } from '@/hooks/use-matches-data'

import { MatchForm } from './matchForm'

export function NewMatch() {
  const router = useRouter()
  const navigation = useNavigation()
  const { players, matches, addMatch } = useMatchesData()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [formKey, setFormKey] = useState(0)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: title.trim() || 'Nuevo partido',
    })
  }, [navigation, title])

  const handleCancel = () => {
    setFormKey((k) => k + 1)
    setTitle('')
    router.navigate('/(tabs)/history')
  }

  return (
    <MatchForm
      key={formKey}
      mode="create"
      players={players}
      allMatches={matches}
      saving={saving}
      onTitleChange={setTitle}
      onSave={async (m) => {
        setSaving(true)
        try {
          await addMatch(m)
          setFormKey((k) => k + 1)
          setTitle('')
          router.navigate('/(tabs)/history')
        } finally {
          setSaving(false)
        }
      }}
      onCancel={handleCancel}
    />
  )
}
