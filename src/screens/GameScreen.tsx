import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Art } from '../components/Art';
import { Backdrop } from '../components/Backdrop';
import { isMoment, MomentOverlay, Toast } from '../components/Overlays';
import { StatBar } from '../components/StatBar';
import { DeckShadow, SwipeCard, type SwipeCardHandle } from '../components/SwipeCard';
import { Caps, Ornament, RomanButton, tap } from '../components/ui';
import {
  applyChoice, armyPower, endChronicle, eraInfo, eraOf, finalScore, getCard, liveLegado, previewOf, yearOf,
} from '../game/engine';
import type { ArtId, GameEvent, GameState } from '../game/types';
import { STAT_KEYS } from '../game/types';
import { originById, STATUS } from '../game/world';
import { C, F, ROMAN, toRoman } from '../theme';

interface Props {
  game: GameState;
  setGame: (s: GameState) => void;
  events: GameEvent[];
  pushEvents: (e: GameEvent[]) => void;
  shiftEvent: () => void;
  onMap: () => void;
  onArmy: () => void;
  onChronicle: () => void;
  onTitle: () => void;
  onEnd: (s: GameState) => void;
}

function NavButton({ art, label, value, onPress, alert }: { art: ArtId; label: string; value?: string; onPress: () => void; alert?: boolean }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} style={({ pressed }) => [styles.nav, pressed && { opacity: 0.6 }]}>
      <View>
        <Art id={art} size={30} color={C.gold} accent={C.goldBright} weight={4.5} />
        {alert ? <View style={styles.alertDot} /> : null}
      </View>
      <Text style={styles.navLabel}>{label}</Text>
      {value ? <Text style={styles.navValue}>{value}</Text> : null}
    </Pressable>
  );
}

export function GameScreen(p: Props) {
  const { game } = p;
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drag = useSharedValue(0);
  const cardRef = useRef<SwipeCardHandle>(null);
  const [menu, setMenu] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const card = useMemo(() => (game.currentCardId ? getCard(game.currentCardId) : null), [game.currentCardId]);
  const left = useMemo(() => (card ? previewOf(card, 'left') : {}), [card]);
  const right = useMemo(() => (card ? previewOf(card, 'right') : {}), [card]);
  const era = eraOf(game.turn);
  const cardW = Math.min(width - 56, 360);
  const isCrisis = card?.kind === 'crise';

  const onDecide = useCallback(
    (side: 'left' | 'right') => {
      const r = applyChoice(game, side);
      p.setGame(r.state);
      const shown = r.events.filter((e) => e.type !== 'end');
      if (shown.length) p.pushEvents(shown);
      if (r.state.ended) setTimeout(() => p.onEnd(r.state), shown.some(isMoment) ? 0 : 400);
    },
    [game, p],
  );

  const head = p.events[0];
  const moment = head && isMoment(head) ? head : null;
  const toast = head && !isMoment(head) ? head : null;
  const campaignReady = game.campaignCooldown === 0;

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={isCrisis ? 'crisis' : game.status >= 6 ? 'purple' : 'wine'} embers={isCrisis ? 22 : 12} />
      <View style={{ paddingTop: insets.top + 6, flex: 1 }}>
        {/* Cabeçalho */}
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{game.name}</Text>
            <Text style={styles.status}>
              {STATUS[game.status].label} · {originById(game.origin).name}
            </Text>
          </View>
          <View style={styles.chips}>
            <View style={styles.chip}>
              <Art id="coins" size={18} color={C.goldBright} accent={C.gold} weight={6} />
              <Text style={styles.chipText}>{game.denarios}</Text>
            </View>
            <View style={styles.chip}>
              <Art id="laurel" size={18} color={C.goldBright} accent={C.gold} weight={6} />
              <Text style={styles.chipText}>{liveLegado(game)}</Text>
            </View>
          </View>
        </View>

        {/* Barras */}
        <View style={styles.stats}>
          {STAT_KEYS.map((k) => (
            <StatBar key={k} stat={k} value={game.stats[k]} drag={drag} previewLeft={left[k]} previewRight={right[k]} />
          ))}
        </View>
        <View style={styles.strip}>
          <Caps size={9} color={C.goldDeep}>
            ANNO {toRoman(yearOf(game.turn))} · {eraInfo(era).latin} · {Math.floor(game.age)} ANOS · GEN. {ROMAN[game.generation]}
          </Caps>
        </View>

        {/* Carta */}
        <View style={styles.cardArea}>
          {card ? (
            <View style={{ width: cardW, height: cardW * 1.32 }}>
              <DeckShadow width={cardW} />
              <SwipeCard
                key={`${game.generation}-${game.turn}-${game.currentCardId}`}
                ref={cardRef}
                card={card}
                width={cardW}
                drag={drag}
                onDecide={onDecide}
              />
            </View>
          ) : null}
        </View>

        {/* Escolhas tocáveis */}
        {card ? (
          <Animated.View key={`ch-${game.turn}-${game.currentCardId}`} entering={FadeIn.delay(250)} style={styles.choices}>
            <Pressable onPress={() => cardRef.current?.choose('left')} style={styles.choiceBtn} hitSlop={6}>
              <Text style={styles.arrow}>‹</Text>
              <Text style={styles.choiceText} numberOfLines={2}>{card.left.label}</Text>
            </Pressable>
            <View style={styles.choiceDivider} />
            <Pressable onPress={() => cardRef.current?.choose('right')} style={[styles.choiceBtn, { justifyContent: 'flex-end' }]} hitSlop={6}>
              <Text style={[styles.choiceText, { textAlign: 'right' }]} numberOfLines={2}>{card.right.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </Animated.View>
        ) : null}

        {/* Navegação */}
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
          <NavButton art="road" label="MAPA" value={`${game.provinces.length} prov.`} onPress={p.onMap} alert={campaignReady && game.provinces.length < 18} />
          <NavButton art="eagle" label="LEGIÕES" value={`${armyPower(game)} força`} onPress={p.onArmy} />
          <NavButton art="scroll" label="CRÔNICA" value={`${game.traits.length} traços`} onPress={p.onChronicle} />
          <NavButton art="column" label="MENU" onPress={() => setMenu(true)} />
        </Animated.View>
      </View>

      {toast ? <Toast key={`t-${p.events.length}-${toast.type}`} event={toast} onDone={p.shiftEvent} /> : null}
      {moment ? <MomentOverlay key={`m-${p.events.length}-${moment.type}`} event={moment} onClose={p.shiftEvent} /> : null}

      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Caps size={10} color={C.goldDeep} style={{ textAlign: 'center' }}>{game.dynastyName.toUpperCase()}</Caps>
            <Text style={styles.modalTitle}>Pausa</Text>
            <Ornament width={150} />
            <Text style={styles.modalInfo}>Legado atual: {finalScore(game)} pontos (com multiplicador)</Text>
            {confirmEnd ? (
              <>
                <Text style={styles.modalWarn}>Encerrar agora conta a pontuação atual para o ranking. Não dá para desfazer.</Text>
                <RomanButton label="ENCERRAR CRÔNICA" variant="crimson" onPress={() => { setMenu(false); setConfirmEnd(false); p.onEnd(endChronicle(game)); }} style={{ marginTop: 10 }} />
                <RomanButton label="VOLTAR" variant="ghost" small onPress={() => setConfirmEnd(false)} style={{ marginTop: 10 }} />
              </>
            ) : (
              <>
                <RomanButton label="CONTINUAR" onPress={() => setMenu(false)} style={{ marginTop: 16 }} />
                <RomanButton label="TELA INICIAL" variant="ghost" small onPress={() => { setMenu(false); p.onTitle(); }} style={{ marginTop: 10 }} />
                <RomanButton label="ENCERRAR CRÔNICA" variant="ghost" small onPress={() => setConfirmEnd(true)} style={{ marginTop: 10 }} />
                <Text style={styles.modalHint}>O jogo é salvo automaticamente a cada carta.</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  name: { fontFamily: F.title, color: C.marble, fontSize: 17, letterSpacing: 1 },
  status: { fontFamily: F.bodyItalic, color: C.gold, fontSize: 15 },
  chips: { flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 0.8, borderColor: 'rgba(212,175,99,0.4)', borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.25)',
  },
  chipText: { fontFamily: F.title, color: C.goldBright, fontSize: 13, marginLeft: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginTop: 6 },
  strip: { alignItems: 'center', marginTop: 8 },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  choices: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 8 },
  choiceBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  choiceDivider: { width: 1, height: 26, backgroundColor: 'rgba(212,175,99,0.3)', marginHorizontal: 8 },
  arrow: { fontFamily: F.title, color: C.gold, fontSize: 26, marginHorizontal: 6, marginTop: -4 },
  choiceText: { flex: 1, fontFamily: F.bodyItalic, color: C.parchment, fontSize: 15.5 },
  bottom: {
    flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 0.8, borderTopColor: 'rgba(212,175,99,0.25)',
    paddingTop: 8, backgroundColor: 'rgba(8,5,4,0.55)',
  },
  nav: { alignItems: 'center', width: 80 },
  navLabel: { fontFamily: F.caps, fontSize: 9, letterSpacing: 2, color: C.gold, marginTop: 3 },
  navValue: { fontFamily: F.bodyItalic, fontSize: 12, color: C.smoke },
  alertDot: { position: 'absolute', right: -4, top: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8644F', borderWidth: 1, borderColor: C.night },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 28 },
  modal: { backgroundColor: '#17100D', borderColor: C.gold, borderWidth: 1, borderRadius: 6, padding: 22 },
  modalTitle: { fontFamily: F.title, fontSize: 26, color: C.marble, textAlign: 'center', letterSpacing: 4, marginVertical: 6 },
  modalInfo: { fontFamily: F.bodyItalic, color: C.parchment, fontSize: 16, textAlign: 'center', marginTop: 10 },
  modalWarn: { fontFamily: F.body, color: '#FFB09A', fontSize: 16, textAlign: 'center', marginTop: 14, lineHeight: 22 },
  modalHint: { fontFamily: F.bodyItalic, color: C.stone, fontSize: 13, textAlign: 'center', marginTop: 14 },
});
