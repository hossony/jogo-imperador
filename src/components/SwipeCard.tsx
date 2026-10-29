import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Easing, interpolate, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { Card, CardKind } from '../game/types';
import { C, F } from '../theme';
import { Art } from './Art';
import { Meander, tap, thump } from './ui';

export interface SwipeCardHandle {
  choose: (side: 'left' | 'right') => void;
}

interface Props {
  card: Card;
  width: number;
  drag: SharedValue<number>;
  onDecide: (side: 'left' | 'right') => void;
  ref?: React.Ref<SwipeCardHandle>;
}

const KIND: Record<CardKind, { bg: [string, string]; border: string; art: string; accent: string; tag?: string }> = {
  normal: { bg: ['#3B1A14', '#170C0A'], border: C.gold, art: C.gold, accent: C.goldBright },
  origem: { bg: ['#3D2B12', '#120C07'], border: C.goldBright, art: C.goldBright, accent: C.gold, tag: 'ORIGO' },
  evento: { bg: ['#4A3315', '#160F08'], border: C.goldBright, art: C.goldBright, accent: '#FF9A5C', tag: 'HISTORIA' },
  promocao: { bg: ['#4B1F4F', '#170A19'], border: C.goldBright, art: C.goldBright, accent: '#E9B6F2', tag: 'ASCENSIO' },
  crise: { bg: ['#7A1A12', '#200706'], border: C.crimson, art: '#FFB09A', accent: '#FF6B55', tag: 'CALAMITAS' },
  dinastia: { bg: ['#2E1532', '#0D060F'], border: C.goldBright, art: C.marble, accent: C.goldBright, tag: 'DYNASTIA' },
};

export function SwipeCard({ card, width, drag, onDecide, ref }: Props) {
  const height = width * 1.32;
  const threshold = width * 0.3;
  const kind = KIND[card.kind ?? 'normal'];

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const appear = useSharedValue(0);
  const decided = useSharedValue(false);

  useEffect(() => {
    drag.value = 0;
    appear.value = withSpring(1, { damping: 15, stiffness: 110, mass: 0.9 });
  }, [appear, drag]);

  const fly = (side: 'left' | 'right') => {
    'worklet';
    if (decided.value) return;
    decided.value = true;
    const dir = side === 'left' ? -1 : 1;
    drag.value = withTiming(0, { duration: 220 });
    ty.value = withTiming(ty.value + 40, { duration: 300 });
    tx.value = withTiming(dir * width * 1.7, { duration: 300, easing: Easing.in(Easing.quad) }, (finished) => {
      'worklet';
      if (finished) scheduleOnRN(onDecide, side);
    });
  };

  useImperativeHandle(ref, () => ({
    choose: (side) => {
      // mostra a escolha antes de lançar a carta
      const dir = side === 'left' ? -1 : 1;
      drag.value = withTiming(dir * threshold, { duration: 180 });
      tx.value = withTiming(dir * threshold, { duration: 180 }, (finished) => {
        'worklet';
        if (finished) fly(side);
      });
      thump();
    },
  }));

  const pan = usePanGesture({
    minDistance: 4,
    onUpdate: (e) => {
      'worklet';
      if (decided.value) return;
      tx.value = e.translationX;
      ty.value = e.translationY * 0.2;
      drag.value = e.translationX;
    },
    onDeactivate: (e) => {
      'worklet';
      if (decided.value) return;
      if (Math.abs(tx.value) > threshold || (Math.abs(e.velocityX) > 1100 && Math.abs(tx.value) > 30)) {
        scheduleOnRN(thump);
        fly(tx.value < 0 ? 'left' : 'right');
      } else {
        tx.value = withSpring(0, { damping: 14, stiffness: 180 });
        ty.value = withSpring(0, { damping: 14, stiffness: 180 });
        drag.value = withSpring(0, { damping: 14, stiffness: 180 });
      }
    },
  });

  useAnimatedReaction(
    () => Math.abs(tx.value) > threshold,
    (now, before) => {
      if (now && before === false && !decided.value) scheduleOnRN(tap);
    },
  );

  const cardStyle = useAnimatedStyle(() => ({
    opacity: interpolate(appear.value, [0, 0.4, 1], [0, 1, 1]),
    transform: [
      { perspective: 900 },
      { translateX: tx.value },
      { translateY: ty.value + interpolate(appear.value, [0, 1], [40, 0]) },
      { rotateZ: `${interpolate(tx.value, [-width, 0, width], [-16, 0, 16])}deg` },
      { rotateY: `${interpolate(appear.value, [0, 1], [-35, 0])}deg` },
      { scale: interpolate(appear.value, [0, 1], [0.86, 1]) },
    ],
  }));

  const leftLabel = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [-threshold, -12], [1, 0], 'clamp') }));
  const rightLabel = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [12, threshold], [0, 1], 'clamp') }));
  const band = useAnimatedStyle(() => ({ opacity: interpolate(Math.abs(tx.value), [8, threshold * 0.8], [0, 1], 'clamp') }));
  const shine = useAnimatedStyle(() => ({ opacity: interpolate(Math.abs(tx.value), [0, threshold], [0, 0.18], 'clamp') }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ width, height }, styles.shadow, cardStyle]}>
        <LinearGradient colors={['#F4EBD7', '#E3D2AB']} style={[styles.card, { borderColor: kind.border }]}>
          <View style={[styles.innerBorder, { borderColor: kind.border }]} />
          <LinearGradient colors={kind.bg} style={[styles.artBox, { height: height * 0.44 }]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
            <View style={styles.artGlow} />
            <Art id={card.art} size={height * 0.3} color={kind.art} accent={kind.accent} weight={2.2} />
            {kind.tag ? (
              <View style={[styles.tag, { borderColor: kind.border }]}>
                <Text style={[styles.tagText, { color: kind.border === C.crimson ? '#FFB09A' : C.goldBright }]}>{kind.tag}</Text>
              </View>
            ) : null}
            <View style={styles.meanderBottom}>
              <Meander width={width - 40} color={kind.art} opacity={0.4} />
            </View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.band, band]}>
              <Animated.Text style={[styles.choice, { textAlign: 'right', right: 16 }, leftLabel]} numberOfLines={2}>
                {card.left.label}
              </Animated.Text>
              <Animated.Text style={[styles.choice, { textAlign: 'left', left: 16 }, rightLabel]} numberOfLines={2}>
                {card.right.label}
              </Animated.Text>
            </Animated.View>
          </LinearGradient>
          <View style={styles.body}>
            <Text style={styles.who}>{card.who.toUpperCase()}</Text>
            {card.role ? <Text style={styles.role}>{card.role}</Text> : null}
            <View style={styles.rule} />
            <Text style={[styles.text, { fontSize: width > 330 ? 19 : 17.5 }]}>{card.text}</Text>
          </View>
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF6DD' }, shine]} />
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

/** Cartas empilhadas atrás da carta atual, dando profundidade ao baralho. */
export function DeckShadow({ width }: { width: number }) {
  const height = width * 1.32;
  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      <View style={[styles.ghost, { width, height, transform: [{ rotate: '-4deg' }, { translateY: 10 }] }]} />
      <View style={[styles.ghost, { width, height, transform: [{ rotate: '3deg' }, { translateY: 6 }], opacity: 0.85 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
    borderRadius: 14,
  },
  card: { flex: 1, borderRadius: 14, borderWidth: 2, overflow: 'hidden', padding: 8 },
  innerBorder: { position: 'absolute', left: 5, top: 5, right: 5, bottom: 5, borderWidth: 0.6, borderRadius: 10, opacity: 0.6 },
  artBox: { borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artGlow: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(242,213,140,0.10)',
  },
  meanderBottom: { position: 'absolute', bottom: 6, left: 0, right: 0 },
  tag: { position: 'absolute', top: 10, alignSelf: 'center', borderWidth: 0.8, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.35)' },
  tagText: { fontFamily: F.caps, fontSize: 9, letterSpacing: 3 },
  band: {
    backgroundColor: 'rgba(10,6,5,0.78)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 18,
    height: 92,
  },
  choice: { fontFamily: F.title, color: C.marble, fontSize: 17, letterSpacing: 1.2, width: '64%', position: 'absolute', top: 18 },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 14, paddingTop: 12 },
  who: { fontFamily: F.title, color: C.oxblood, fontSize: 15, letterSpacing: 2.5, textAlign: 'center' },
  role: { fontFamily: F.bodyItalic, color: '#6B5440', fontSize: 15, marginTop: 1 },
  rule: { width: 46, height: 1, backgroundColor: C.goldDeep, marginVertical: 10, opacity: 0.7 },
  text: { fontFamily: F.body, color: '#2A1A12', textAlign: 'center', lineHeight: 24 },
  ghost: {
    position: 'absolute',
    borderRadius: 14,
    backgroundColor: '#3A2A20',
    borderWidth: 1,
    borderColor: 'rgba(212,175,99,0.35)',
  },
});
