import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Radii, Fonts } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-theme';
import { MOCK_PLAYERS } from '@/lib/mock/players';
import { HomeHero } from '@/components/home/home-hero';
import { HomeMenuGrid } from '@/components/home/home-menu-grid';
import { HomeMatchCard, type Match } from '@/components/home/home-match-card';
import { HomeRankingRow } from '@/components/home/home-ranking-row';

const LAST_MATCHES: Match[] = [
  { date: 'MIE 04 OCT', teamA: 'EQUIPO A', teamB: 'EQUIPO B', scoreA: 8, scoreB: 21 },
  { date: 'LUN 02 OCT', teamA: 'EQUIPO A', teamB: 'EQUIPO B', scoreA: 12, scoreB: 10 },
];

export default function HomeScreen() {
  const { colors: C, isDark, shadows } = useAppTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <HomeHero />
        <HomeMenuGrid />

        <Text style={[styles.sectionTitle, { color: C.text }]}>ÚLTIMOS PARTIDOS</Text>
        <View style={styles.matchList}>
          {LAST_MATCHES.map((m, i) => (
            <HomeMatchCard
              key={i}
              match={m}
              accentColor={i === 0 ? C.brand : C.secondary}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: C.text }]}>MUNDIALITO</Text>
        <View style={[styles.rankingCard, { backgroundColor: C.surface }, shadows.card(isDark) as object]}>
          {MOCK_PLAYERS.map((p, i) => (
            <HomeRankingRow key={p.id} player={p} showBorder={i < MOCK_PLAYERS.length - 1} />
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 32 },

  sectionTitle: {
    fontFamily: Fonts.blackItalic,
    fontSize: 18,
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },

  matchList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  rankingCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },

  bottomPad: { height: 16 },
});
