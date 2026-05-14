import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export async function uploadPlayerPhoto(file: File | Blob, playerId: string): Promise<string> {
  const storage = getStorage()
  const storageRef = ref(storage, `players/${playerId}.jpg`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deletePlayerPhoto(playerId: string): Promise<void> {
  const storage = getStorage()
  const storageRef = ref(storage, `players/${playerId}.jpg`)
  try {
    await deleteObject(storageRef)
  } catch {
    // ignore if file doesn't exist
  }
}
