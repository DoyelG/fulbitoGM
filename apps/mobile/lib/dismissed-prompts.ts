import AsyncStorage from '@react-native-async-storage/async-storage'

export async function isPromptDismissed(storageKey: string): Promise<boolean> {
  return (await AsyncStorage.getItem(storageKey)) === 'true'
}

export async function dismissPrompt(storageKey: string): Promise<void> {
  await AsyncStorage.setItem(storageKey, 'true')
}
