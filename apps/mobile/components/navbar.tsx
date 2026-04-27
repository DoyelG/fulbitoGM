import React, { useState, useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DrawerMenu } from '@/components/drawer-menu';

type User = { name: string; email: string; image: string | null };

const MOCK_USER: User | null = {
  name:'John Does',
  email:"eljohndoe@gmail.com",
  image:null
}

const OPEN = { duration: 420, easing: Easing.out(Easing.cubic) };
const CLOSE = { duration: 300, easing: Easing.in(Easing.cubic) };
const ICON_OUT = { duration: 100 };
const ICON_IN = { duration: 150 };
const GRADIENT = ['#7C3AED', '#F97316'] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(0);
  const hamburgerOpacity = useSharedValue(1);
  const xOpacity = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        hamburgerOpacity.value = withTiming(0, ICON_OUT);
        xOpacity.value = withDelay(OPEN.duration - 150, withTiming(1, ICON_IN));
        progress.value = withTiming(1, OPEN);
      } else {
        xOpacity.value = withTiming(0, ICON_OUT);
        hamburgerOpacity.value = withDelay(CLOSE.duration - 120, withTiming(1, ICON_IN));
        progress.value = withTiming(0, CLOSE);
      }
      return next;
    });
  }, [progress, hamburgerOpacity, xOpacity]);

  const close = useCallback(() => {
    setIsOpen(false);
    xOpacity.value = withTiming(0, ICON_OUT);
    hamburgerOpacity.value = withDelay(CLOSE.duration - 120, withTiming(1, ICON_IN));
    progress.value = withTiming(0, CLOSE);
  }, [progress, hamburgerOpacity, xOpacity]);

  const hamburgerStyle = useAnimatedStyle(() => ({
    opacity: hamburgerOpacity.value,
  }));

  return (
    <>
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.bar, { paddingTop: insets.top + 14, height: 60 + insets.top }]}
      >
        <View style={styles.navLeft}>
        <Pressable onPress={toggle} hitSlop={16} style={styles.iconBtn}>
          <Animated.View style={[styles.lines, hamburgerStyle]}>
            <View style={styles.line} />
            <View style={styles.line} />
            <View style={styles.line} />
          </Animated.View>
        </Pressable>
        <Text style={styles.logo}>FULBITOAPP</Text>
        </View>


        {MOCK_USER ? (
          <Pressable onPress={toggle} hitSlop={12} style={styles.avatar}>
            <Image
              source={MOCK_USER.image ? { uri: MOCK_USER.image } : require('@/assets/images/user-placeholder.png')}
              style={styles.avatarImg}
            />
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/login')} style={styles.enterBtn}>
            <Text style={styles.enterText}>ENTRAR</Text>
          </Pressable>
        )}
      </LinearGradient>

      <DrawerMenu isOpen={isOpen} onClose={close} progress={progress} user={MOCK_USER} />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lines: {
    width: 24,
    height: 16,
    justifyContent: 'space-between',
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  enterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 2,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  enterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  navLeft: {
    flexDirection: 'row',
    gap: 12,
  },
});
