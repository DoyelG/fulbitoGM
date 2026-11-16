import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Image } from 'expo-image'
import { Text, View } from 'react-native'
import Svg, {
  Circle,
  ClipPath,
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

import { PlayerCardColors } from '@/constants/theme'

import { BADGE_SIZE, CARD_HEIGHT, CARD_WIDTH, PHOTO_SIZE, PLACEHOLDER_SIZE, styles } from './player-gold-card.styles'

type Props = {
  name: string
  position: string
  overall: number
  skills: { physical: number; technical: number; tactical: number; psychological: number }
  goalkeeping?: number
  photoUrl?: string | null
  tournamentPhotoUrl?: string | null
}

const POSITION_SHORT_LABELS: Record<string, string> = {
  GK: 'ARQ',
  DEF: 'DEF',
  MID: 'MED',
  FWD: 'DEL',
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

function PlayerPhoto({ uri }: { uri: string }) {
  return (
    <Svg width={PHOTO_SIZE} height={PHOTO_SIZE}>
      <Defs>
        <LinearGradient id="playerPhotoFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.8" stopColor="white" stopOpacity={1} />
          <Stop offset="1" stopColor="white" stopOpacity={0} />
        </LinearGradient>
        <Mask id="playerPhotoMask">
          <Rect width={PHOTO_SIZE} height={PHOTO_SIZE} fill="url(#playerPhotoFade)" />
        </Mask>
      </Defs>
      <SvgImage
        width={PHOTO_SIZE}
        height={PHOTO_SIZE}
        href={{ uri }}
        preserveAspectRatio="xMidYMin slice"
        mask="url(#playerPhotoMask)"
      />
    </Svg>
  )
}

function Silhouette() {
  return (
    <Svg width={PLACEHOLDER_SIZE} height={PLACEHOLDER_SIZE} viewBox="0 0 128 128" style={styles.placeholder}>
      <Defs>
        <ClipPath id="silhouetteClip">
          <Circle cx={64} cy={64} r={64} />
        </ClipPath>
      </Defs>
      <Circle cx={64} cy={64} r={64} fill={PlayerCardColors.placeholderBg} />
      <G clipPath="url(#silhouetteClip)" fill={PlayerCardColors.placeholderFg}>
        <Circle cx={64} cy={48} r={22} />
        <Path d="M12 132C12 100 36 78 64 78s52 22 52 54z" />
      </G>
    </Svg>
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
  const positionLabel = POSITION_SHORT_LABELS[position] ?? '—'
  const rating = Math.round(overall)

  return (
    <View
      style={styles.card}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${name}, general ${rating}, ${positionLabel}`}
    >
      <CardShape />
      <View style={styles.content}>
        <View style={styles.ratingBox}>
          <Text style={styles.rating}>{rating}</Text>
          <Text style={styles.position}>{positionLabel}</Text>
        </View>
        <View style={styles.badge}>
          {tournamentPhotoUrl ? (
            <Image source={{ uri: tournamentPhotoUrl }} style={styles.badgeImage} contentFit="cover" />
          ) : (
            <MaterialIcons name="emoji-events" size={BADGE_SIZE / 2} color={PlayerCardColors.edge} />
          )}
        </View>

        {photoUrl ? <PlayerPhoto uri={photoUrl} /> : <Silhouette />}

        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

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
