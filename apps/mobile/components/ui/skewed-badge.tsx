import { View, StyleSheet, type ViewStyle } from 'react-native';

type Props = {
  color: string;
  cutColor: string;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: ViewStyle;
  children: React.ReactNode;
};

export function SkewedBadge({
  color,
  cutColor,
  paddingHorizontal = 28,
  paddingVertical = 10,
  style,
  children,
}: Props) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color, paddingHorizontal, paddingVertical },
        style,
      ]}
    >
      <View style={[styles.cutTL, { borderTopColor: cutColor }]} />
      {children}
      <View style={[styles.cutBR, { borderBottomColor: cutColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cutTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderTopWidth: 60,
    borderRightWidth: 14,
    borderRightColor: 'transparent',
  },
  cutBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderBottomWidth: 60,
    borderLeftWidth: 14,
    borderLeftColor: 'transparent',
  },
});
