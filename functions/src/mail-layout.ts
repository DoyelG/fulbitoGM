export const APP_NAME = 'FulbitoApp'

const BRAND = {
  primary: '#4c1d95',
  primaryGlow: '#7c3aed',
  secondary: '#f97316',
  night: '#0b0b1a',
  ink: '#1f1535',
  muted: '#6b6480',
  page: '#f3f0fa',
  card: '#ffffff',
  highlight: '#f6f2ff',
  fontStack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character])
}

export type RenderedMail = {
  subject: string
  text: string
  html: string
}

export type Highlight = {
  label: string
  value: string
}

type LayoutOptions = {
  appUrl: string
  preheader: string
  heading: string
  paragraphs: string[]
  highlights?: Highlight[]
  cta?: { label: string; path?: string }
}

function renderHighlights(highlights: Highlight[]): string {
  const rows = highlights
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:6px 0;font-family:${BRAND.fontStack};">
            <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(label)}</div>
            <div style="font-size:18px;font-weight:700;color:${BRAND.primary};padding-top:2px;">${escapeHtml(value)}</div>
          </td>
        </tr>`,
    )
    .join('')

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;background:${BRAND.highlight};border-left:4px solid ${BRAND.secondary};border-radius:8px;">
      <tr><td style="padding:12px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
      </td></tr>
    </table>`
}

function renderCta(label: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
      <tr><td align="center" bgcolor="${BRAND.primary}" style="border-radius:10px;">
        <a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${BRAND.fontStack};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(label)}</a>
      </td></tr>
    </table>`
}

export function renderLayout(options: LayoutOptions): string {
  const { appUrl, preheader, heading, paragraphs, highlights = [], cta } = options
  const baseUrl = appUrl.replace(/\/+$/, '')
  const body = paragraphs
    .map(
      (paragraph) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${BRAND.ink};">${paragraph}</p>`,
    )
    .join('')

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.page};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.page}">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr><td align="center" bgcolor="${BRAND.primary}" style="background:${BRAND.primary};background-image:linear-gradient(135deg,${BRAND.primary},${BRAND.night});border-radius:16px 16px 0 0;padding:32px 24px;">
            <img src="${baseUrl}/logo-ball.png" width="56" height="56" alt="" style="display:block;margin:0 auto 12px;border:0;" />
            <div style="font-family:${BRAND.fontStack};font-size:24px;font-weight:800;letter-spacing:0.5px;color:#ffffff;">${APP_NAME}</div>
          </td></tr>
          <tr><td height="4" bgcolor="${BRAND.secondary}" style="height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
          <tr><td bgcolor="${BRAND.card}" style="background:${BRAND.card};padding:32px 28px;font-family:${BRAND.fontStack};">
            <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.primary};">${escapeHtml(heading)}</h1>
            ${body}
            ${highlights.length ? renderHighlights(highlights) : ''}
            ${cta ? renderCta(cta.label, `${baseUrl}${cta.path ?? ''}`) : ''}
          </td></tr>
          <tr><td align="center" style="padding:20px 16px;font-family:${BRAND.fontStack};font-size:12px;line-height:1.6;color:${BRAND.muted};">
            Recibiste este email porque tenés una cuenta en ${APP_NAME}.<br />
            Si no esperabas este mensaje, podés ignorarlo.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}
