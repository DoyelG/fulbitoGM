import React, { useState, useCallback, useMemo } from 'react';
import { Text, Image, Pressable } from 'react-native';
import { styles } from '@/components/navbar.styles';
import {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DrawerMenu } from '@/components/drawer-menu';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import type { User } from '@/constants/auth';

const OPEN = { duration: 420, easing: Easing.out(Easing.cubic) };
const CLOSE = { duration: 300, easing: Easing.in(Easing.cubic) };
const GRADIENT = ['#7C3AED', '#F97316'] as const;

export function Navbar() {
  const { user: authUser, signOut } = useFirebaseAuth();

  const user = useMemo<User | null>(() => {
    if (!authUser) return null;
    return {
      name: authUser.email.split('@')[0],
      email: authUser.email,
      role: authUser.role,
      image: null,
    };
  }, [authUser]);

  const onLogout = useCallback(async () => {
    await signOut();
    router.replace('/login');
  }, [signOut]);

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

        {user ? (
          <Pressable onPress={toggle} hitSlop={12} style={styles.avatar}>
            <Image
              source={user.image ? { uri: user.image } : require('@/assets/images/user-placeholder.png')}
              style={styles.avatarImg}
            />
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/login')} style={styles.enterBtn}>
            <Text style={styles.enterText}>ENTRAR</Text>
          </Pressable>
        )}
      </LinearGradient>

      {user && <DrawerMenu isOpen={isOpen} onClose={close} progress={progress} user={user} onLogout={onLogout} />}
    </>
  );
}

