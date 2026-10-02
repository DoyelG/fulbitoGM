export type CardTone = 'brand' | 'accent' | 'night'

export const CARD_TONE: Record<CardTone, { border: string; badge: string }> = {
  brand: { border: 'border-t-brand', badge: 'bg-brand/10' },
  accent: { border: 'border-t-accent', badge: 'bg-accent/15' },
  night: { border: 'border-t-night', badge: 'bg-night/10' },
}
