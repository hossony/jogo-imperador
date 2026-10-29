import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeOut, SlideInUp, SlideOutUp, useAnimatedStyle, useSharedValue, withRepeat,
  withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { eraInfo } from '../game/engine';
import type { ArtId, GameEvent } from '../game/types';
import { MONUMENTS, STATUS, STAT_INFO, TRAITS } from '../game/world';
import { C, F } from '../theme';
import { Art } from './Art';
import { Caps, Ornament, thump } from './ui';

export const isMoment = (e: GameEvent) => e.type === 'promotion' || e.type === 'fall' || e.type === 'succession' || e.type === 'era';

function Rays({ color, size }: { color: string; size: number }) {
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 30000, easing: Easing.linear }), -1, false);
  }, [spin]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          return (
            <Polygon
              key={i}
              points={`100,100 ${100 + 100 * Math.cos(a - 0.05)},${100 + 100 * Math.sin(a - 0.05)} ${100 + 100 * Math.cos(a + 0.05)},${100 + 100 * Math.sin(a + 0.05)}`}
              fill={color}
              opacity={i % 2 ? 0.04 : 0.09}
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
}

interface MomentProps {
  event: GameEvent;
  heirName?: string;
  onClose: () => void;
}

/** Tela cheia para os grandes momentos: ascensão, queda, sucessão e nova era. */
export function MomentOverlay({ event, onClose }: MomentProps) {
  const pop = useSharedValue(0);
  const shake = useSharedValue(0);

  let latin = '';
  let title = '';
  let sub = '';
  let art: ArtId = 'laurel';
  let color = C.goldBright;
  let bg = 'rgba(12,8,6,0.97)';

  if (event.type === 'promotion') {
    latin = 'ASCENSIO';
    title = STATUS[event.to].label;
    sub = STATUS[event.to].desc;
    art = event.to >= 7 ? 'crown' : event.to >= 5 ? 'laurel' : 'eagle';
    bg = 'rgba(26,10,30,0.97)';
  } else if (event.type === 'fall') {
    latin = 'RVINA';
    title = `${STATUS[event.from].label} → ${STATUS[event.to].label}`;
    sub = `${event.high ? 'Excesso' : 'Falta'} de ${STAT_INFO[event.stat].label.toLowerCase()}. Você sobrevive, mas mais embaixo. A história continua.`;
    art = 'chains';
    color = '#FF8A73';
    bg = 'rgba(36,6,4,0.97)';
  } else if (event.type === 'succession') {
    latin = 'SVCCESSIO';
    title = event.heir;
    sub = `A ${event.generation}ª geração da dinastia assume o anel da família.`;
    art = 'family';
  } else if (event.type === 'era') {
    const info = eraInfo(event.era);
    latin = 'NOVA AETAS';
    title = info.name;
    sub = info.desc;
    art = event.era === 'principado' ? 'crown' : event.era === 'guerras_civis' ? 'dagger' : 'senate';
  }

  useEffect(() => {
    thump();
    pop.value = withSpring(1, { damping: 10, stiffness: 120 });
    if (event.type === 'fall') {
      shake.value = withSequence(
        withTiming(-12, { duration: 50 }), withTiming(12, { duration: 70 }), withTiming(-8, { duration: 70 }),
        withTiming(8, { duration: 70 }), withTiming(0, { duration: 60 }),
      );
    }
  }, [event, pop, shake]);

  const artStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }, { translateX: shake.value }, { rotate: `${(1 - pop.value) * -30}deg` }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(350)} exiting={FadeOut.duration(250)} style={[StyleSheet.absoluteFill, { backgroundColor: bg, zIndex: 50 }]}>
      <Pressable style={styles.momentWrap} onPress={onClose}>
        <View style={styles.artStage}>
          <Rays color={color} size={360} />
          <Animated.View style={artStyle}>
            <Art id={art} size={170} color={color} accent={C.gold} weight={2} />
          </Animated.View>
        </View>
        <Animated.View entering={FadeIn.delay(250).duration(500)} style={{ alignItems: 'center' }}>
          <Caps size={13} color={color} style={{ letterSpacing: 8 }}>{latin}</Caps>
          <Text style={[styles.momentTitle, { color: C.marble }]}>{title}</Text>
          <Ornament width={200} color={color} />
          <Text style={styles.momentSub}>{sub}</Text>
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(1100).duration(600)} style={styles.tapHint}>toque para continuar</Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

/** Aviso discreto no topo para traços, monumentos etc. */
export function Toast({ event, onDone }: { event: GameEvent; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2300);
    return () => clearTimeout(t);
  }, [event, onDone]);

  let art: ArtId = 'scroll';
  let label = '';
  let text = '';
  let good = true;
  if (event.type === 'trait') {
    const t = TRAITS[event.trait];
    good = t.good;
    art = good ? 'laurel' : 'mask';
    label = good ? 'VIRTVS' : 'CICATRIZ';
    text = `${t.label}: ${t.desc}`;
  } else if (event.type === 'monument') {
    art = 'column';
    label = 'MONVMENTVM';
    text = `${MONUMENTS[event.monument]?.label ?? event.monument} erguido. Legado ampliado.`;
  }
  return (
    <Animated.View entering={SlideInUp.springify().damping(16)} exiting={SlideOutUp.duration(250)} style={styles.toast}>
      <View style={[styles.toastInner, { borderColor: good ? C.gold : C.crimson }]}>
        <Art id={art} size={36} color={good ? C.goldBright : '#FF8A73'} accent={C.gold} weight={4} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Caps size={9} color={good ? C.gold : '#FF8A73'}>{label}</Caps>
          <Text style={styles.toastText}>{text}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  momentWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  artStage: { width: 360, height: 300, alignItems: 'center', justifyContent: 'center' },
  momentTitle: { fontFamily: F.titleBlack, fontSize: 30, letterSpacing: 2, textAlign: 'center', marginVertical: 10 },
  momentSub: { fontFamily: F.bodyItalic, fontSize: 19, color: C.parchment, textAlign: 'center', marginTop: 14, lineHeight: 26 },
  tapHint: { position: 'absolute', bottom: 60, fontFamily: F.caps, fontSize: 10, letterSpacing: 4, color: C.goldDeep },
  toast: { position: 'absolute', top: 50, left: 16, right: 16, zIndex: 40 },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,10,8,0.96)',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  toastText: { fontFamily: F.body, color: C.marble, fontSize: 16, marginTop: 2 },
});
