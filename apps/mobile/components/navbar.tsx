import React, { useState, useCallback } from 'react';
import { Text, Image, Pressable, StyleSheet } from 'react-native';
import {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DrawerMenu } from '@/components/drawer-menu';

type User = { name: string; email: string; image: string | null };

 const MOCK_USER: User | null = {
  name: 'John Does',
  email: 'eljohndoe@gmail.com',
  image: null,
};

const OPEN = { duration: 420, easing: Easing.out(Easing.cubic) };
const CLOSE = { duration: 300, easing: Easing.in(Easing.cubic) };
const GRADIENT = ['#7C3AED', '#F97316'] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const toggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    progress.value = withTiming(next ? 1 : 0, next ? OPEN : CLOSE);
  }, [isOpen, progress]);

  const close = useCallback(() => {
    setIsOpen(false);
    progress.value = withTiming(0, CLOSE);
  }, [progress]);

  return (
    <>
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.bar, { paddingTop: insets.top + 6, height: 50 + insets.top }]}
      >
        <Text style={styles.logo}>FULBITOAPP</Text>

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
    paddingBottom: 10,
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
