import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming,
} from 'react-native-reanimated';
import { C } from '../theme';

/** Partícula de brasa/poeira dourada subindo devagar. */
function Ember({ w, h, seed }: { w: number; h: number; seed: number }) {
  const cfg = useMemo(() => {
    const r = (n: number) => {
      const x = Math.sin(seed * 999 + n * 77.7) * 10000;
      return x - Math.floor(x);
    };
    return {
      x: r(1) * w,
      size: 1.5 + r(2) * 3,
      duration: 7000 + r(3) * 9000,
      delay: r(4) * 6000,
      drift: (r(5) - 0.5) * 60,
      gold: r(6) > 0.35,
    };
  }, [w, seed]);
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(cfg.delay, withRepeat(withTiming(1, { duration: cfg.duration, easing: Easing.linear }), -1, false));
  }, [cfg, t]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.15, 0.8, 1], [0, 0.9, 0.5, 0]),
    transform: [
      { translateY: interpolate(t.value, [0, 1], [h + 10, h * 0.15]) },
      { translateX: Math.sin(t.value * Math.PI * 2) * cfg.drift },
    ],
  }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: cfg.x,
          top: 0,
          width: cfg.size,
          height: cfg.size,
          borderRadius: cfg.size,
          backgroundColor: cfg.gold ? C.goldBright : '#FF9A5C',
          shadowColor: C.goldBright,
          shadowOpacity: 0.9,
          shadowRadius: 4,
        },
        style,
      ]}
    />
  );
}

interface Props {
  tint?: 'wine' | 'purple' | 'night' | 'crisis';
  embers?: number;
  children?: React.ReactNode;
}

const TINTS: Record<NonNullable<Props['tint']>, [string, string, string]> = {
  wine: ['#341511', '#1A0E0B', '#0B0807'],
  purple: ['#2E1532', '#170C19', '#0A070B'],
  night: ['#1C1512', '#100C0A', '#080605'],
  crisis: ['#5A1410', '#260B09', '#0B0606'],
};

export function Backdrop({ tint = 'wine', embers = 14, children }: Props) {
  const { width, height } = useWindowDimensions();
  const seeds = useMemo(() => Array.from({ length: embers }, (_, i) => i + 1), [embers]);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={TINTS[tint]} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
      <LinearGradient
        colors={['rgba(212,175,99,0.10)', 'rgba(212,175,99,0)']}
        style={[StyleSheet.absoluteFill, { height: height * 0.5 }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {seeds.map((s) => <Ember key={s} seed={s} w={width} h={height} />)}
      </View>
      {children}
    </View>
  );
}
