import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Spacing, Radii, Fonts } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-theme';
import type { Player } from '@/lib/mock/players';

type Props = {
  player: Player;
  showBorder: boolean;
};

export function HomeRankingRow({ player, showBorder }: Props) {
  const { colors: C } = useAppTheme();
  const isFirst = player.pos === 1;

  return (
    <View style={[styles.row, showBorder && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
      <Text style={[styles.pos, { color: C.muted }, isFirst && { color: C.secondary, fontFamily: Fonts.extraBold }]}>{player.pos}</Text>
      {player.image
        ? <Image source={{ uri: player.image }} style={styles.avatar} />
        : <MaterialCommunityIcons name="account-circle" size={40} color={isFirst ? C.brand : C.muted} />
      }
      <View style={styles.info}>
        <Text style={[styles.name, { color: C.text }]}>{player.name}</Text>
      </View>
      <View style={styles.streakWrap}>
        <Text style={[styles.streakNum, isFirst && styles.streakNumFirst, { color: isFirst ? C.secondary : C.secondary }]}>{player.streak}</Text>
        <MaterialCommunityIcons
          name="fire"
          size={isFirst ? 22 : 18}
          color={isFirst ? C.secondary : C.secondary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  pos: {
    fontFamily: Fonts.bold,
    width: 20,
    fontSize: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
  },
  info: { flex: 1 },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  streakWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakNum: {
    fontFamily: Fonts.extraBold,
    fontSize: 18,
  },
  streakNumFirst: {
    fontFamily: Fonts.extraBold,
    fontSize: 20,
  },
});
