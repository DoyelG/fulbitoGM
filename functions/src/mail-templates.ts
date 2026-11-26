import { APP_NAME, escapeHtml, renderLayout, type RenderedMail } from './mail-layout'

export const MAIL_TEMPLATES = ['PLAYER_LINK_ACCEPTED'] as const

export type MailTemplate = (typeof MAIL_TEMPLATES)[number]

export class MailTemplateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MailTemplateError'
  }
}

function readString(data: Record<string, unknown>, key: string): string {
  const value = data[key]
  if (typeof value !== 'string') throw new MailTemplateError(`Missing "${key}" in mail data`)
  return value
}

function renderPlayerLinkAccepted(data: Record<string, unknown>, appUrl: string): RenderedMail {
  const playerName = readString(data, 'playerName')
  const tournamentName = typeof data['tournamentName'] === 'string' ? data['tournamentName'] : ''

  const highlights = [{ label: 'Jugador', value: playerName }]
  if (tournamentName) highlights.push({ label: 'Torneo', value: tournamentName })

  const where = tournamentName ? ` del torneo ${tournamentName}` : ''
  return {
    subject: 'Tu vinculación con el jugador fue aceptada',
    text: `¡Tu solicitud fue aceptada! Ya estás vinculado al jugador ${playerName}${where} en ${APP_NAME}. Entrá a ${appUrl} para ver tus estadísticas.`,
    html: renderLayout({
      appUrl,
      preheader: `Ya estás vinculado a ${playerName}`,
      heading: '¡Vinculación aceptada!',
      paragraphs: [
        'Un organizador aceptó tu solicitud. Desde ahora tus partidos y estadísticas quedan asociados a tu cuenta.',
        `Ya podés entrar a ${escapeHtml(APP_NAME)} y ver cómo te va.`,
      ],
      highlights,
      cta: { label: `Abrir ${APP_NAME}` },
    }),
  }
}

export function isMailTemplate(value: unknown): value is MailTemplate {
  return MAIL_TEMPLATES.some((template) => template === value)
}

export function renderMail(template: MailTemplate, data: Record<string, unknown>, appUrl: string): RenderedMail {
  switch (template) {
    case 'PLAYER_LINK_ACCEPTED':
      return renderPlayerLinkAccepted(data, appUrl)
  }
}
