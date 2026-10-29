import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { ArtId, Stat } from '../game/types';
import { STAT_INFO } from '../game/world';
import { C, F } from '../theme';
import { Art } from './Art';

const ICON: Record<Stat, ArtId> = { senado: 'senate', plebe: 'family', legioes: 'sword', tesouro: 'coins' };
const SIZE = 42;

interface Props {
  stat: Stat;
  value: number;
  drag: SharedValue<number>;
  previewLeft?: number;
  previewRight?: number;
}

/**
 * Ícone que "enche" de ouro de baixo para cima conforme o valor.
 * Um ponto acima mostra quais barras a escolha vai mexer (o tamanho indica a intensidade, não a direção).
 */
export function StatBar({ stat, value, drag, previewLeft, previewRight }: Props) {
  const fill = useSharedValue(value);
  const flash = useSharedValue(0);
  const flashUp = useSharedValue(1);
  const danger = useSharedValue(0);
  const prev = useRef(value);

  useEffect(() => {
    fill.value = withTiming(value, { duration: 650 });
    if (value !== prev.current) {
      flashUp.value = value > prev.current ? 1 : 0;
      flash.value = withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 900 }));
      prev.current = value;
    }
    const isDanger = value <= 18 || value >= 82;
    danger.value = isDanger ? withRepeat(withTiming(1, { duration: 650 }), -1, true) : withTiming(0, { duration: 300 });
  }, [value, fill, flash, flashUp, danger]);

  const fillStyle = useAnimatedStyle(() => ({ height: `${fill.value}%` }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: Math.max(flash.value * 0.5, danger.value * 0.32),
    backgroundColor: flash.value > 0.01 ? interpolateColor(flashUp.value, [0, 1], [C.bad, C.good]) : C.bad,
    transform: [{ scale: 1 + flash.value * 0.15 }],
  }));

  const pl = Math.abs(previewLeft ?? 0);
  const pr = Math.abs(previewRight ?? 0);
  const dotStyle = useAnimatedStyle(() => {
    const d = drag.value;
    const mag = d < 0 ? pl : pr;
    const strength = interpolate(Math.abs(d), [8, 60], [0, 1], 'clamp');
    const size = mag === 0 ? 0 : mag >= 15 ? 11 : 6;
    return { opacity: mag === 0 ? 0 : strength, width: size, height: size, borderRadius: size };
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.dotRow}>
        <Animated.View style={[styles.dot, dotStyle]} />
      </View>
      <View style={styles.iconBox}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <View style={StyleSheet.absoluteFill}>
          <Art id={ICON[stat]} size={SIZE} color="rgba(239,230,211,0.22)" accent="rgba(239,230,211,0.22)" weight={5} />
        </View>
        <Animated.View style={[styles.fillClip, fillStyle]}>
          <View style={styles.fillInner}>
            <Art id={ICON[stat]} size={SIZE} color={C.goldBright} accent={C.gold} weight={5} />
          </View>
        </Animated.View>
      </View>
      <Text style={styles.label}>{STAT_INFO[stat].latin}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 72 },
  dotRow: { height: 14, justifyContent: 'center', alignItems: 'center' },
  dot: { backgroundColor: C.marble, shadowColor: C.marble, shadowOpacity: 1, shadowRadius: 4 },
  iconBox: { width: SIZE, height: SIZE },
  glow: { position: 'absolute', left: -8, top: -8, right: -8, bottom: -8, borderRadius: 40 },
  fillClip: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  fillInner: { position: 'absolute', left: 0, bottom: 0, width: SIZE, height: SIZE },
  label: { fontFamily: F.caps, fontSize: 8, letterSpacing: 1.5, color: C.goldDeep, marginTop: 6 },
});
