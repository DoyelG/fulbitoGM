import { getMessaging, getToken, onTokenRefresh } from '@react-native-firebase/messaging'
import { deleteDoc, doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore'
import { Platform } from 'react-native'
import notifee, { AuthorizationStatus } from 'react-native-notify-kit'

export type PushRegistrationStatus = 'pending' | 'registered' | 'denied' | 'error'

const platform = Platform.OS === 'ios' ? 'ios' : 'android'

function deviceRef(userId: string, token: string) {
  return doc(getFirestore(), 'users', userId, 'devices', token)
}

async function savePushToken(userId: string, token: string): Promise<void> {
  await setDoc(deviceRef(userId, token), { platform, updatedAt: Timestamp.now() })
}

export async function registerPushToken(userId: string): Promise<() => void> {
  const messaging = getMessaging()
  let currentToken = await getToken(messaging)
  await savePushToken(userId, currentToken)

  return onTokenRefresh(messaging, (newToken) => {
    const previousToken = currentToken
    currentToken = newToken
    savePushToken(userId, newToken)
      .then(() => deleteDoc(deviceRef(userId, previousToken)))
      .catch(() => undefined)
  })
}

export async function requestPushPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission()
  return settings.authorizationStatus !== AuthorizationStatus.DENIED
}

export async function unregisterPushToken(userId: string): Promise<void> {
  try {
    await deleteDoc(deviceRef(userId, await getToken(getMessaging())))
  } catch {
    return
  }
}
