import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Backdrop } from '../components/Backdrop';
import { Emblem } from '../components/Emblem';
import { Caps, Ornament, Panel, ProgressBar, ScreenHeader } from '../components/ui';
import { expectedScore, tierOf } from '../game/engine';
import type { Profile } from '../game/types';
import { LEGENDS, originById, PR_PER_DIVISION, TIERS } from '../game/world';
import { C, F, ROMAN } from '../theme';

export function RankingScreen({ profile, onBack }: { profile: Profile; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const t = tierOf(profile.pr);
  const nextLabel = useMemo(() => {
    if (t.nextAt === null) return 'Você chegou ao topo do mundo.';
    const nt = tierOf(t.nextAt);
    return `Faltam ${t.nextAt - profile.pr} PR para ${nt.tier.title}${nt.division ? ` ${ROMAN[nt.division]}` : ''}`;
  }, [t, profile.pr]);

  const hall = useMemo(() => {
    const rows = [
      ...LEGENDS.map((l) => ({ name: l.name, note: l.note, score: l.score, mine: false })),
      ...profile.runs.slice(0, 15).map((r) => ({
        name: r.name,
        note: `${r.dynastyName} · ${originById(r.origin).name} · ${r.provinces} prov.`,
        score: r.score,
        mine: true,
      })),
    ];
    return rows.sort((a, b) => b.score - a.score).slice(0, 18);
  }, [profile.runs]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Backdrop tint="purple" embers={16} />
      <ScreenHeader title="RANKING" latin="GLORIA" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={{ alignItems: 'center', marginTop: 6 }}>
          <Emblem index={t.index} division={t.division} size={190} animated />
        </Animated.View>
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Caps size={11} color={TIERS[t.index].colors[2]} style={{ letterSpacing: 5 }}>{t.tier.metal.toUpperCase()}</Caps>
          <Text style={styles.tierTitle}>{t.tier.title}{t.division ? ` ${ROMAN[t.division]}` : ''}</Text>
          <Text style={styles.pr}>{profile.pr} pontos de ranking</Text>
        </View>
        <View style={{ paddingHorizontal: 40, marginTop: 12 }}>
          <ProgressBar value={t.nextAt === null ? 1 : t.progress} color={TIERS[t.index].colors[1]} height={8} />
          <Text style={styles.next}>{nextLabel}</Text>
          {t.nextAt !== null ? (
            <Text style={styles.expect}>Para subir, uma crônica precisa passar de ~{Math.round(expectedScore(profile.pr))} de legado.</Text>
          ) : null}
        </View>

        <View style={{ marginTop: 18 }}><Ornament width={220} /></View>
        <Caps size={11} style={styles.section}>OS ELOS</Caps>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
          {TIERS.map((tier, i) => {
            const reached = i <= t.index;
            return (
              <Animated.View key={tier.id} entering={FadeInDown.delay(i * 70)} style={[styles.ladderItem, i === t.index && styles.ladderActive]}>
                <View style={{ opacity: reached ? 1 : 0.35 }}>
                  <Emblem index={i} size={78} />
                </View>
                <Text style={[styles.ladderMetal, { color: reached ? tier.colors[2] : C.stone }]}>{tier.metal}</Text>
                <Text style={styles.ladderTitle}>{tier.title}</Text>
                <Text style={styles.ladderPr}>{i * PR_PER_DIVISION * 3}+ PR</Text>
              </Animated.View>
            );
          })}
        </ScrollView>

        <Ornament width={220} />
        <Caps size={11} style={styles.section}>SALÃO DO LEGADO</Caps>
        <View style={{ paddingHorizontal: 16 }}>
          <Panel>
            {hall.map((r, i) => (
              <View key={`${r.name}-${i}`} style={[styles.hallRow, r.mine && styles.hallMine]}>
                <Text style={styles.hallPos}>{ROMAN[i + 1] ?? i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.hallName, r.mine && { color: C.goldBright }]}>{r.name}</Text>
                  <Text style={styles.hallNote} numberOfLines={1}>{r.note}</Text>
                </View>
                <Text style={[styles.hallScore, r.mine && { color: C.goldBright }]}>{r.score}</Text>
              </View>
            ))}
            {profile.runs.length === 0 ? (
              <Text style={styles.empty}>Termine sua primeira crônica para entrar no Salão ao lado dos grandes de Roma.</Text>
            ) : null}
          </Panel>
          <Text style={styles.local}>Ranking salvo neste aparelho.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tierTitle: { fontFamily: F.titleBlack, color: C.marble, fontSize: 30, letterSpacing: 3, marginTop: 4 },
  pr: { fontFamily: F.bodyItalic, color: C.parchment, fontSize: 17 },
  next: { fontFamily: F.body, color: C.parchment, fontSize: 15, textAlign: 'center', marginTop: 8 },
  expect: { fontFamily: F.bodyItalic, color: C.stone, fontSize: 13, textAlign: 'center', marginTop: 4 },
  section: { textAlign: 'center', marginVertical: 12, letterSpacing: 5 },
  ladderItem: { alignItems: 'center', width: 104, paddingVertical: 10, marginHorizontal: 3, borderRadius: 6 },
  ladderActive: { backgroundColor: 'rgba(212,175,99,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,99,0.5)' },
  ladderMetal: { fontFamily: F.caps, fontSize: 9, letterSpacing: 1, marginTop: 6, textAlign: 'center' },
  ladderTitle: { fontFamily: F.title, color: C.marble, fontSize: 12, marginTop: 2 },
  ladderPr: { fontFamily: F.bodyItalic, color: C.stone, fontSize: 12 },
  hallRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: 'rgba(212,175,99,0.15)' },
  hallMine: { backgroundColor: 'rgba(212,175,99,0.08)' },
  hallPos: { fontFamily: F.title, color: C.goldDeep, fontSize: 13, width: 44 },
  hallName: { fontFamily: F.title, color: C.marble, fontSize: 15 },
  hallNote: { fontFamily: F.bodyItalic, color: C.smoke, fontSize: 13 },
  hallScore: { fontFamily: F.titleBlack, color: C.parchment, fontSize: 17, marginLeft: 8 },
  empty: { fontFamily: F.bodyItalic, color: C.smoke, fontSize: 15, textAlign: 'center', marginTop: 10 },
  local: { fontFamily: F.bodyItalic, color: C.stone, fontSize: 12, textAlign: 'center', marginTop: 8 },
});
