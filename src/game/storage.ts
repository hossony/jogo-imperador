import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyProfile } from './engine';
import type { GameState, Profile } from './types';

const GAME_KEY = 'imperium.game.v1';
const PROFILE_KEY = 'imperium.profile.v1';

export async function loadGame(): Promise<GameState | null> {
  try {
    const raw = await AsyncStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    return s.version === 1 && !s.ended ? s : null;
  } catch {
    return null;
  }
}

export async function saveGame(s: GameState | null) {
  try {
    if (!s || s.ended) await AsyncStorage.removeItem(GAME_KEY);
    else await AsyncStorage.setItem(GAME_KEY, JSON.stringify(s));
  } catch {
    // salvar é melhor esforço; o jogo continua em memória
  }
}

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? { ...emptyProfile(), ...JSON.parse(raw) } : emptyProfile();
  } catch {
    return emptyProfile();
  }
}

export async function saveProfile(p: Profile) {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    // idem
  }
}
