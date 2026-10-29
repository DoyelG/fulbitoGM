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
  await deleteObject(storageRef).catch(() => undefined)
}

export const TOURNAMENT_PHOTO_MAX_BYTES = 5 * 1024 * 1024

export async function uploadTournamentPhoto(file: File | Blob, tournamentId: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('The tournament photo must be an image')
  if (file.size > TOURNAMENT_PHOTO_MAX_BYTES) throw new Error('The tournament photo must be at most 5 MB')
  const storage = getStorage()
  const storageRef = ref(storage, `tournaments/${tournamentId}/${crypto.randomUUID()}`)
  await uploadBytes(storageRef, file, { contentType: file.type })
  return getDownloadURL(storageRef)
}

export async function deleteTournamentPhoto(photoUrl: string): Promise<void> {
  const storage = getStorage()
  await deleteObject(ref(storage, photoUrl)).catch(() => undefined)
}
