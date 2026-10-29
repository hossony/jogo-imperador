import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Art } from '../components/Art';
import { Backdrop } from '../components/Backdrop';
import { Caps, Ornament, ProgressBar, RomanButton, ScreenHeader, tap } from '../components/ui';
import type { OriginId } from '../game/types';
import { STAT_KEYS } from '../game/types';
import { ORIGINS, randomName, STATUS, STAT_INFO, type Origin } from '../game/world';
import { C, F } from '../theme';

interface Props {
  onBack: () => void;
  onStart: (origin: OriginId, name: string, dynasty: string) => void;
}

function OriginCard({ o, index, scrollX, itemW }: { o: Origin; index: number; scrollX: SharedValue<number>; itemW: number }) {
  const style = useAnimatedStyle(() => {
    const pos = scrollX.value / itemW - index;
    return {
      opacity: interpolate(Math.abs(pos), [0, 1], [1, 0.45], 'clamp'),
      transform: [
        { scale: interpolate(Math.abs(pos), [0, 1], [1, 0.88], 'clamp') },
        { rotateY: `${interpolate(pos, [-1, 0, 1], [18, 0, -18], 'clamp')}deg` },
      ],
    };
  });
  return (
    <Animated.View style={[{ width: itemW, paddingHorizontal: 8 }, style]}>
      <LinearGradient colors={['#2B1813', '#120B09']} style={styles.card}>
        <View style={styles.cardBorder} />
        <View style={styles.artWrap}>
          <View style={styles.artHalo} />
          <Art id={o.art} size={120} color={C.goldBright} accent={C.gold} weight={2} />
        </View>
        <Caps size={9} color={C.goldDeep} style={{ textAlign: 'center' }}>{o.epithet.toUpperCase()}</Caps>
        <Text style={styles.name}>{o.name}</Text>
        <View style={styles.badges}>
          <Text style={styles.badge}>{STATUS[o.status].label}</Text>
          <Text style={styles.badge}>Dificuldade: {o.difficulty}</Text>
          <Text style={[styles.badge, { color: C.goldBright }]}>×{o.multiplier.toFixed(2)} legado</Text>
        </View>
        <Text style={styles.desc}>{o.desc}</Text>
        <Text style={styles.perk}>{o.perk}</Text>
        <View style={{ marginTop: 10 }}>
          {STAT_KEYS.map((k) => (
            <View key={k} style={styles.statRow}>
              <Text style={styles.statLabel}>{STAT_INFO[k].label}</Text>
              <View style={{ flex: 1 }}>
                <ProgressBar value={o.stats[k] / 100} height={4} />
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export function OriginScreen({ onBack, onStart }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const itemW = width * 0.8;
  const pad = (width - itemW) / 2;
  const scrollX = useSharedValue(itemW * 2);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const [index, setIndex] = useState(2);
  const origin = ORIGINS[index];
  const [names, setNames] = useState(() => Object.fromEntries(ORIGINS.map((o) => [o.id, randomName(o.id)])) as Record<OriginId, { name: string; dynasty: string }>);
  const current = names[origin.id];

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const reroll = () => {
    tap();
    setNames((n) => ({ ...n, [origin.id]: randomName(origin.id) }));
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Backdrop tint="night" embers={10} />
      <ScreenHeader title="SUA ORIGEM" latin="ORIGO" onBack={onBack} />
      <Ornament width={160} />
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemW}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: pad, paddingVertical: 14 }}
        ref={scrollRef}
        onLayout={() => scrollRef.current?.scrollTo({ x: itemW * 2, animated: false })}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / itemW);
          if (i !== index) {
            tap();
            setIndex(Math.max(0, Math.min(ORIGINS.length - 1, i)));
          }
        }}
        style={{ flexGrow: 0 }}
      >
        {ORIGINS.map((o, i) => <OriginCard key={o.id} o={o} index={i} scrollX={scrollX} itemW={itemW} />)}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {ORIGINS.map((o, i) => <View key={o.id} style={[styles.dotSmall, i === index && styles.dotActive]} />)}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 18 }]}>
        <Caps size={9} color={C.goldDeep}>SEU NOME</Caps>
        <View style={styles.nameRow}>
          <TextInput
            value={current.name}
            onChangeText={(t) => setNames((n) => ({ ...n, [origin.id]: { ...n[origin.id], name: t } }))}
            style={styles.input}
            maxLength={34}
            placeholder="Nome"
            placeholderTextColor={C.stone}
          />
          <Pressable onPress={reroll} hitSlop={10} style={styles.dice}>
            <Svg width={26} height={26} viewBox="0 0 24 24">
              <Path d="M4 7 L12 3 L20 7 L20 17 L12 21 L4 17 Z M4 7 L12 11 L20 7 M12 11 L12 21" stroke={C.gold} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
        <Text style={styles.dynasty}>{current.dynasty}</Text>
        <RomanButton
          label="COMEÇAR A HISTÓRIA"
          onPress={() => onStart(origin.id, current.name.trim() || randomName(origin.id).name, current.dynasty)}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 10, padding: 18, borderWidth: 1, borderColor: 'rgba(212,175,99,0.55)', overflow: 'hidden' },
  cardBorder: { position: 'absolute', left: 5, top: 5, right: 5, bottom: 5, borderWidth: 0.5, borderColor: 'rgba(212,175,99,0.25)', borderRadius: 7 },
  artWrap: { alignItems: 'center', justifyContent: 'center', height: 130 },
  artHalo: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(212,175,99,0.08)' },
  name: { fontFamily: F.titleBlack, color: C.marble, fontSize: 28, textAlign: 'center', letterSpacing: 3, marginTop: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  badge: { fontFamily: F.caps, fontSize: 10, color: C.parchmentDark, letterSpacing: 1, marginHorizontal: 5, marginVertical: 2 },
  desc: { fontFamily: F.body, color: C.parchment, fontSize: 16.5, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  perk: { fontFamily: F.bodyItalic, color: C.goldBright, fontSize: 15, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  statRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  statLabel: { fontFamily: F.caps, fontSize: 9, letterSpacing: 1, color: C.smoke, width: 70 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 2 },
  dotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(212,175,99,0.25)', marginHorizontal: 4 },
  dotActive: { backgroundColor: C.goldBright, width: 18 },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 28 },
  nameRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,99,0.5)', marginTop: 4 },
  input: { flex: 1, fontFamily: F.title, color: C.marble, fontSize: 20, paddingVertical: 8, letterSpacing: 1 },
  dice: { padding: 6 },
  dynasty: { fontFamily: F.bodyItalic, color: C.smoke, fontSize: 15, marginTop: 4 },
});
