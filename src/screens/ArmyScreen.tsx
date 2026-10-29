import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Art } from '../components/Art';
import { Backdrop } from '../components/Backdrop';
import { Caps, Ornament, Panel, ProgressBar, RomanButton, ScreenHeader, thump } from '../components/ui';
import {
  armyCap, armyPower, armySize, buyReform, buyUnit, canBuyReform, canBuyUnit, income, unitCost,
} from '../game/engine';
import type { GameState } from '../game/types';
import { REFORMS, UNITS, type Unit } from '../game/world';
import { C, F } from '../theme';

function Bump({ value, style }: { value: number; style: object }) {
  const s = useSharedValue(1);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) {
      s.value = withSequence(withTiming(1.35, { duration: 120 }), withSpring(1));
      prev.current = value;
    }
  }, [value, s]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.Text style={[style, st]}>{value}</Animated.Text>;
}

interface Props {
  game: GameState;
  setGame: (s: GameState) => void;
  onBack: () => void;
}

export function ArmyScreen({ game, setGame, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const power = armyPower(game);
  const size = armySize(game);
  const cap = armyCap(game);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Backdrop tint="wine" embers={8} />
      <ScreenHeader title="LEGIÕES" latin="EXERCITVS" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 30 }}>
        <Panel>
          <View style={styles.hero}>
            <Art id="eagle" size={74} color={C.goldBright} accent={C.gold} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Caps size={9} color={C.goldDeep}>FORÇA TOTAL</Caps>
              <Bump value={power} style={styles.power} />
              <Text style={styles.sub}>Moral das legiões: {game.stats.legioes}%</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Caps size={9} color={C.smoke}>TROPAS {size}/{cap}</Caps>
              <View style={{ marginTop: 6 }}><ProgressBar value={size / cap} /></View>
            </View>
            <View style={{ marginLeft: 18, alignItems: 'flex-end' }}>
              <Caps size={9} color={C.smoke}>DENÁRIOS</Caps>
              <Bump value={game.denarios} style={styles.denarios} />
              <Text style={styles.income}>+{income(game)} por carta</Text>
            </View>
          </View>
        </Panel>

        <Ornament width={200} />
        <Caps size={11} style={styles.section}>RECRUTAR</Caps>
        {UNITS.map((u: Unit, i) => {
          const why = canBuyUnit(game, u.id);
          return (
            <Animated.View key={u.id} entering={FadeInDown.delay(i * 60)}>
              <View style={styles.unit}>
                <View style={styles.unitArt}>
                  <Art id={u.art} size={44} color={C.gold} accent={C.goldBright} weight={3} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.unitName}>{u.name}</Text>
                  <Text style={styles.unitDesc}>{u.desc}</Text>
                  <Text style={styles.unitMeta}>Força {u.power} · {unitCost(game, u.id)} denários</Text>
                </View>
                <View style={{ alignItems: 'center', width: 76 }}>
                  <Bump value={game.units[u.id]} style={styles.count} />
                  <RomanButton
                    label="+1"
                    small
                    disabled={!!why}
                    onPress={() => {
                      thump();
                      setGame(buyUnit(game, u.id));
                    }}
                    style={{ marginTop: 4, width: 64 }}
                  />
                </View>
              </View>
              {why && why !== 'Denários insuficientes' ? <Text style={styles.why}>{why}</Text> : null}
            </Animated.View>
          );
        })}

        <Ornament width={200} />
        <Caps size={11} style={styles.section}>REFORMAS MILITARES</Caps>
        {REFORMS.map((r, i) => {
          const why = canBuyReform(game, r.id);
          const owned = game.reforms.includes(r.id);
          return (
            <Animated.View key={r.id} entering={FadeInDown.delay(300 + i * 60)}>
              <Panel glow={owned ? C.gold : undefined} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.unitName, owned && { color: C.goldBright }]}>{r.name}</Text>
                    <Text style={styles.unitDesc}>{r.desc}</Text>
                    {!owned ? <Text style={styles.unitMeta}>{r.cost} denários{why && why !== 'Denários insuficientes' ? ` · ${why}` : ''}</Text> : null}
                  </View>
                  {owned ? (
                    <Art id="laurel" size={40} color={C.goldBright} accent={C.gold} weight={3} />
                  ) : (
                    <RomanButton
                      label="ADOTAR"
                      small
                      variant="purple"
                      disabled={!!why}
                      onPress={() => {
                        thump();
                        setGame(buyReform(game, r.id));
                      }}
                    />
                  )}
                </View>
              </Panel>
            </Animated.View>
          );
        })}
        <Text style={styles.footer}>
          A força depende das tropas, das reformas, dos seus traços e da moral (barra de Legiões). Cada conquista aumenta o limite de tropas e o tributo das províncias.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center' },
  power: { fontFamily: F.titleBlack, color: C.goldBright, fontSize: 40 },
  sub: { fontFamily: F.bodyItalic, color: C.smoke, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 14 },
  denarios: { fontFamily: F.titleBlack, color: C.goldBright, fontSize: 22 },
  income: { fontFamily: F.bodyItalic, color: C.good, fontSize: 13 },
  section: { textAlign: 'center', marginVertical: 12, letterSpacing: 5 },
  unit: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(212,175,99,0.2)',
  },
  unitArt: {
    width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: 'rgba(212,175,99,0.4)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)',
  },
  unitName: { fontFamily: F.title, color: C.marble, fontSize: 16, letterSpacing: 1 },
  unitDesc: { fontFamily: F.body, color: C.parchment, fontSize: 14.5, lineHeight: 18 },
  unitMeta: { fontFamily: F.caps, color: C.gold, fontSize: 9.5, letterSpacing: 1, marginTop: 3 },
  count: { fontFamily: F.titleBlack, color: C.marble, fontSize: 22 },
  why: { fontFamily: F.bodyItalic, color: C.stone, fontSize: 12, textAlign: 'right', marginTop: -6, marginBottom: 4 },
  footer: { fontFamily: F.bodyItalic, color: C.stone, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 19 },
});
