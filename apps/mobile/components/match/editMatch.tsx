import { useNavigation, useRouter } from 'expo-router'
import { useLayoutEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useMatchesData } from '@/hooks/use-matches-data'
import { useAppTheme } from '@/hooks/use-theme'

import { MatchForm } from './matchForm'

type Props = {
  matchId: string
}

export function EditMatch({ matchId }: Props) {
  const router = useRouter()
  const navigation = useNavigation()
  const { colors } = useAppTheme()
  const { players, matches, loading, updateMatch } = useMatchesData()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')

  const match = useMemo(() => matches.find((m) => m.id === matchId), [matches, matchId])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title.trim() || match?.name || 'Editar partido',
    })
  }, [navigation, title, match?.name])

  if (loading || !match) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    )
  }

  return (
    <MatchForm
      mode="edit"
      initial={match}
      players={players}
      allMatches={matches}
      saving={saving}
      onTitleChange={setTitle}
      onSave={async (m) => {
        setSaving(true)
        try {
          await updateMatch(matchId, m)
          router.back()
        } finally {
          setSaving(false)
        }
      }}
      onCancel={() => router.back()}
    />
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
