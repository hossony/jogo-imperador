import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Art } from '../components/Art';
import { Backdrop } from '../components/Backdrop';
import { Emblem } from '../components/Emblem';
import { Caps, Meander, Ornament, RomanButton } from '../components/ui';
import { tierOf } from '../game/engine';
import type { GameState, Profile } from '../game/types';
import { originById, STATUS } from '../game/world';
import { C, F, ROMAN } from '../theme';

interface Props {
  save: GameState | null;
  profile: Profile;
  onContinue: () => void;
  onNew: () => void;
  onRanking: () => void;
}

export function TitleScreen({ save, profile, onContinue, onNew, onRanking }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [howTo, setHowTo] = useState(false);
  const tier = tierOf(profile.pr);

  const breathe = useSharedValue(0);
  const laurel = useSharedValue(0);
  useEffect(() => {
    breathe.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);
    laurel.value = withSequence(withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) }));
  }, [breathe, laurel]);

  const glow = useAnimatedStyle(() => ({ opacity: 0.35 + breathe.value * 0.45, transform: [{ scale: 0.96 + breathe.value * 0.06 }] }));
  const laurelStyle = useAnimatedStyle(() => ({ opacity: laurel.value, transform: [{ scale: 0.7 + laurel.value * 0.3 }, { rotate: `${(1 - laurel.value) * -20}deg` }] }));

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint="wine" embers={22} />
      <Pressable style={[styles.rank, { top: insets.top + 12 }]} onPress={onRanking}>
        <Emblem index={tier.index} division={tier.division} size={58} />
        <View style={{ marginLeft: 8 }}>
          <Caps size={8} color={C.goldDeep}>{tier.tier.metal.toUpperCase()}</Caps>
          <Text style={styles.rankTitle}>{tier.tier.title}{tier.division ? ` ${ROMAN[tier.division]}` : ''}</Text>
          <Text style={styles.rankPr}>{profile.pr} PR</Text>
        </View>
      </Pressable>

      <View style={[styles.center, { paddingTop: insets.top + 70 }]}>
        <View style={styles.hero}>
          <Animated.View style={[styles.heroGlow, glow]} />
          <Animated.View style={laurelStyle}>
            <Art id="laurel" size={width * 0.62} color={C.gold} accent={C.goldBright} weight={1.6} />
          </Animated.View>
          <View style={styles.eagle}>
            <Art id="eagle" size={width * 0.26} color={C.goldBright} accent={C.gold} weight={2.2} />
          </View>
        </View>
        <Animated.Text entering={FadeIn.delay(300).duration(1200)} style={styles.title}>IMPERIVM</Animated.Text>
        <Animated.View entering={FadeIn.delay(700).duration(1000)}>
          <Ornament width={220} />
          <Text style={styles.tagline}>Escreva sua história em Roma, carta por carta.</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(900).duration(700)} style={[styles.menu, { paddingBottom: insets.bottom + 26 }]}>
        {save ? (
          <RomanButton
            label="CONTINVAR"
            sub={`${save.name} · ${STATUS[save.status].label} · ${originById(save.origin).name}`}
            onPress={onContinue}
          />
        ) : null}
        <RomanButton label="NOVA HISTÓRIA" variant={save ? 'ghost' : 'gold'} onPress={onNew} style={{ marginTop: 12 }} />
        <View style={styles.row}>
          <RomanButton label="RANKING" variant="ghost" small onPress={onRanking} style={{ flex: 1, marginRight: 6 }} />
          <RomanButton label="COMO JOGAR" variant="ghost" small onPress={() => setHowTo(true)} style={{ flex: 1, marginLeft: 6 }} />
        </View>
        <View style={{ marginTop: 18 }}>
          <Meander width={width - 80} opacity={0.3} />
        </View>
      </Animated.View>

      <Modal visible={howTo} transparent animationType="fade" onRequestClose={() => setHowTo(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Caps size={10} color={C.goldDeep} style={{ textAlign: 'center' }}>REGVLAE</Caps>
            <Text style={styles.modalTitle}>Como jogar</Text>
            <Ornament width={160} />
            <ScrollView style={{ marginTop: 12 }}>
              {[
                ['Arraste a carta', 'Para a esquerda ou para a direita. Cada lado é uma escolha. Você também pode tocar nos nomes das escolhas abaixo da carta.'],
                ['Quatro forças', 'Senado, Plebe, Legiões e Tesouro. Os pontos que aparecem acima delas mostram o que a escolha vai mexer. Ponto grande, efeito forte.'],
                ['Você não morre', 'Se uma força zerar ou estourar, você cai na hierarquia: cônsul vira senador, cidadão vira peregrino, peregrino vira escravo. E a história continua.'],
                ['Suba na vida', 'De escravo a imperador. Cartas de ascensão aparecem quando você tem ouro, legado e províncias suficientes.'],
                ['Conquiste', 'No mapa, marche contra províncias vizinhas. Fortaleça as legiões com tropas e reformas. Cidades muradas pedem máquinas de cerco.'],
                ['Dinastia', 'Quando envelhecer, o herdeiro assume. Depois de três gerações a crônica termina e sua pontuação de legado vai para o ranking.'],
                ['Ranking', 'Do Bronze ao Imperador Grão-Mestre. Origens difíceis valem mais pontos.'],
              ].map(([t, d]) => (
                <View key={t} style={{ marginBottom: 14 }}>
                  <Text style={styles.ruleTitle}>{t}</Text>
                  <Text style={styles.ruleText}>{d}</Text>
                </View>
              ))}
            </ScrollView>
            <RomanButton label="ENTENDI" small onPress={() => setHowTo(false)} style={{ marginTop: 6 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rank: { position: 'absolute', right: 16, flexDirection: 'row', alignItems: 'center', zIndex: 5 },
  rankTitle: { fontFamily: F.title, color: C.marble, fontSize: 13, letterSpacing: 1 },
  rankPr: { fontFamily: F.bodyItalic, color: C.smoke, fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', justifyContent: 'center' },
  heroGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(212,175,99,0.16)', shadowColor: C.goldBright, shadowOpacity: 1, shadowRadius: 50 },
  eagle: { position: 'absolute' },
  title: { fontFamily: F.titleBlack, fontSize: 46, letterSpacing: 10, color: C.goldBright, marginTop: 6, textShadowColor: 'rgba(242,213,140,0.5)', textShadowRadius: 18 },
  tagline: { fontFamily: F.bodyItalic, color: C.parchment, fontSize: 18, marginTop: 8, textAlign: 'center' },
  menu: { paddingHorizontal: 32 },
  row: { flexDirection: 'row', marginTop: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 22 },
  modal: { backgroundColor: '#17100D', borderColor: C.gold, borderWidth: 1, borderRadius: 6, padding: 20, maxHeight: '86%' },
  modalTitle: { fontFamily: F.title, fontSize: 24, color: C.marble, textAlign: 'center', letterSpacing: 3, marginVertical: 6 },
  ruleTitle: { fontFamily: F.title, color: C.goldBright, fontSize: 14, letterSpacing: 1.5 },
  ruleText: { fontFamily: F.body, color: C.parchment, fontSize: 17, lineHeight: 22, marginTop: 2 },
});
