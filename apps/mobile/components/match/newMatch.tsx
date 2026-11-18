import { isOpen, type Match, type MatchInput, type OpenMatchInput } from '@fulbito/types'
import { splitSignups } from '@fulbito/utils'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Alert } from 'react-native'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useMyPlayerId } from '@/contexts/TournamentContext'
import { useMatchesData } from '@/hooks/use-matches-data'

import { MatchForm } from './matchForm'

export function NewMatch() {
  const router = useRouter()
  const { openMatchId } = useLocalSearchParams<{ openMatchId?: string }>()
  const { players, matches, addMatch, addOpenMatch, convertOpenMatch } = useMatchesData()
  const { user } = useFirebaseAuth()
  const myPlayerId = useMyPlayerId()
  const [saving, setSaving] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const openMatch = useMemo(() => {
    const found = openMatchId ? matches.find((match) => match.id === openMatchId) : undefined
    return found && isOpen(found) ? found : null
  }, [matches, openMatchId])

  const conversionSeed: Match | undefined = useMemo(
    () => (openMatch ? { ...openMatch, teamA: [], teamB: [] } : undefined),
    [openMatch],
  )

  const finish = (matchId: string) => {
    setFormKey((k) => k + 1)
    router.navigate({ pathname: '/(tabs)/history/[id]', params: { id: matchId } })
  }

  const handleCancel = () => {
    setFormKey((k) => k + 1)
    router.navigate('/(tabs)/history')
  }

  const save = async (action: () => Promise<string>) => {
    setSaving(true)
    try {
      finish(await action())
    } catch {
      Alert.alert('No se pudo guardar el partido', 'Revisá tu conexión e intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MatchForm
      key={`${formKey}-${openMatch?.id ?? 'new'}`}
      mode="create"
      initial={conversionSeed}
      initialPoolIds={openMatch ? splitSignups(openMatch).confirmed : undefined}
      convertingOpenMatch={openMatch !== null}
      players={players}
      allMatches={matches}
      saving={saving}
      onSave={(m: MatchInput) =>
        save(async () => {
          if (!openMatch) return addMatch(m)
          await convertOpenMatch(openMatch.id, m)
          return openMatch.id
        })
      }
      onSaveOpen={(m: OpenMatchInput) =>
        save(() => {
          if (!user) return Promise.reject(new Error('Sesión expirada'))
          const linkedName = players.find((player) => player.id === myPlayerId)?.name
          return addOpenMatch(m, { uid: user.uid, name: linkedName || (user.email ?? '').split('@')[0] || 'Admin' })
        })
      }
      onCancel={handleCancel}
    />
  )
}
