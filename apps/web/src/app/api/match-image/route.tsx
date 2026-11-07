import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { parseMatchImageData, type MatchImageTeam } from '@/lib/match-image'
import { loadTournamentLogo } from './tournament-logo'

const WIDTH = 1200
const HEADER_HEIGHT = 250
const LOGO_SIZE = 150
const TEAM_CHROME_HEIGHT = 240
const PLAYER_ROW_HEIGHT = 66

const IMAGE_COLORS = {
  primary: '#4c1d95',
  primaryGlow: '#7c3aed',
  night: '#0f0a1e',
  secondary: '#f97316',
  secondaryText: '#c2410c',
  card: '#ffffff',
  row: '#f3f4f6',
  text: '#111827',
  muted: '#4b5563',
  onPrimary: '#ffffff',
}

const fontsPromise = Promise.all(
  ['Montserrat_500Medium.ttf', 'Montserrat_800ExtraBold.ttf'].map((file) =>
    readFile(join(process.cwd(), 'assets/fonts', file)),
  ),
)

function Team({ team, accent }: { team: MatchImageTeam; accent: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: 28,
        borderRadius: 24,
        background: IMAGE_COLORS.card,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', fontSize: 34, fontWeight: 800, color: accent }}>
        {team.title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20 }}>
        {team.players.map((player, index) => (
          <div
            key={`${player.name}-${index}`}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 54,
              marginBottom: 12,
              borderRadius: 14,
              background: IMAGE_COLORS.row,
              fontSize: 28,
              fontWeight: 800,
              color: IMAGE_COLORS.text,
            }}
          >
            {player.name}
            {player.isGoalkeeper && (
              <span style={{ marginLeft: 12, fontSize: 20, fontWeight: 500, color: IMAGE_COLORS.muted }}>
                (arquero)
              </span>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          marginTop: 8,
          padding: '14px 0',
          borderRadius: 14,
          background: IMAGE_COLORS.row,
          fontSize: 28,
          fontWeight: 800,
          color: IMAGE_COLORS.text,
        }}
      >
        <span>{`🧠 ${team.skill}`}</span>
        <span>{`💪 ${team.physical}`}</span>
        <span>{`🏆 ${team.winProbability}%`}</span>
      </div>
    </div>
  )
}

export async function POST(request: Request) {
  const data = parseMatchImageData(await request.json().catch(() => null))
  if (!data) return new Response('Invalid match', { status: 400 })

  const [[medium, extraBold], logo] = await Promise.all([fontsPromise, loadTournamentLogo(data.tournamentPhotoUrl)])
  const rows = Math.max(data.teamA.players.length, data.teamB.players.length, 1)
  const height = HEADER_HEIGHT + TEAM_CHROME_HEIGHT + rows * PLAYER_ROW_HEIGHT
  const when = data.hourLabel ? `${data.dateLabel} · ${data.hourLabel}` : data.dateLabel
  const place = [data.location, data.address].filter(Boolean).join(' · ')
  const details = [data.typeLabel, data.shirtsName && `Lava las remeras: ${data.shirtsName}`].filter(Boolean)

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at 50% -20%, ${IMAGE_COLORS.primaryGlow}, transparent 55%), linear-gradient(160deg, ${IMAGE_COLORS.primary}, ${IMAGE_COLORS.night})`,
        fontFamily: 'Montserrat',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          height: HEADER_HEIGHT,
          padding: '0 56px',
          color: IMAGE_COLORS.onPrimary,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>{data.name}</div>
          <div
            style={{
              display: 'flex',
              marginTop: 4,
              fontSize: 34,
              fontWeight: 800,
              lineHeight: 1.2,
              color: IMAGE_COLORS.secondary,
            }}
          >
            {when}
          </div>
          {place && (
            <div style={{ display: 'flex', marginTop: 16, fontSize: 26, fontWeight: 800, lineHeight: 1.3 }}>
              {`📍 ${place}`}
            </div>
          )}
          {details.length > 0 && (
            <div
              style={{
                display: 'flex',
                marginTop: place ? 4 : 16,
                fontSize: 24,
                fontWeight: 500,
                lineHeight: 1.3,
                opacity: 0.85,
              }}
            >
              {details.join(' · ')}
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            flexShrink: 0,
            overflow: 'hidden',
            borderRadius: LOGO_SIZE / 2,
            border: `4px solid ${IMAGE_COLORS.onPrimary}`,
            background: IMAGE_COLORS.onPrimary,
            fontSize: 72,
          }}
        >
          {logo ? <img src={logo} alt="" width={LOGO_SIZE} height={LOGO_SIZE} style={{ objectFit: 'cover' }} /> : '🏆'}
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, gap: 28, padding: '8px 56px 44px' }}>
        <Team team={data.teamA} accent={IMAGE_COLORS.primary} />
        <Team team={data.teamB} accent={IMAGE_COLORS.secondaryText} />
      </div>
    </div>,
    {
      width: WIDTH,
      height,
      fonts: [
        { name: 'Montserrat', data: medium, weight: 500, style: 'normal' },
        { name: 'Montserrat', data: extraBold, weight: 800, style: 'normal' },
      ],
    },
  )
}
