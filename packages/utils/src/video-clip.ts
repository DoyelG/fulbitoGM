import type { VideoClip } from '@fulbito/types'

export function canDeleteVideoClip(clip: VideoClip, userId: string | undefined, isAdmin: boolean): boolean {
  return isAdmin || (userId !== undefined && clip.createdBy === userId)
}
