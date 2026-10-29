import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Art } from '../components/Art';
import { Backdrop } from '../components/Backdrop';
import { Emblem } from '../components/Emblem';
import { Caps, Ornament, Panel, RomanButton } from '../components/ui';
import { liveLegado, tierOf } from '../game/engine';
import type { GameState, RunRecord } from '../game/types';
import { originById, STATUS } from '../game/world';
import { C, F, ROMAN } from '../theme';

interface Props {
  game: GameState;
  record: RunRecord;
  oldPr: number;
  newPr: number;
  onChronicle: () => void;
  onTitle: () => void;
  onRanking: () => void;
}

function useCountUp(target: number, duration = 1600, delay = 500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: ReturnType<typeof setTimeout>;
    const start = Date.now() + delay;
    const step = () => {
      const t = Math.min(1, Math.max(0, (Date.now() - start) / duration));
      setV(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = setTimeout(step, 16);
    };
    raf = setTimeout(step, 16);
    return () => clearTimeout(raf);
  }, [target, duration, delay]);
  return v;
}

export function EndScreen({ game, record, oldPr, newPr, onChronicle, onTitle, onRanking }: Props) {
  const insets = useSafeAreaInsets();
  const score = useCountUp(record.score);
  const oldT = tierOf(oldPr);
  const newT = tierOf(newPr);
  const promoted = newT.index > oldT.index || (newT.index === oldT.index && newT.division < oldT.division);
  const demoted = newT.index < oldT.index || (newT.index === oldT.index && newT.division > oldT.division);
  const [showTier, setShowTier] = useState(false);
  const o = originById(game.origin);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowTier(true);
      Haptics.notificationAsync(promoted ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }, 2300);
    return () => clearTimeout(t);
  }, [promoted]);

  const rows: [string, string][] = [
    ['Legado acumulado', `${liveLegado(game)}`],
    ['Províncias', `${game.provinces.length}`],
    ['Posição mais alta', STATUS[game.maxStatus].label],
    ['Gerações', `${game.generation}`],
    ['Vitórias / derrotas', `${game.battlesWon} / ${game.battlesLost}`],
    ['Monumentos', `${game.monuments.length}`],
    [`Multiplicador (${o.name})`, `×${o.multiplier.toFixed(2)}`],
  ];

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint="purple" embers={24} />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 30, paddingHorizontal: 20, alignItems: 'center' }}>
        <Animated.View entering={ZoomIn.duration(900)}>
          <Art id="laurel" size={130} color={C.goldBright} accent={C.gold} weight={1.8} />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(300)} style={styles.finis}>FINIS</Animated.Text>
        <Text style={styles.dynasty}>{game.dynastyName}</Text>
        <Ornament width={200} />
        <Caps size={10} color={C.goldDeep} style={{ marginTop: 14 }}>LEGADO FINAL</Caps>
        <Text style={styles.score}>{score}</Text>

        <Panel style={{ alignSelf: 'stretch', marginTop: 10 }}>
          {rows.map(([k, v], i) => (
            <Animated.View key={k} entering={FadeInDown.delay(600 + i * 120)} style={styles.row}>
              <Text style={styles.rowKey}>{k}</Text>
              <Text style={styles.rowVal}>{v}</Text>
            </Animated.View>
          ))}
        </Panel>

        {showTier ? (
          <Animated.View entering={ZoomIn.springify().damping(11)} style={{ alignItems: 'center', marginTop: 20 }}>
            <Emblem index={newT.index} division={newT.division} size={150} animated={promoted} />
            {promoted ? <Caps size={12} color={C.goldBright} style={{ letterSpacing: 6, marginTop: 6 }}>PROMOVIDO</Caps> : null}
            {demoted ? <Caps size={12} color="#FF8A73" style={{ letterSpacing: 6, marginTop: 6 }}>REBAIXADO</Caps> : null}
            <Text style={styles.tier}>{newT.tier.title}{newT.division ? ` ${ROMAN[newT.division]}` : ''}</Text>
            <Text style={[styles.delta, { color: newPr >= oldPr ? C.good : C.bad }]}>
              {newPr >= oldPr ? '+' : ''}{newPr - oldPr} PR · total {newPr}
            </Text>
          </Animated.View>
        ) : null}

        <View style={{ alignSelf: 'stretch', marginTop: 24 }}>
          <RomanButton label="LER A CRÔNICA" variant="ghost" onPress={onChronicle} />
          <RomanButton label="RANKING" variant="ghost" onPress={onRanking} style={{ marginTop: 10 }} />
          <RomanButton label="TELA INICIAL" onPress={onTitle} style={{ marginTop: 10 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  finis: { fontFamily: F.titleBlack, fontSize: 44, letterSpacing: 14, color: C.goldBright, marginTop: 4 },
  dynasty: { fontFamily: F.bodyItalic, fontSize: 20, color: C.parchment, marginBottom: 6 },
  score: { fontFamily: F.titleBlack, fontSize: 54, color: C.marble, letterSpacing: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowKey: { fontFamily: F.body, color: C.parchment, fontSize: 16 },
  rowVal: { fontFamily: F.title, color: C.goldBright, fontSize: 15 },
  tier: { fontFamily: F.titleBlack, color: C.marble, fontSize: 26, letterSpacing: 2, marginTop: 4 },
  delta: { fontFamily: F.title, fontSize: 16, marginTop: 4 },
});
