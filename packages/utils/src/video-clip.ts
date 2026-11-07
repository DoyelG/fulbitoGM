import type { VideoClip } from '@fulbito/types'

export function canDeleteVideoClip(clip: VideoClip, userId: string | undefined, canManage: boolean): boolean {
  return canManage || (userId !== undefined && clip.createdBy === userId)
}
