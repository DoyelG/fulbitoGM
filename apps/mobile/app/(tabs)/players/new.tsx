import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { addDoc, collection, doc, Timestamp, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useCallback, useState } from 'react'
import { Alert, Linking, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayerCreateForm, type PlayerCreateFormValues } from '@/components/players/new/player-create-form'
import { usePlayersData } from '@/hooks/use-players-data'
import { useAppTheme } from '@/hooks/use-theme'
import { db, storage } from '@/lib/firebase'

export default function NewPlayerScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { reload } = usePlayersData()

  const [values, setValues] = useState<PlayerCreateFormValues>({
    name: '',
    position: 'PLAYER',
    physical: 5,
    technical: 5,
    tactical: 5,
    psychological: 5,
  })
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handlePickPhoto = useCallback(async () => {
    const { granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!granted) {
      if (!canAskAgain) {
        Alert.alert(
          'Permiso necesario',
          'Habilitá el acceso a tus fotos desde la configuración del dispositivo para poder elegir una imagen.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configuración', onPress: () => Linking.openSettings() },
          ],
        )
        return
      }
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para elegir una imagen.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri)
    }
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const skills = {
        physical: values.physical,
        technical: values.technical,
        tactical: values.tactical,
        psychological: values.psychological,
      }
      const skill = (skills.physical + skills.technical + skills.tactical + skills.psychological) / 4
      const now = Timestamp.now()

      const docRef = await addDoc(collection(db, 'players'), {
        name: values.name.trim(),
        position: values.position,
        skills,
        skill,
        goalkeeping: Math.round(skill),
        createdAt: now,
        updatedAt: now,
      })

      if (photoUri) {
        const response = await fetch(photoUri)
        const blob = await response.blob()
        const storageRef = ref(storage, `players/${docRef.id}.jpg`)
        await uploadBytes(storageRef, blob)
        const photoUrl = await getDownloadURL(storageRef)
        await updateDoc(doc(db, 'players', docRef.id), { photoUrl })
      }

      await reload()
      router.back()
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear el jugador.')
    } finally {
      setSaving(false)
    }
  }, [values, photoUri, reload, router])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <PlayerCreateForm
        values={values}
        onChange={setValues}
        photoUri={photoUri}
        onPickPhoto={() => handlePickPhoto()}
        saving={saving}
        onSave={() => handleSave()}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
})
