import type { Match } from '@fulbito/types'
import notifee, { AndroidImportance, TriggerType } from 'react-native-notify-kit'

import { ensureNotificationChannels, NOTIFICATION_ANDROID_STYLE } from '@/lib/notifications/channels'

// eslint-comment-disable-next-line @typescript-eslint/no-unused-vars TODO: check with a current match if the reminder is already scheduled and update it if the time has changed
const REMINDER_ID_PREFIX = 'match-reminder-'
const ONE_HOUR_IN_MS = 60 * 60 * 1000

function reminderIdFor(matchId: string): string {
  return `${REMINDER_ID_PREFIX}${matchId}`
}

function reminderTimeFor(match: Match): number | null {
  if (match.status === 'draft' || !match.hasTime) return null
  const reminderTime = new Date(match.date).getTime() - ONE_HOUR_IN_MS
  return reminderTime > Date.now() ? reminderTime : null
}

function reminderBodyFor(match: Match): string {
  const place = match.location?.name
  const title = match.name ?? 'Tu partido'
  return place ? `${title} · ${place}` : title
}

async function scheduleMatchReminder(match: Match, reminderTime: number): Promise<void> {
  await notifee.createTriggerNotification(
    {
      id: reminderIdFor(match.id),
      title: 'Tu partido empieza en 1 hora',
      body: reminderBodyFor(match),
      data: { matchId: match.id },
      android: { ...NOTIFICATION_ANDROID_STYLE, importance: AndroidImportance.HIGH },
    },
    { type: TriggerType.TIMESTAMP, timestamp: reminderTime, alarmManager: { allowWhileIdle: true } },
  )
}

export async function syncMatchReminders(matches: Match[], linkedPlayerId: string | undefined): Promise<void> {
  await ensureNotificationChannels()

  const upcomingMatches = new Map<string, { match: Match; reminderTime: number }>()
  if (linkedPlayerId) {
    for (const match of matches) {
      const playsInMatch = [...match.teamA, ...match.teamB].some((player) => player.id === linkedPlayerId)
      const reminderTime = reminderTimeFor(match)
      if (playsInMatch && reminderTime) upcomingMatches.set(reminderIdFor(match.id), { match, reminderTime })
    }
  }

  const scheduled = await notifee.getTriggerNotifications()
  const scheduledIds = new Set(scheduled.map(({ notification }) => notification.id))
  const staleIds = [...scheduledIds].filter(
    (id): id is string => Boolean(id?.startsWith(REMINDER_ID_PREFIX)) && !upcomingMatches.has(id as string),
  )
  if (staleIds.length > 0) await notifee.cancelTriggerNotifications(staleIds)

  await Promise.all(
    [...upcomingMatches.values()].map(({ match, reminderTime }) => scheduleMatchReminder(match, reminderTime)),
  )
}

export async function cancelAllMatchReminders(): Promise<void> {
  const scheduled = await notifee.getTriggerNotifications()
  const ids = scheduled
    .map(({ notification }) => notification.id)
    .filter((id): id is string => Boolean(id?.startsWith(REMINDER_ID_PREFIX)))
  if (ids.length > 0) await notifee.cancelTriggerNotifications(ids)
}
