import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence,
  withSpring, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Art } from '../components/Art';
import { Backdrop } from '../components/Backdrop';
import { Caps, Ornament, Panel, RomanButton, ScreenHeader, tap } from '../components/ui';
import {
  armyPower, attackable, campaign, campaignChance, needsSiege, provinceDefense, type BattleResult,
} from '../game/engine';
import type { GameEvent, GameState } from '../game/types';
import { PROVINCES, provinceById, unitById } from '../game/world';
import { C, F } from '../theme';

const MAP_W = 1000;
const MAP_H = 540;

const LAND = [
  // Europa
  'M60 230 L120 196 L200 205 L232 170 L205 120 L232 82 L300 70 L330 42 L420 22 L560 30 L700 40 L860 58 L1000 70 L1000 205 L900 214 L842 238 L760 214 L700 176 L640 186 L600 170 L560 140 L500 120 L462 108 L420 120 L382 158 L332 190 L282 206 L242 232 L210 300 L170 332 L110 332 L66 300 Z',
  // Itália
  'M398 128 L470 118 L502 150 L522 200 L562 258 L602 298 L582 330 L556 320 L540 358 L520 348 L502 312 L468 292 L440 252 L414 200 Z',
  // Bálcãs e Grécia
  'M520 140 L600 150 L700 170 L762 214 L742 252 L702 242 L692 290 L672 342 L640 346 L630 300 L610 262 L580 222 L546 182 Z',
  // Ásia Menor e Levante
  'M752 252 L860 232 L1000 238 L1000 520 L932 520 L902 420 L872 382 L872 322 L822 312 L770 300 Z',
  // África
  'M0 442 L120 420 L250 432 L380 440 L440 420 L470 432 L520 452 L600 470 L700 452 L800 442 L860 422 L902 420 L932 520 L1000 520 L1000 540 L0 540 Z',
  // Britânia
  'M218 8 L270 2 L288 40 L272 66 L236 62 L214 40 Z',
  // Sicília, Sardenha e Córsega
  'M488 384 L562 378 L546 422 Z',
  'M368 290 L402 288 L406 352 L370 352 Z',
  'M372 238 L392 236 L394 276 L374 276 Z',
];

function PulseRing({ x, y, k, color }: { x: number; y: number; k: number; color: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
  }, [t]);
  const style = useAnimatedStyle(() => ({ opacity: 1 - t.value, transform: [{ scale: 0.6 + t.value * 1.4 }] }));
  const r = 22 * k;
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', left: x * k - r, top: y * k - r, width: r * 2, height: r * 2, borderRadius: r, borderWidth: 2, borderColor: color }, style]}
    />
  );
}

function BattleOverlay({ result, onClose }: { result: BattleResult; onClose: () => void }) {
  const mine = useSharedValue(0);
  const theirs = useSharedValue(0);
  const flash = useSharedValue(0);
  const [revealed, setRevealed] = useState(false);
  const total = Math.max(1, result.myPower + result.enemyPower);
  const myShare = result.myPower / total;
  const p = provinceById(result.province);

  useEffect(() => {
    mine.value = withTiming(myShare, { duration: 1400, easing: Easing.inOut(Easing.cubic) });
    theirs.value = withTiming(1 - myShare, { duration: 1400, easing: Easing.inOut(Easing.cubic) });
    flash.value = withDelay(1400, withSequence(withTiming(1, { duration: 90 }), withTiming(0, { duration: 500 })));
    const t = setTimeout(() => {
      setRevealed(true);
      Haptics.notificationAsync(result.won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [mine, theirs, flash, myShare, result.won]);

  const mineStyle = useAnimatedStyle(() => ({ width: `${mine.value * 100}%` }));
  const theirStyle = useAnimatedStyle(() => ({ width: `${theirs.value * 100}%` }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const losses = Object.entries(result.losses);

  return (
    <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut} style={[StyleSheet.absoluteFill, styles.battleBg]}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF2D0' }, flashStyle]} />
      <Caps size={11} color={C.goldDeep} style={{ letterSpacing: 6 }}>PROELIVM</Caps>
      <Text style={styles.battleTitle}>{p.name}</Text>
      <Ornament width={180} />
      <View style={styles.clash}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Art id="eagle" size={64} color={C.goldBright} accent={C.gold} />
          <Text style={styles.side}>Suas legiões</Text>
          <Text style={styles.power}>{result.myPower}</Text>
        </View>
        <Art id="sword" size={44} color={C.stone} accent={C.stone} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Art id={p.walled ? 'column' : 'fire'} size={64} color="#FF9A7F" accent="#FF6B55" />
          <Text style={styles.side}>{p.latin}</Text>
          <Text style={[styles.power, { color: '#FF9A7F' }]}>{result.enemyPower}</Text>
        </View>
      </View>
      <View style={styles.tug}>
        <Animated.View style={[{ height: 12, backgroundColor: C.gold }, mineStyle]} />
        <View style={{ flex: 1 }} />
        <Animated.View style={[{ height: 12, backgroundColor: C.crimson }, theirStyle]} />
      </View>
      <Text style={styles.chance}>Chance de vitória: {Math.round(result.chance * 100)}%</Text>
      {revealed ? (
        <Animated.View entering={FadeInDown.springify().damping(14)} style={{ alignItems: 'center', marginTop: 18, width: '100%' }}>
          <Art id={result.won ? 'laurel' : 'chains'} size={90} color={result.won ? C.goldBright : '#FF8A73'} accent={C.gold} />
          <Text style={[styles.verdict, { color: result.won ? C.goldBright : '#FF8A73' }]}>{result.won ? 'VICTORIA' : 'CLADES'}</Text>
          <Text style={styles.verdictSub}>
            {result.won ? `${p.name} agora pertence a Roma. ${p.bonus}` : `Suas legiões recuam de ${p.name}. O Senado vai cobrar explicações.`}
          </Text>
          {losses.length ? (
            <Text style={styles.losses}>Baixas: {losses.map(([k, v]) => `${v} ${unitById(k as never).name}`).join(', ')}</Text>
          ) : <Text style={styles.losses}>Nenhuma baixa relevante.</Text>}
          <RomanButton label="CONTINUAR" onPress={onClose} style={{ marginTop: 18, alignSelf: 'stretch' }} />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

interface Props {
  game: GameState;
  setGame: (s: GameState) => void;
  pushEvents: (e: GameEvent[]) => void;
  onBack: () => void;
}

export function MapScreen({ game, setGame, pushEvents, onBack }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const k = Math.min(0.95, Math.max(0.6, (height * 0.56) / MAP_H));
  const targets = useMemo(() => new Set(attackable(game)), [game]);
  const owned = useMemo(() => new Set(game.provinces), [game]);
  const [selected, setSelected] = useState<string | null>(() => [...targets][0] ?? null);
  const [battle, setBattle] = useState<BattleResult | null>(null);
  const sel = selected ? provinceById(selected) : null;
  const pop = useSharedValue(1);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const select = (id: string) => {
    tap();
    setSelected(id);
    pop.value = withSequence(withTiming(0.96, { duration: 80 }), withSpring(1));
  };

  const march = () => {
    if (!selected) return;
    const r = campaign(game, selected);
    setBattle(r.result);
    setGame(r.state);
    if (r.events.length) pushEvents(r.events);
  };

  const power = armyPower(game);
  const chance = sel && targets.has(sel.id) ? campaignChance(game, sel.id) : 0;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Backdrop tint="night" embers={6} />
      <ScreenHeader title="O MUNDO" latin="ORBIS TERRARVM" onBack={onBack} />
      <View style={styles.summary}>
        <Text style={styles.sumText}>{game.provinces.length} de {PROVINCES.length} províncias</Text>
        <Text style={styles.sumText}>Força: {power}</Text>
        <Text style={[styles.sumText, { color: game.campaignCooldown ? C.stone : C.good }]}>
          {game.campaignCooldown ? `Legiões descansam: ${game.campaignCooldown} cartas` : 'Legiões prontas'}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={() => scrollRef.current?.scrollTo({ x: Math.max(0, 470 * k - width / 2), animated: false })}
        style={{ flexGrow: 0 }}
      >
        <View style={{ width: MAP_W * k, height: MAP_H * k }}>
          <Svg width={MAP_W * k} height={MAP_H * k} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
            <Defs>
              <RadialGradient id="sea" cx="50%" cy="55%" r="70%">
                <Stop offset="0" stopColor="#1F3340" />
                <Stop offset="1" stopColor="#0B1217" />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={MAP_W} height={MAP_H} fill="url(#sea)" />
            {Array.from({ length: 9 }).map((_, i) => (
              <Line key={`h${i}`} x1={0} y1={i * 60 + 30} x2={MAP_W} y2={i * 60 + 30} stroke="#C9B48A" strokeWidth={0.4} opacity={0.12} />
            ))}
            {Array.from({ length: 16 }).map((_, i) => (
              <Line key={`v${i}`} x1={i * 66 + 20} y1={0} x2={i * 66 + 20} y2={MAP_H} stroke="#C9B48A" strokeWidth={0.4} opacity={0.12} />
            ))}
            {LAND.map((d, i) => (
              <Path key={i} d={d} fill="#3A2E22" stroke="#8F7748" strokeWidth={1.6} strokeLinejoin="round" opacity={0.95} />
            ))}
            {PROVINCES.flatMap((p) =>
              p.neighbors.filter((n) => n > p.id).map((n) => {
                const q = provinceById(n);
                const both = owned.has(p.id) && owned.has(n);
                return (
                  <Line key={`${p.id}-${n}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={both ? C.gold : '#C9B48A'}
                    strokeWidth={both ? 2.4 : 1.3} strokeDasharray={both ? undefined : '6 6'} opacity={both ? 0.85 : 0.4} />
                );
              }),
            )}
            {PROVINCES.map((p) => {
              const isOwned = owned.has(p.id);
              const isTarget = targets.has(p.id);
              const isSel = selected === p.id;
              return (
                <React.Fragment key={p.id}>
                  {isSel ? <Circle cx={p.x} cy={p.y} r={27} fill="none" stroke={C.marble} strokeWidth={2} /> : null}
                  <Circle cx={p.x} cy={p.y} r={p.id === 'latium' ? 19 : 16}
                    fill={isOwned ? C.gold : isTarget ? '#7A231B' : '#2B241E'}
                    stroke={isOwned ? C.goldBright : isTarget ? '#FF8A73' : '#6E604E'} strokeWidth={2.5} />
                  {p.walled ? <Rect x={p.x - 6} y={p.y - 6} width={12} height={12} fill="none" stroke={isOwned ? C.ink : C.parchment} strokeWidth={1.6} /> : null}
                  {p.id === 'latium' ? <Circle cx={p.x} cy={p.y} r={6} fill={C.oxblood} /> : null}
                </React.Fragment>
              );
            })}
          </Svg>
          {PROVINCES.filter((p) => targets.has(p.id) && game.campaignCooldown === 0).map((p) => (
            <PulseRing key={`pr-${p.id}`} x={p.x} y={p.y} k={k} color="#FF8A73" />
          ))}
          {PROVINCES.map((p) => (
            <Text
              key={`lbl-${p.id}`}
              pointerEvents="none"
              numberOfLines={1}
              style={[styles.label, { left: p.x * k - 55, top: p.y * k + 17, color: owned.has(p.id) ? C.goldBright : targets.has(p.id) ? '#FFB09A' : C.stone }]}
            >
              {p.name}
            </Text>
          ))}
          {PROVINCES.map((p) => (
            <Pressable
              key={`hit-${p.id}`}
              onPress={() => select(p.id)}
              hitSlop={4}
              style={{ position: 'absolute', left: p.x * k - 24, top: p.y * k - 24, width: 48, height: 48, borderRadius: 24 }}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: C.gold }]} /><Text style={styles.legendText}>Sua</Text>
        <View style={[styles.legendDot, { backgroundColor: '#7A231B', borderColor: '#FF8A73', borderWidth: 1 }]} /><Text style={styles.legendText}>Vizinha (atacável)</Text>
        <View style={[styles.legendDot, { borderColor: C.parchment, borderWidth: 1, borderRadius: 0 }]} /><Text style={styles.legendText}>Murada</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: insets.bottom + 12, justifyContent: 'flex-end' }}>
        {sel ? (
          <Animated.View style={popStyle}>
            <Panel glow={targets.has(sel.id) ? '#FF8A73' : undefined}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Caps size={9} color={C.goldDeep}>{sel.latin}</Caps>
                  <Text style={styles.provName}>{sel.name}</Text>
                  <Text style={styles.provBonus}>{sel.bonus}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.provStat}>Legado +{sel.legado}</Text>
                  <Text style={styles.provStat}>Tributo +{sel.tribute}</Text>
                  {!owned.has(sel.id) ? <Text style={styles.provStat}>Defesa {provinceDefense(game, sel.id)}</Text> : null}
                </View>
              </View>
              {owned.has(sel.id) ? (
                <Text style={styles.ownedText}>Província romana.</Text>
              ) : targets.has(sel.id) ? (
                <>
                  {needsSiege(game, sel.id) ? (
                    <Text style={styles.warn}>Cidade murada: sem máquinas de cerco, sua força cai 40%.</Text>
                  ) : null}
                  <View style={styles.chanceRow}>
                    <Text style={styles.chanceLabel}>Chance de vitória</Text>
                    <Text style={[styles.chanceValue, { color: chance >= 0.6 ? C.good : chance >= 0.4 ? C.goldBright : C.bad }]}>{Math.round(chance * 100)}%</Text>
                  </View>
                  <RomanButton
                    label={game.campaignCooldown ? `DESCANSANDO (${game.campaignCooldown})` : 'MARCHAR'}
                    variant="crimson"
                    disabled={game.campaignCooldown > 0 || power <= 0 || !!game.pendingCrisis}
                    onPress={march}
                    style={{ marginTop: 10 }}
                  />
                </>
              ) : (
                <Text style={styles.ownedText}>Fora de alcance. Conquiste uma província vizinha primeiro.</Text>
              )}
            </Panel>
          </Animated.View>
        ) : null}
      </View>

      {battle ? <BattleOverlay result={battle} onClose={() => setBattle(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, marginBottom: 8 },
  sumText: { fontFamily: F.bodyItalic, color: C.parchment, fontSize: 14 },
  label: { position: 'absolute', fontFamily: F.caps, fontSize: 8, letterSpacing: 1, width: 110, textAlign: 'center', textShadowColor: '#000', textShadowRadius: 4 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 12, marginRight: 4 },
  legendText: { fontFamily: F.body, color: C.smoke, fontSize: 13 },
  provName: { fontFamily: F.title, color: C.marble, fontSize: 22, letterSpacing: 1.5 },
  provBonus: { fontFamily: F.bodyItalic, color: C.parchment, fontSize: 15 },
  provStat: { fontFamily: F.caps, color: C.gold, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  ownedText: { fontFamily: F.bodyItalic, color: C.smoke, fontSize: 15, marginTop: 10 },
  warn: { fontFamily: F.body, color: '#FFB09A', fontSize: 15, marginTop: 10 },
  chanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  chanceLabel: { fontFamily: F.caps, color: C.smoke, fontSize: 11, letterSpacing: 2 },
  chanceValue: { fontFamily: F.titleBlack, fontSize: 26 },
  battleBg: { backgroundColor: 'rgba(10,6,5,0.97)', alignItems: 'center', justifyContent: 'center', padding: 26, zIndex: 30 },
  battleTitle: { fontFamily: F.titleBlack, color: C.marble, fontSize: 30, letterSpacing: 3, marginVertical: 6 },
  clash: { flexDirection: 'row', alignItems: 'center', marginTop: 20, width: '100%' },
  side: { fontFamily: F.caps, color: C.smoke, fontSize: 10, letterSpacing: 2, marginTop: 6 },
  power: { fontFamily: F.titleBlack, color: C.goldBright, fontSize: 28 },
  tug: { flexDirection: 'row', width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginTop: 18 },
  chance: { fontFamily: F.bodyItalic, color: C.smoke, fontSize: 14, marginTop: 8 },
  verdict: { fontFamily: F.titleBlack, fontSize: 34, letterSpacing: 8, marginTop: 6 },
  verdictSub: { fontFamily: F.body, color: C.parchment, fontSize: 17, textAlign: 'center', marginTop: 6, lineHeight: 22 },
  losses: { fontFamily: F.bodyItalic, color: C.smoke, fontSize: 14, marginTop: 8, textAlign: 'center' },
});
