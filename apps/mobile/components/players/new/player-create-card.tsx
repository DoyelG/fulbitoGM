import Entypo from '@expo/vector-icons/Entypo';import { Image } from 'expo-image'
import { Pressable, StyleSheet, View } from 'react-native'
import Svg, {
  ClipPath,
  Defs,
  Image as SvgImage,
  LinearGradient,
  Polygon,
  Stop,
} from 'react-native-svg'

import { ThemedText } from '@/components/themed-text'
import { CardColors, Fonts } from '@/constants/theme'

const INK = CardColors.ink
const FILL = CardColors.fill

const CARD_W = 240
const CARD_H = 334
const AVATAR = 98

const SPLIT_Y = 184

const TOP_CORNER = 50
const BOTTOM_CORNER = CARD_H - 42
const HEX = [
  [CARD_W / 2, 5],
  [CARD_W - 6, TOP_CORNER],
  [CARD_W - 6, BOTTOM_CORNER],
  [CARD_W / 2, CARD_H - 5],
  [6, BOTTOM_CORNER],
  [6, TOP_CORNER],
]
const HEX_POINTS = HEX.map(([x, y]) => `${x},${y}`).join(' ')

const POSITION_ABBR: Record<string, string> = {
  GK: 'POR',
  DEF: 'DEF',
  MID: 'MED',
  FWD: 'DEL',
  PLAYER: 'JUG',
}

type Stat = { key: string; label: string; value: number }

type Props = {
  name: string
  position: string
  overall: number
  stats: Stat[]
  photoUri: string | null
  onPickPhoto: () => void
}

export function PlayerCreateCard({ name, position, overall, stats, photoUri, onPickPhoto }: Props) {
  const displayName = name.trim().length > 0 ? name.trim().toUpperCase() : 'NUEVO JUGADOR'
  const abbr = POSITION_ABBR[position] ?? 'JUG'

  return (
    <View style={styles.wrap}>
      <Svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`}>
        <Defs>
          <ClipPath id="hexClip">
            <Polygon points={HEX_POINTS} />
          </ClipPath>
          <LinearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={CardColors.gold.light} />
            <Stop offset="0.5" stopColor={CardColors.gold.mid} />
            <Stop offset="1" stopColor={CardColors.gold.dark} />
          </LinearGradient>
        </Defs>

        <Polygon points={HEX_POINTS} fill={FILL} />
        <SvgImage
          x={0}
          y={0}
          width={CARD_W}
          height={SPLIT_Y}
          href={require('@/assets/images/card-background.png')}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#hexClip)"
        />
        <Polygon
          points={HEX_POINTS}
          fill="none"
          stroke="url(#gold)"
          strokeWidth={7}
          strokeLinejoin="round"
        />
      </Svg>

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.ratingBox}>
          <ThemedText style={styles.rating}>{overall}</ThemedText>
          <ThemedText style={styles.position}>{abbr}</ThemedText>
        </View>

        <Pressable
          onPress={onPickPhoto}
          accessibilityRole="button"
          accessibilityLabel="Subir foto del jugador"
          hitSlop={8}
          style={({ pressed }) => [
            styles.avatar,
            !photoUri && styles.avatarEmpty,
            pressed && styles.pressed,
          ]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImg} contentFit="cover" transition={150} />
            ) : (
            <Entypo name="user" size={80} color="black" /> 
           )}
        </Pressable>

        <View style={styles.nameBand}>
          <ThemedText
            style={styles.name}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}>
            {`${displayName} `}
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.key} style={styles.statItem}>
              <ThemedText style={styles.statValue}>{s.value}</ThemedText>
              <ThemedText style={styles.statLabel}>{s.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: CARD_W,
    height: CARD_H,
    alignSelf: 'center',
    shadowColor: CardColors.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ratingBox: {
    position: 'absolute',
    top: 42,
    left: 28,
    alignItems: 'center',
  },
  rating: {
    fontFamily: Fonts.black,
    fontSize: 44,
    lineHeight: 48,
    color: INK,
  },
  position: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    letterSpacing: 1.5,
    color: INK,
  },
  avatar: {
    position: 'absolute',
    top: 52,
    right: 24,
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 2,
    borderColor: CardColors.avatarBorder,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: CardColors.avatarShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarEmpty: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'flex-end',
  },
  avatarImg: {
    justifyContent: 'center',
    width: AVATAR,
    height: AVATAR,
  },
  pressed: {
    opacity: 0.85,
  },
  nameBand: {
    position: 'absolute',
    top: 178,
    left: 6,
    right: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
  },
  name: {
    fontFamily: Fonts.extraBoldItalic,
    fontSize: 25,
    textAlign: 'center',
    color: INK,
    paddingHorizontal: 12,
    width: '100%',
  },
  statsGrid: {
    position: 'absolute',
    top: 232,
    left: 30,
    right: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31,36,48,0.12)',
  },
  statValue: {
    fontFamily: Fonts.black,
    fontSize: 20,
    color: INK,
  },
  statLabel: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: '#6f6a5c',
  },
})
