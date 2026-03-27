export type SharedBadgeTone = 'neutral' | 'success' | 'warning'

export interface SharedBadgeProps {
  title: string
  description: string
  tone?: SharedBadgeTone
}
