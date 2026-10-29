import AsyncStorage from '@react-native-async-storage/async-storage'

export async function isPromptDismissed(storageKey: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(storageKey)) === 'true'
  } catch {
    return false
  }
}

export async function dismissPrompt(storageKey: string): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey, 'true')
  } catch {
    return
  }
}
