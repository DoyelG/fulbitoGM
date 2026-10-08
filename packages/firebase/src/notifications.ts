import { getFirestore, collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import type { NotificationAudience, RoleRequestNotification, RoleRequestStatus, RoleRequestType } from '@fulbito/types'

type RoleRequestNotificationDoc = {
  audience: NotificationAudience
  status: RoleRequestStatus
  data: {
    requestId: string
    userId: string
    userEmail: string
    requestedRole: RoleRequestType
    playerId?: string | null
    playerName?: string | null
  }
  resolvedAt?: Timestamp | null
  resolvedBy?: string | null
  createdAt: Timestamp
}

export function docToRoleRequestNotification(
  id: string,
  document: RoleRequestNotificationDoc,
): RoleRequestNotification {
  const { audience, status, data, resolvedAt, resolvedBy, createdAt } = document
  return {
    id,
    type: 'ROLE_REQUEST',
    audience,
    status,
    data: {
      ...data,
      playerId: data.playerId ?? undefined,
      playerName: data.playerName ?? undefined,
    },
    resolvedAt: resolvedAt?.toDate(),
    resolvedBy: resolvedBy ?? undefined,
    createdAt: createdAt.toDate(),
  }
}

export async function getPendingNotifications(): Promise<RoleRequestNotification[]> {
  const db = getFirestore()
  const pendingNotificationDocuments = await getDocs(
    query(collection(db, 'notifications'), where('audience', '==', 'ADMIN'), where('status', '==', 'pending')),
  )
  return pendingNotificationDocuments.docs
    .map((notificationDocument) =>
      docToRoleRequestNotification(notificationDocument.id, notificationDocument.data() as RoleRequestNotificationDoc),
    )
    .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
}
