const MINUTE_IN_MS = 60_000

export function getTimeAgo(date: Date): string {
  const minutesAgo = Math.floor((Date.now() - date.getTime()) / MINUTE_IN_MS)
  const hoursAgo = Math.floor(minutesAgo / 60)
  const daysAgo = Math.floor(hoursAgo / 24)

  if (minutesAgo < 1) return 'Recién'
  if (hoursAgo < 1) return `Hace ${minutesAgo} min`
  if (daysAgo < 1) return `Hace ${hoursAgo} h`
  return `Hace ${daysAgo} d`
}
