function isTimestampLike(value: unknown): value is { toDate(): Date } {
  return typeof value === 'object' && value !== null && typeof (value as { toDate?: unknown }).toDate === 'function'
}

export function toDate(value: unknown): Date {
  if (isTimestampLike(value)) return value.toDate()
  const parsed = new Date(value as string)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

export function toOptionalDate(value: unknown): Date | undefined {
  return value === null || value === undefined ? undefined : toDate(value)
}
