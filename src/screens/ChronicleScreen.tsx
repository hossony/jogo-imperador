import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Art } from '../components/Art';
import { Backdrop } from '../components/Backdrop';
import { Caps, Ornament, ScreenHeader } from '../components/ui';
import type { ChronicleEntry, GameState } from '../game/types';
import { MONUMENTS, TRAITS } from '../game/world';
import { C, F, ROMAN, toRoman } from '../theme';

const TONE: Record<ChronicleEntry['tone'], string> = {
  marco: C.goldDeep,
  bom: '#5E7F4E',
  mau: '#9A3328',
  neutro: '#A89270',
};

type Row = { kind: 'gen'; gen: number } | { kind: 'entry'; e: ChronicleEntry; i: number };

export function ChronicleScreen({ game, onBack }: { game: GameState; onBack: () => void }) {
  const insets = useSafeAreaInsets();

  const rows = useMemo(() => {
    const out: Row[] = [];
    const list = [...game.chronicle].reverse();
    let gen = -1;
    list.forEach((e, i) => {
      if (e.generation !== gen) {
        gen = e.generation;
        out.push({ kind: 'gen', gen });
      }
      out.push({ kind: 'entry', e, i });
    });
    return out;
  }, [game.chronicle]);

  const header = (
    <View>
      <LinearGradient colors={['#EFE3C4', '#DCC799']} style={styles.parchmentTop}>
        <Caps size={10} color={C.oxblood} style={{ textAlign: 'center' }}>ANNALES</Caps>
        <Text style={styles.dynasty}>{game.dynastyName}</Text>
        <Text style={styles.subtitle}>{game.name}, geração {ROMAN[game.generation]}</Text>
        <Ornament width={160} color={C.goldDeep} />
        <Text style={styles.blockTitle}>Traços</Text>
        <View style={styles.chips}>
          {game.traits.length === 0 ? <Text style={styles.empty}>Nenhum ainda. Suas escolhas vão defini-lo.</Text> : null}
          {game.traits.map((t) => (
            <View key={t} style={[styles.chip, { borderColor: TRAITS[t]?.good ? '#5E7F4E' : '#9A3328' }]}>
              <Text style={[styles.chipText, { color: TRAITS[t]?.good ? '#3F5E33' : '#7E2A20' }]}>{TRAITS[t]?.label ?? t}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.blockTitle}>Monumentos</Text>
        <View style={styles.chips}>
          {game.monuments.length === 0 ? <Text style={styles.empty}>Roma ainda não tem pedras com o seu nome.</Text> : null}
          {game.monuments.map((m) => (
            <View key={m} style={[styles.chip, { borderColor: C.goldDeep }]}>
              <Text style={[styles.chipText, { color: C.oxblood }]}>{MONUMENTS[m]?.label ?? m}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Backdrop tint="night" embers={4} />
      <ScreenHeader title="CRÔNICA" latin="HISTORIA" onBack={onBack} />
      <FlatList
        data={rows}
        keyExtractor={(r, i) => (r.kind === 'gen' ? `g${r.gen}-${i}` : `e${r.i}`)}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 30 }}
        renderItem={({ item }) =>
          item.kind === 'gen' ? (
            <View style={styles.genRow}>
              <Art id="family" size={22} color={C.oxblood} accent={C.goldDeep} weight={5} />
              <Text style={styles.genText}>GENERATIO {ROMAN[item.gen]}</Text>
            </View>
          ) : (
            <View style={styles.entry}>
              <View style={[styles.mark, { backgroundColor: TONE[item.e.tone] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.year}>ANNO {toRoman(item.e.year)}</Text>
                <Text style={[styles.text, item.e.tone === 'marco' && styles.textMarco]}>{item.e.text}</Text>
              </View>
            </View>
          )
        }
        style={styles.scroll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: 10, backgroundColor: '#E6D6AE', borderRadius: 6, borderWidth: 1, borderColor: C.goldDeep, marginBottom: 10 },
  parchmentTop: { marginHorizontal: -16, paddingHorizontal: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(110,80,40,0.4)' },
  dynasty: { fontFamily: F.titleBlack, fontSize: 26, color: '#3A1A12', textAlign: 'center', letterSpacing: 2, marginTop: 4 },
  subtitle: { fontFamily: F.bodyItalic, fontSize: 16, color: '#6B5440', textAlign: 'center', marginBottom: 8 },
  blockTitle: { fontFamily: F.title, fontSize: 12, color: C.oxblood, letterSpacing: 3, marginTop: 14, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 3, marginRight: 6, marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.25)' },
  chipText: { fontFamily: F.bodyBold, fontSize: 14 },
  empty: { fontFamily: F.bodyItalic, fontSize: 15, color: '#7A6650' },
  genRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 6 },
  genText: { fontFamily: F.title, fontSize: 12, color: C.oxblood, letterSpacing: 4, marginLeft: 8 },
  entry: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(110,80,40,0.25)' },
  mark: { width: 3, borderRadius: 2, marginRight: 10, marginVertical: 2 },
  year: { fontFamily: F.caps, fontSize: 9, letterSpacing: 2, color: '#8A7050' },
  text: { fontFamily: F.body, fontSize: 16.5, color: '#2A1A12', lineHeight: 21 },
  textMarco: { fontFamily: F.bodyBold, color: '#3A1A12' },
});
