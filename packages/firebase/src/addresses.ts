import type { Address } from '@fulbito/types'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

const COLLECTION = 'addresses'

function docToAddress(id: string, data: Record<string, unknown>): Address {
  return {
    id,
    tournamentId: typeof data.tournamentId === 'string' ? data.tournamentId : '',
    name: data.name as string,
    street: data.street as string,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt as string),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt as string),
  }
}

export async function getAddresses(tournamentId: string): Promise<Address[]> {
  const db = getFirestore()
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('tournamentId', '==', tournamentId), orderBy('name')),
  )
  return snap.docs.map((addressDoc) => docToAddress(addressDoc.id, addressDoc.data()))
}

export type AddressInput = Omit<Address, 'id' | 'tournamentId' | 'createdAt' | 'updatedAt'>

export async function createAddress(tournamentId: string, data: AddressInput): Promise<string> {
  const db = getFirestore()
  const ref = await addDoc(collection(db, COLLECTION), {
    tournamentId,
    name: data.name,
    street: data.street,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return ref.id
}

export async function updateAddress(id: string, data: Partial<AddressInput>): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: Timestamp.now() })
}

export async function deleteAddress(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, COLLECTION, id))
}
