import * as ImagePicker from 'expo-image-picker'
import { useCallback } from 'react'
import { Alert, Linking } from 'react-native'

export function usePickPhoto(): () => Promise<string | null> {
  return useCallback(async () => {
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
        return null
      }
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para elegir una imagen.')
      return null
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    return result.canceled ? null : (result.assets[0]?.uri ?? null)
  }, [])
}
