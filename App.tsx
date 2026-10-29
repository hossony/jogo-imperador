// importa só os pesos usados, para o APK ficar menor
import { Cinzel_400Regular } from '@expo-google-fonts/cinzel/400Regular';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel/700Bold';
import { Cinzel_900Black } from '@expo-google-fonts/cinzel/900Black';
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond/500Medium_Italic';
import { CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { emptyProfile, newGame, recordRun } from './src/game/engine';
import { loadGame, loadProfile, saveGame, saveProfile } from './src/game/storage';
import type { GameEvent, GameState, OriginId, Profile, RunRecord } from './src/game/types';
import { ArmyScreen } from './src/screens/ArmyScreen';
import { ChronicleScreen } from './src/screens/ChronicleScreen';
import { EndScreen } from './src/screens/EndScreen';
import { GameScreen } from './src/screens/GameScreen';
import { MapScreen } from './src/screens/MapScreen';
import { OriginScreen } from './src/screens/OriginScreen';
import { RankingScreen } from './src/screens/RankingScreen';
import { TitleScreen } from './src/screens/TitleScreen';
import { C } from './src/theme';

type Screen = 'title' | 'origin' | 'game' | 'map' | 'army' | 'chronicle' | 'ranking' | 'end';

interface EndInfo {
  game: GameState;
  record: RunRecord;
  oldPr: number;
  newPr: number;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    Cinzel_900Black,
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_700Bold,
  });
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('title');
  const [game, setGame] = useState<GameState | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [endInfo, setEndInfo] = useState<EndInfo | null>(null);
  const [backFromChronicle, setBackFromChronicle] = useState<Screen>('game');
  const [backFromRanking, setBackFromRanking] = useState<Screen>('title');

  useEffect(() => {
    Promise.all([loadGame(), loadProfile()]).then(([g, p]) => {
      setGame(g);
      setProfile(p);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveGame(game);
  }, [game, ready]);

  const go = useCallback((s: Screen) => setScreen(s), []);
  const pushEvents = useCallback((e: GameEvent[]) => setEvents((q) => [...q, ...e]), []);
  const shiftEvent = useCallback(() => setEvents((q) => q.slice(1)), []);

  const startGame = (origin: OriginId, name: string, dynasty: string) => {
    setEvents([]);
    setGame(newGame(origin, name, dynasty));
    setScreen('game');
  };

  const finish = useCallback(
    (ended: GameState) => {
      const { profile: next, record } = recordRun(profile, ended);
      setEndInfo({ game: ended, record, oldPr: profile.pr, newPr: next.pr });
      setProfile(next);
      saveProfile(next);
      setGame(null);
      setEvents([]);
      setScreen('end');
    },
    [profile],
  );

  // botão "voltar" do Android
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      switch (screen) {
        case 'map':
        case 'army':
          setScreen('game');
          return true;
        case 'chronicle':
          setScreen(backFromChronicle);
          return true;
        case 'ranking':
          setScreen(backFromRanking);
          return true;
        case 'origin':
        case 'game':
        case 'end':
          setScreen('title');
          return true;
        default:
          return false;
      }
    });
    return () => sub.remove();
  }, [screen, backFromChronicle, backFromRanking]);

  if (!fontsLoaded || !ready) {
    return (
      <View style={{ flex: 1, backgroundColor: C.night, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.gold} />
      </View>
    );
  }

  let content: React.ReactNode = null;
  if (screen === 'title') {
    content = (
      <TitleScreen
        save={game}
        profile={profile}
        onContinue={() => go('game')}
        onNew={() => go('origin')}
        onRanking={() => { setBackFromRanking('title'); go('ranking'); }}
      />
    );
  } else if (screen === 'origin') {
    content = <OriginScreen onBack={() => go('title')} onStart={startGame} />;
  } else if (screen === 'game' && game) {
    content = (
      <GameScreen
        game={game}
        setGame={setGame}
        events={events}
        pushEvents={pushEvents}
        shiftEvent={shiftEvent}
        onMap={() => go('map')}
        onArmy={() => go('army')}
        onChronicle={() => { setBackFromChronicle('game'); go('chronicle'); }}
        onTitle={() => go('title')}
        onEnd={finish}
      />
    );
  } else if (screen === 'map' && game) {
    content = <MapScreen game={game} setGame={setGame} pushEvents={pushEvents} onBack={() => go('game')} />;
  } else if (screen === 'army' && game) {
    content = <ArmyScreen game={game} setGame={setGame} onBack={() => go('game')} />;
  } else if (screen === 'chronicle') {
    const g = backFromChronicle === 'end' ? endInfo?.game : game;
    content = g ? <ChronicleScreen game={g} onBack={() => go(backFromChronicle)} /> : null;
  } else if (screen === 'ranking') {
    content = <RankingScreen profile={profile} onBack={() => go(backFromRanking)} />;
  } else if (screen === 'end' && endInfo) {
    content = (
      <EndScreen
        game={endInfo.game}
        record={endInfo.record}
        oldPr={endInfo.oldPr}
        newPr={endInfo.newPr}
        onChronicle={() => { setBackFromChronicle('end'); go('chronicle'); }}
        onRanking={() => { setBackFromRanking('end'); go('ranking'); }}
        onTitle={() => go('title')}
      />
    );
  }
  if (!content) content = <TitleScreen save={game} profile={profile} onContinue={() => go('game')} onNew={() => go('origin')} onRanking={() => go('ranking')} />;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.night }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Animated.View key={screen} entering={FadeIn.duration(320)} style={{ flex: 1 }}>
          {content}
        </Animated.View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
