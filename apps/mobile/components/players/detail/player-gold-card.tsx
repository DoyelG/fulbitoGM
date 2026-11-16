import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Image } from 'expo-image'
import { useState, type ReactNode } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import Svg, {
  Circle,
  Defs,
  G,
  Image as SvgImage,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg'

import { positionShortLabels, splitNameInTwoLines } from '@fulbito/utils'

import { PlayerCardColors, Radii } from '@/constants/theme'

import { AVATAR_SIZE, BADGE_SIZE, CARD_HEIGHT, CARD_WIDTH, styles } from './player-gold-card.styles'

type Props = {
  name: string
  position: string
  overall: number
  skills: { physical: number; technical: number; tactical: number; psychological: number }
  goalkeeping?: number
  photoUrl?: string | null
  tournamentPhotoUrl?: string | null
}

const CARD_PATH =
  'M6 44 Q34 40 40 6 L200 6 Q206 40 234 44 L234 242 C234 260 222 268 204 276 L132 302 Q120 306 108 302 L36 276 C18 268 6 260 6 242 Z'

function CardShape() {
  return (
    <Svg style={styles.shape} viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}>
      <Defs>
        <LinearGradient id="playerCardFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={PlayerCardColors.goldLight} />
          <Stop offset="0.55" stopColor={PlayerCardColors.gold} />
          <Stop offset="1" stopColor={PlayerCardColors.goldDark} />
        </LinearGradient>
        <RadialGradient id="playerCardShine" cx="30%" cy="20%" r="80%">
          <Stop offset="0" stopColor={PlayerCardColors.goldLight} stopOpacity={0.7} />
          <Stop offset="1" stopColor={PlayerCardColors.goldLight} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path d={CARD_PATH} fill="url(#playerCardFill)" />
      <Path d={CARD_PATH} fill="url(#playerCardShine)" />
      <Path d={CARD_PATH} fill="none" stroke={PlayerCardColors.edge} strokeWidth={2} />
    </Svg>
  )
}

function FadeMaskDefs({ id, size, radius = 0 }: { id: string; size: number; radius?: number }) {
  return (
    <Defs>
      <LinearGradient id={`${id}GradientX`} x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="white" stopOpacity={0} />
        <Stop offset="0.11" stopColor="white" stopOpacity={1} />
        <Stop offset="0.89" stopColor="white" stopOpacity={1} />
        <Stop offset="1" stopColor="white" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient id={`${id}GradientY`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="white" stopOpacity={0} />
        <Stop offset="0.11" stopColor="white" stopOpacity={1} />
        <Stop offset="0.89" stopColor="white" stopOpacity={1} />
        <Stop offset="1" stopColor="white" stopOpacity={0} />
      </LinearGradient>
      <Mask id={`${id}X`}>
        <Rect width={size} height={size} rx={radius} fill={`url(#${id}GradientX)`} />
      </Mask>
      <Mask id={`${id}Y`}>
        <Rect width={size} height={size} fill={`url(#${id}GradientY)`} />
      </Mask>
    </Defs>
  )
}

function Faded({ id, children }: { id: string; children: ReactNode }) {
  return (
    <G mask={`url(#${id}Y)`}>
      <G mask={`url(#${id}X)`}>{children}</G>
    </G>
  )
}

function PlayerPhoto({ uri, name }: { uri: string; name: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded'>('loading')

  return (
    <View style={styles.photo}>
      <Svg width={AVATAR_SIZE} height={AVATAR_SIZE}>
        <FadeMaskDefs id="playerPhotoFade" size={AVATAR_SIZE} radius={Radii.lg} />
        <Faded id="playerPhotoFade">
          <SvgImage
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            href={{ uri }}
            preserveAspectRatio="xMidYMid slice"
            onLoad={() => setStatus('loaded')}
          />
        </Faded>
      </Svg>
      {status === 'loading' && (
        <View style={styles.avatarLoading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={PlayerCardColors.edge} accessibilityLabel={`Cargando foto de ${name}`} />
        </View>
      )}
    </View>
  )
}

function Silhouette() {
  return (
    <Svg width={AVATAR_SIZE} height={AVATAR_SIZE} viewBox="0 0 128 128" style={styles.photo}>
      <FadeMaskDefs id="silhouetteFade" size={128} />
      <Faded id="silhouetteFade">
        <G fill={PlayerCardColors.placeholderFg}>
          <Circle cx={64} cy={48} r={22} />
          <Path d="M12 132C12 100 36 78 64 78s52 22 52 54z" />
        </G>
      </Faded>
    </Svg>
  )
}

function CardName({ name }: { name: string }) {
  const [wraps, setWraps] = useState(false)
  const lines = wraps ? splitNameInTwoLines(name) : null

  return (
    <View style={styles.nameBox}>
      <Text
        style={[styles.name, styles.nameMeasure]}
        onTextLayout={(event) => setWraps(event.nativeEvent.lines.length > 1)}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {name}
      </Text>
      <Text style={wraps ? [styles.name, styles.nameTwoLines] : styles.name} numberOfLines={wraps ? 2 : 1}>
        {lines ? `${lines[0]}\n${lines[1]}` : name}
      </Text>
    </View>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  )
}

export function PlayerGoldCard({ name, position, overall, skills, goalkeeping, photoUrl, tournamentPhotoUrl }: Props) {
  const positionLabel: string | undefined = positionShortLabels[position]
  const rating = Math.round(overall)

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="image"
      accessibilityLabel={[name, `general ${rating}`, positionLabel].filter(Boolean).join(', ')}
    >
      <CardShape />
      <View style={styles.content}>
        <View style={styles.ratingBox}>
          <Text style={styles.rating}>{rating}</Text>
          {positionLabel && <Text style={styles.position}>{positionLabel}</Text>}
        </View>
        <View style={styles.badge}>
          {tournamentPhotoUrl ? (
            <Image source={{ uri: tournamentPhotoUrl }} style={styles.badgeImage} contentFit="cover" />
          ) : (
            <MaterialIcons name="emoji-events" size={BADGE_SIZE / 2} color={PlayerCardColors.edge} />
          )}
        </View>

        {photoUrl ? <PlayerPhoto key={photoUrl} uri={photoUrl} name={name} /> : <Silhouette />}

        <CardName key={name} name={name} />

        <View style={styles.statsRow}>
          <Stat label="FÍS" value={skills.physical} />
          <Stat label="TÉC" value={skills.technical} />
          <Stat label="TÁC" value={skills.tactical} />
          <Stat label="MEN" value={skills.psychological} />
          {goalkeeping != null && <Stat label="ARQ" value={goalkeeping} />}
        </View>
      </View>
    </View>
  )
}
