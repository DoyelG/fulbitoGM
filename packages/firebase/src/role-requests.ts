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

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

async function playerNameExists(name: string): Promise<boolean> {
  const playerDocuments = await getDocs(collection(getFirestore(), 'players'))
  const normalizedName = name.trim().toLowerCase()
  return playerDocuments.docs.some(
    (playerDocument) => playerDocument.get('name')?.trim().toLowerCase() === normalizedName,
  )
}

let isCreatingRequest = false

export async function createRoleRequest(input: CreateRoleRequestInput): Promise<string> {
  if (isCreatingRequest) throw new Error('A request is already being created')

  isCreatingRequest = true
  try {
    return await saveRoleRequest(input)
  } finally {
    isCreatingRequest = false
  }
}

async function saveRoleRequest(input: CreateRoleRequestInput): Promise<string> {
  const { userId, userEmail, requestedRole, playerId } = input
  const newPlayerName = input.newPlayerName?.trim()

  if (requestedRole === 'PLAYER' && Boolean(playerId) === Boolean(newPlayerName)) {
    throw new Error('A player request needs only a player id or a new player name')
  }
  if (requestedRole === 'ADMIN' && (playerId || newPlayerName)) {
    throw new Error('An admin request cannot have a player')
  }

  const db = getFirestore()

  if (newPlayerName && (await playerNameExists(newPlayerName))) {
    throw new Error('A player with this name already exists')
  }

  const sameRoleRequests = await getDocs(
    query(collection(db, 'roleRequests'), where('userId', '==', userId), where('requestedRole', '==', requestedRole)),
  )
  if (sameRoleRequests.docs.some((request) => request.get('status') === 'pending')) {
    throw new Error('You already have a pending request')
  }
  // eslint-disable-next-line fulbito/no-comments
  // If the status of the request is "Rejected" and that request was rejected before one day, we throw an error
  const wasRejectedRecently = sameRoleRequests.docs.some(
    (request) =>
      request.get('status') === 'rejected' && Date.now() - request.get('resolvedAt').toMillis() < ONE_DAY_IN_MS,
  )
  if (wasRejectedRecently) throw new Error('You can request this role again after 1 day')

  const userDocument = await getDoc(doc(db, 'users', userId))
  const storedUserRole = userDocument.get('role') as Role[] | Role | undefined
  const currentRoles = Array.isArray(storedUserRole) ? storedUserRole : [storedUserRole]
  if (currentRoles.includes(requestedRole)) throw new Error('You already have this role')
  if (requestedRole === 'PLAYER' && userDocument.get('linkedPlayerId')) {
    throw new Error('You are already linked to a player')
  }

  let playerName = newPlayerName
  if (playerId) {
    const playerDocument = await getDoc(doc(db, 'players', playerId))
    if (!playerDocument.exists()) throw new Error('Player not found')
    playerName = playerDocument.get('name')
  }

  const now = Timestamp.now()
  const newRequestRef = doc(collection(db, 'roleRequests'))
  const newNotificationRef = doc(db, 'notifications', newRequestRef.id)

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

export async function cancelRoleRequest(requestId: string): Promise<void> {
  const db = getFirestore()
  const requestRef = doc(db, 'roleRequests', requestId)
  const notificationRef = doc(db, 'notifications', requestId)

  await runTransaction(db, async (transaction) => {
    const requestDocument = await transaction.get(requestRef)
    if (!requestDocument.exists()) throw new Error('Role Request not found')
    if (requestDocument.get('status') !== 'pending') throw new Error('This request was already resolved')
    transaction.delete(requestRef)
    transaction.delete(notificationRef)
  })
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

  if (action === 'accepted' && request.newPlayerName && (await playerNameExists(request.newPlayerName))) {
    throw new Error('A player with this name already exists')
  }

  const requestNotifications = await getDocs(
    query(collection(db, 'notifications'), where('data.requestId', '==', requestId)),
  )

  await runTransaction(db, async (transaction) => {
    const currentRequestDocument = await transaction.get(requestRef)
    if (currentRequestDocument.get('status') !== 'pending') throw new Error('This request was already resolved')

    const userRef = doc(db, 'users', request.userId)
    const userDocument = action === 'accepted' ? await transaction.get(userRef) : null

    const playerRef = request.playerId ? doc(db, 'players', request.playerId) : null
    const playerDocument = userDocument && playerRef ? await transaction.get(playerRef) : null

    if (playerDocument && !playerDocument.exists()) throw new Error('Player not found')
    const playerLinkedUserId = playerDocument?.get('linkedUserId') as string | undefined
    if (playerLinkedUserId && playerLinkedUserId !== request.userId) {
      throw new Error('This player is already linked to another user')
    }

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
        linkedUserId: request.userId,
        createdAt: now,
        updatedAt: now,
      })
      linkedPlayerId = newPlayerRef.id
    }

    if (playerRef) transaction.update(playerRef, { linkedUserId: request.userId, updatedAt: now })

    transaction.update(userRef, {
      role: updatedRoles,
      ...(linkedPlayerId ? { linkedPlayerId } : {}),
      updatedAt: now,
    })
  })
}
