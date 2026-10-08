import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  runTransaction,
  Timestamp,
} from 'firebase/firestore'
import type { Role, RoleRequest, RoleRequestStatus, RoleRequestType } from '@fulbito/types'

type RoleRequestDoc = {
  userId: string
  requestedRole: RoleRequestType
  playerId?: string | null
  newPlayerName?: string | null
  status: RoleRequestStatus
  resolvedAt?: Timestamp | null
  resolvedBy?: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export function docToRoleRequest(id: string, data: RoleRequestDoc): RoleRequest {
  const { userId, requestedRole, playerId, newPlayerName, status, resolvedAt, resolvedBy, createdAt, updatedAt } = data
  return {
    id,
    userId,
    requestedRole,
    playerId: playerId ?? undefined,
    newPlayerName: newPlayerName ?? undefined,
    status,
    resolvedAt: resolvedAt?.toDate(),
    resolvedBy: resolvedBy ?? undefined,
    createdAt: createdAt.toDate(),
    updatedAt: updatedAt.toDate(),
  }
}

type CreateRoleRequestInput = {
  userId: string
  userEmail: string
  requestedRole: RoleRequestType
  playerId?: string
  newPlayerName?: string
}

export async function createRoleRequest(input: CreateRoleRequestInput): Promise<string> {
  const { userId, userEmail, requestedRole, playerId, newPlayerName } = input

  if (requestedRole === 'PLAYER' && Boolean(playerId) === Boolean(newPlayerName)) {
    throw new Error('A player request needs only a player id or a new player name')
  }
  if (requestedRole === 'ADMIN' && (playerId || newPlayerName)) {
    throw new Error('An admin request cannot have a player')
  }

  const db = getFirestore()

  const existingPendingRequests = await getDocs(
    query(
      collection(db, 'roleRequests'),
      where('userId', '==', userId),
      where('requestedRole', '==', requestedRole),
      where('status', '==', 'pending'),
    ),
  )
  if (!existingPendingRequests.empty) throw new Error('You already have a pending request')

  let playerName = newPlayerName
  if (playerId) {
    const playerDocument = await getDoc(doc(db, 'players', playerId))
    if (!playerDocument.exists()) throw new Error('Player not found')
    playerName = playerDocument.get('name')
  }

  const now = Timestamp.now()
  const newRequestRef = doc(collection(db, 'roleRequests'))
  const newNotificationRef = doc(collection(db, 'notifications'))

  const batch = writeBatch(db)
  batch.set(newRequestRef, {
    userId,
    requestedRole,
    playerId: playerId ?? null,
    newPlayerName: newPlayerName ?? null,
    status: 'pending',
    resolvedAt: null,
    resolvedBy: null,
    createdAt: now,
    updatedAt: now,
  })
  batch.set(newNotificationRef, {
    type: 'ROLE_REQUEST',
    audience: 'ADMIN',
    status: 'pending',
    data: {
      requestId: newRequestRef.id,
      userId,
      userEmail,
      requestedRole,
      playerId: playerId ?? null,
      playerName: playerName ?? null,
    },
    resolvedAt: null,
    resolvedBy: null,
    createdAt: now,
  })
  await batch.commit()

  return newRequestRef.id
}

export async function getMyRoleRequests(userId: string): Promise<RoleRequest[]> {
  const db = getFirestore()
  const userRequestDocuments = await getDocs(query(collection(db, 'roleRequests'), where('userId', '==', userId)))
  return userRequestDocuments.docs
    .map((requestDocument) => docToRoleRequest(requestDocument.id, requestDocument.data() as RoleRequestDoc))
    .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
}

export async function resolveRoleRequest(
  requestId: string,
  action: Exclude<RoleRequestStatus, 'pending'>,
  adminId: string,
): Promise<void> {
  const db = getFirestore()
  const requestRef = doc(db, 'roleRequests', requestId)

  const requestDocument = await getDoc(requestRef)
  if (!requestDocument.exists()) throw new Error('Role Request not found')
  const request = docToRoleRequest(requestDocument.id, requestDocument.data() as RoleRequestDoc)

  if (action === 'accepted' && request.playerId) {
    const usersLinkedToPlayer = await getDocs(
      query(collection(db, 'users'), where('linkedPlayerId', '==', request.playerId)),
    )
    if (usersLinkedToPlayer.docs.some((linkedUserDocument) => linkedUserDocument.id !== request.userId)) {
      throw new Error('This player is already linked to another user')
    }
  }

  const requestNotifications = await getDocs(
    query(collection(db, 'notifications'), where('data.requestId', '==', requestId)),
  )

  await runTransaction(db, async (transaction) => {
    const currentRequestDocument = await transaction.get(requestRef)
    if (currentRequestDocument.get('status') !== 'pending') throw new Error('This request was already resolved')

    const userRef = doc(db, 'users', request.userId)
    const userDocument = action === 'accepted' ? await transaction.get(userRef) : null

    const now = Timestamp.now()
    transaction.update(requestRef, { status: action, resolvedAt: now, resolvedBy: adminId, updatedAt: now })
    requestNotifications.docs.forEach((notificationDocument) => {
      transaction.update(notificationDocument.ref, { status: action, resolvedAt: now, resolvedBy: adminId })
    })

    if (action !== 'accepted' || !userDocument) return

    const storedUserRole = userDocument.get('role') as Role[] | Role | undefined
    const currentRoles: Role[] = Array.isArray(storedUserRole)
      ? storedUserRole
      : storedUserRole
        ? [storedUserRole]
        : ['USER']
    const updatedRoles = currentRoles.includes(request.requestedRole)
      ? currentRoles
      : [...currentRoles, request.requestedRole]

    let linkedPlayerId = request.playerId
    if (request.newPlayerName) {
      const newPlayerRef = doc(collection(db, 'players'))
      transaction.set(newPlayerRef, {
        name: request.newPlayerName,
        position: '',
        skill: null,
        skills: null,
        photoUrl: null,
        goalkeeping: null,
        inactive: false,
        createdAt: now,
        updatedAt: now,
      })
      linkedPlayerId = newPlayerRef.id
    }

    transaction.update(userRef, {
      role: updatedRoles,
      ...(linkedPlayerId ? { linkedPlayerId } : {}),
      updatedAt: now,
    })
  })
}
