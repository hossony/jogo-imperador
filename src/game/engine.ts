import { ALL_CARDS, CARDS, crisisCard, FINAL_CARD, SUCCESSION_CARD } from './cards';
import type {
  Card, ChronicleEntry, Era, GameEvent, GameState, OriginId, Profile, ReformId, RunRecord, Stat, UnitId,
} from './types';
import { STAT_KEYS } from './types';
import {
  BARBARIAN, ERAS, MAX_STATUS, MONUMENTS, PRAENOMINA, PROVINCES, PR_PER_DIVISION, REFORMS, STATUS, TIERS, TRAITS,
  UNITS, originById, provinceById, reformById, unitById,
} from './world';

export const START_YEAR = 480; // ano da fundação de Roma (AUC)
export const GENERATIONS = 3;
export const RETIRE_AGE = 62;
const RECENT_SIZE = 14;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/* ───────────────────────── Consultas ───────────────────────── */

export function eraOf(turn: number): Era {
  let era: Era = 'republica';
  for (const e of ERAS) if (turn >= e.fromTurn) era = e.id;
  return era;
}
export const eraInfo = (era: Era) => ERAS.find((e) => e.id === era)!;
export const yearOf = (turn: number) => START_YEAR + Math.floor(turn / 2);

export function hasMark(s: GameState, mark: string) {
  return s.flags.includes(mark) || s.traits.includes(mark);
}

export function getCard(id: string): Card {
  if (id.startsWith('crise_')) {
    const [, stat, level] = id.split('_');
    return crisisCard(stat as Stat, level === 'high');
  }
  return ALL_CARDS[id];
}

export function isEligible(s: GameState, c: Card): boolean {
  if (c.weight === 0) return false;
  if (c.once && s.seenOnce.includes(c.id)) return false;
  if (c.origins && !c.origins.includes(s.origin)) return false;
  if (c.eras && !c.eras.includes(eraOf(s.turn))) return false;
  if (c.minStatus !== undefined && s.status < c.minStatus) return false;
  if (c.maxStatus !== undefined && s.status > c.maxStatus) return false;
  if (c.minTurn !== undefined && s.turn < c.minTurn) return false;
  if (c.minDenarios !== undefined && s.denarios < c.minDenarios) return false;
  if (c.minLegado !== undefined && liveLegado(s) < c.minLegado) return false;
  if (c.minProvinces !== undefined && s.provinces.length < c.minProvinces) return false;
  if (c.requires && !c.requires.every((m) => hasMark(s, m))) return false;
  if (c.excludes && c.excludes.some((m) => hasMark(s, m))) return false;
  if (c.minStat) {
    for (const k of STAT_KEYS) {
      const min = c.minStat[k];
      if (min !== undefined && s.stats[k] < min) return false;
    }
  }
  return true;
}

/* ───────────────────────── Exército ───────────────────────── */

export const armySize = (s: GameState) => UNITS.reduce((n, u) => n + s.units[u.id], 0);
export const armyCap = (s: GameState) => 5 + s.status * 2 + s.provinces.length;

export function unitCost(s: GameState, id: UnitId) {
  const base = unitById(id).cost;
  return Math.round(s.reforms.includes('mario') ? base * 0.8 : base);
}

export function armyPower(s: GameState): number {
  const base = UNITS.reduce((n, u) => n + s.units[u.id] * u.power, 0);
  const reformBonus = s.reforms.reduce((n, r) => n + reformById(r).bonus, 0);
  let traitBonus = 0;
  if (s.traits.includes('valente')) traitBonus += 0.05;
  if (s.traits.includes('estrategista')) traitBonus += 0.1;
  if (s.traits.includes('covarde')) traitBonus -= 0.1;
  if (s.traits.includes('derrotado')) traitBonus -= 0.05;
  const morale = 0.6 + (s.stats.legioes / 100) * 0.8;
  return Math.round(base * (1 + reformBonus + traitBonus) * morale);
}

export function provinceDefense(s: GameState, id: string) {
  // inimigos ficam mais fortes com o tempo e com o tamanho do império (custo da expansão)
  return Math.round(provinceById(id).defense * (1 + s.turn / 200) * (1 + (s.provinces.length - 1) * 0.07));
}

export function needsSiege(s: GameState, id: string) {
  return provinceById(id).walled && s.units.cerco === 0 && !s.reforms.includes('engenharia');
}

export function campaignChance(s: GameState, id: string) {
  let p = armyPower(s);
  if (needsSiege(s, id)) p *= 0.6;
  const d = provinceDefense(s, id);
  if (p <= 0) return 0;
  const c = (p * p) / (p * p + d * d);
  return clamp(c, 0.05, 0.95);
}

export function attackable(s: GameState): string[] {
  const owned = new Set(s.provinces);
  const out = new Set<string>();
  for (const id of s.provinces) {
    for (const n of provinceById(id).neighbors) if (!owned.has(n)) out.add(n);
  }
  return [...out];
}

export function income(s: GameState): number {
  const tribute = s.provinces.reduce((n, id) => n + provinceById(id).tribute, 0);
  const roads = s.reforms.includes('estradas') ? s.provinces.length * 2 : 0;
  return Math.round(1 + s.stats.tesouro / 25 + tribute * 0.4 + roads + s.status * 0.5);
}

/* ───────────────────────── Legado e pontuação ───────────────────────── */

export function liveLegado(s: GameState) {
  const prov = s.provinces.reduce((n, id) => n + provinceById(id).legado, 0);
  return s.legado + prov + STATUS[s.maxStatus].legado;
}

export function finalScore(s: GameState) {
  const base = liveLegado(s) + (s.generation - 1) * 60 + s.battlesWon * 10;
  return Math.round(base * originById(s.origin).multiplier);
}

/* ───────────────────────── Ranking ───────────────────────── */

export function tierOf(pr: number) {
  const top = TIERS.length - 1;
  const perTier = PR_PER_DIVISION * 3;
  const idx = Math.min(Math.floor(pr / perTier), top);
  const tier = TIERS[idx];
  if (idx === top) return { tier, index: idx, division: 0, progress: 1, nextAt: null as number | null };
  const inTier = pr - idx * perTier;
  const divIdx = Math.floor(inTier / PR_PER_DIVISION); // 0,1,2
  const division = 3 - divIdx; // III, II, I
  const progress = (inTier % PR_PER_DIVISION) / PR_PER_DIVISION;
  const nextAt = idx * perTier + (divIdx + 1) * PR_PER_DIVISION;
  return { tier, index: idx, division, progress, nextAt };
}

export function expectedScore(pr: number) {
  return 350 + pr * 1.3;
}

export function prDelta(score: number, pr: number) {
  const raw = (score - expectedScore(pr)) / 6;
  return Math.round(clamp(raw, -40, 120));
}

export function recordRun(profile: Profile, s: GameState): { profile: Profile; record: RunRecord } {
  const score = finalScore(s);
  const delta = prDelta(score, profile.pr);
  const pr = Math.max(0, profile.pr + delta);
  const record: RunRecord = {
    id: `${Date.now()}`,
    name: s.name,
    dynastyName: s.dynastyName,
    origin: s.origin,
    score,
    provinces: s.provinces.length,
    maxStatus: s.maxStatus,
    generations: s.generation,
    date: Date.now(),
    prDelta: pr - profile.pr,
  };
  const runs = [record, ...profile.runs].slice(0, 50);
  return {
    record,
    profile: {
      pr,
      bestPr: Math.max(profile.bestPr, pr),
      runs,
      totalConquests: profile.totalConquests + Math.max(0, s.provinces.length - 1),
    },
  };
}

export const emptyProfile = (): Profile => ({ pr: 0, bestPr: 0, runs: [], totalConquests: 0 });

/* ───────────────────────── Nova partida ───────────────────────── */

export function newGame(origin: OriginId, name: string, dynastyName: string): GameState {
  const o = originById(origin);
  const units: Record<UnitId, number> = { hastati: 0, principes: 0, triarii: 0, equites: 0, auxiliares: 0, cerco: 0 };
  for (const [k, v] of Object.entries(o.units)) units[k as UnitId] = v ?? 0;
  const s: GameState = {
    version: 1,
    name,
    dynastyName,
    origin,
    stats: { ...o.stats },
    status: o.status,
    maxStatus: o.status,
    denarios: o.denarios,
    legado: 0,
    turn: 0,
    age: 18,
    generation: 1,
    traits: [],
    flags: [],
    monuments: [],
    provinces: ['latium'],
    units,
    reforms: [],
    seenOnce: [],
    recent: [],
    chronicle: [],
    currentCardId: null,
    forcedNext: o.firstCard,
    pendingCrisis: null,
    campaignCooldown: 3,
    battlesWon: 0,
    battlesLost: 0,
    ended: false,
  };
  log(s, `${name} inicia sua história como ${o.name.toLowerCase()}. ${o.epithet}.`, 'marco');
  return ensureCard(s);
}

function log(s: GameState, text: string, tone: ChronicleEntry['tone']) {
  s.chronicle.push({ year: yearOf(s.turn), generation: s.generation, text, tone });
  if (s.chronicle.length > 400) s.chronicle.splice(0, s.chronicle.length - 400);
}

function clone(s: GameState): GameState {
  return JSON.parse(JSON.stringify(s));
}

/* ───────────────────────── Sorteio de cartas ───────────────────────── */

export function ensureCard(state: GameState): GameState {
  if (state.currentCardId || state.ended) return state;
  const s = clone(state);
  s.currentCardId = chooseNextCardId(s);
  return s;
}

function chooseNextCardId(s: GameState): string {
  if (s.pendingCrisis) return `crise_${s.pendingCrisis.stat}_${s.pendingCrisis.high ? 'high' : 'low'}`;
  if (s.forcedNext) {
    const id = s.forcedNext;
    s.forcedNext = null;
    if (ALL_CARDS[id]) return id;
  }
  if (s.age >= RETIRE_AGE) return s.generation >= GENERATIONS ? FINAL_CARD.id : SUCCESSION_CARD.id;

  const eligible = CARDS.filter((c) => isEligible(s, c));
  let pool = eligible.filter((c) => !s.recent.includes(c.id));
  if (pool.length === 0) pool = eligible.filter((c) => c.id !== s.recent[s.recent.length - 1]);
  if (pool.length === 0) pool = eligible;
  if (pool.length === 0) return 'lupa';

  // promoções e eventos aparecem com mais frequência quando disponíveis
  const weightOf = (c: Card) => (c.weight ?? 1) * (c.kind === 'promocao' ? 2.2 : c.kind === 'evento' ? 2.5 : 1);
  const total = pool.reduce((n, c) => n + weightOf(c), 0);
  let r = Math.random() * total;
  for (const c of pool) {
    r -= weightOf(c);
    if (r <= 0) return c.id;
  }
  return pool[pool.length - 1].id;
}

/* ───────────────────────── Aplicar uma escolha ───────────────────────── */

export function applyChoice(state: GameState, side: 'left' | 'right'): { state: GameState; events: GameEvent[] } {
  if (!state.currentCardId || state.ended) return { state, events: [] };
  const card = getCard(state.currentCardId);
  const choice = side === 'left' ? card.left : card.right;
  const e = choice.effect;
  const s = clone(state);
  const events: GameEvent[] = [];
  const prevEra = eraOf(s.turn);

  for (const k of STAT_KEYS) {
    const d = e[k];
    if (d) s.stats[k] = clamp(s.stats[k] + d, 0, 100);
  }

  if (e.denarios) {
    const next = s.denarios + e.denarios;
    if (next < 0) {
      s.denarios = 0;
      s.stats.tesouro = clamp(s.stats.tesouro - 10, 0, 100);
      addTrait(s, 'falido', events);
    } else s.denarios = next;
  }

  if (e.legado) s.legado += e.legado;

  if (e.status) setStatus(s, s.status + e.status, events);

  if (e.trait) addTrait(s, e.trait, events);
  if (e.removeTrait) s.traits = s.traits.filter((t) => t !== e.removeTrait);
  if (e.flag && !s.flags.includes(e.flag)) s.flags.push(e.flag);
  if (e.unflag) s.flags = s.flags.filter((f) => f !== e.unflag);

  if (e.monument && !s.monuments.includes(e.monument)) {
    s.monuments.push(e.monument);
    s.flags.push(`m:${e.monument}`);
    s.legado += MONUMENTS[e.monument]?.legado ?? 0;
    events.push({ type: 'monument', monument: e.monument });
  }

  if (e.units) {
    for (const [k, v] of Object.entries(e.units)) s.units[k as UnitId] += v ?? 0;
  }

  // registro na crônica
  const tone: ChronicleEntry['tone'] =
    card.kind === 'crise' ? 'mau'
      : e.chronicle && (card.kind === 'promocao' || card.kind === 'evento' || card.kind === 'origem') ? 'marco'
        : e.trait && TRAITS[e.trait] ? (TRAITS[e.trait].good ? 'bom' : 'mau') : 'neutro';
  log(s, e.chronicle ?? `${card.who}: ${choice.label.toLowerCase()}.`, tone);

  if (e.fall && s.pendingCrisis) applyFall(s, events);

  if (e.succession) applySuccession(s, events);

  if (e.end) {
    s.ended = true;
    log(s, `Fim da crônica da ${s.dynastyName}.`, 'marco');
    events.push({ type: 'end' });
  }

  if (card.once && !s.seenOnce.includes(card.id)) s.seenOnce.push(card.id);
  if (card.kind !== 'crise') {
    s.recent.push(card.id);
    if (s.recent.length > RECENT_SIZE) s.recent.shift();
  }

  // o tempo passa
  if (!s.ended && !e.succession) {
    s.turn += 1;
    s.age += 0.5;
    s.denarios += income(s);
    s.campaignCooldown = Math.max(0, s.campaignCooldown - 1);
    const era = eraOf(s.turn);
    if (era !== prevEra) {
      events.push({ type: 'era', era });
      log(s, `Começa uma nova era: ${eraInfo(era).name}.`, 'marco');
    }
  }

  s.currentCardId = null;
  if (e.next) s.forcedNext = e.next;
  if (card.kind !== 'crise') detectCrisis(s);

  return { state: ensureCard(s), events };
}

function addTrait(s: GameState, trait: string, events: GameEvent[]) {
  if (!TRAITS[trait] || s.traits.includes(trait)) return;
  s.traits.push(trait);
  events.push({ type: 'trait', trait });
}

function setStatus(s: GameState, to: number, events: GameEvent[]) {
  const next = clamp(to, 0, MAX_STATUS);
  if (next === s.status) return;
  const from = s.status;
  s.status = next;
  s.maxStatus = Math.max(s.maxStatus, next);
  if (next > from) {
    events.push({ type: 'promotion', from, to: next });
    log(s, `Ascendeu a ${STATUS[next].label}.`, 'marco');
  }
}

function detectCrisis(s: GameState) {
  if (s.pendingCrisis || s.ended) return;
  for (const k of STAT_KEYS) {
    if (s.stats[k] <= 0) {
      s.pendingCrisis = { stat: k, high: false };
      return;
    }
    if (s.stats[k] >= 100) {
      s.pendingCrisis = { stat: k, high: true };
      return;
    }
  }
}

function applyFall(s: GameState, events: GameEvent[]) {
  const crisis = s.pendingCrisis!;
  const from = s.status;
  const to = Math.max(0, from - 1);
  s.status = to;
  for (const k of STAT_KEYS) {
    s.stats[k] = k === crisis.stat ? 50 : Math.round(s.stats[k] + (50 - s.stats[k]) * 0.3);
  }
  if (crisis.stat === 'legioes' && !crisis.high && s.provinces.length > 1) {
    const lost = s.provinces.pop()!;
    s.flags = s.flags.filter((f) => f !== `p:${lost}`);
    log(s, `A província de ${provinceById(lost).name} se perdeu.`, 'mau');
  }
  if (crisis.stat === 'tesouro' && !crisis.high) s.denarios = Math.floor(s.denarios / 3);
  s.legado = Math.max(0, s.legado - 40);
  s.pendingCrisis = null;
  log(s, `Caiu de ${STATUS[from].label} para ${STATUS[to].label}.`, 'mau');
  events.push({ type: 'fall', from, to, stat: crisis.stat, high: crisis.high });
}

function heirName(s: GameState): string {
  if (s.origin === 'nomade' && !s.name.includes(' ')) return pick(BARBARIAN.filter((n) => n !== s.name));
  const parts = s.name.split(' ');
  const pra = pick(PRAENOMINA.filter((p) => p !== parts[0]));
  return [pra, ...parts.slice(1)].join(' ');
}

const PERSONAL_FLAGS = ['casado', 'herdeiro_nasceu', 'general_ambicioso', 'gladiador', 'tribuno', 'centuriao', 'general', 'rival_irmao', 'mentor_tito', 'divida_apio'];

function applySuccession(s: GameState, events: GameEvent[]) {
  const hadHeir = s.flags.includes('herdeiro_nasceu');
  const heir = heirName(s);
  log(s, `${s.name} morre aos ${Math.floor(s.age)} anos. O anel passa para ${heir}.`, 'marco');
  s.generation += 1;
  s.name = heir;
  s.age = 20;
  s.turn += 1;
  if (!hadHeir) setStatus(s, s.status - 1, events);
  s.traits = s.traits.slice(-3);
  s.flags = s.flags.filter((f) => !PERSONAL_FLAGS.includes(f));
  for (const k of STAT_KEYS) s.stats[k] = Math.round(s.stats[k] + (50 - s.stats[k]) * 0.4);
  s.legado += 50;
  s.recent = [];
  s.campaignCooldown = 2;
  events.push({ type: 'succession', heir, generation: s.generation });
}

/* ───────────────────────── Ações fora das cartas ───────────────────────── */

export interface BattleResult {
  won: boolean;
  chance: number;
  roll: number;
  province: string;
  myPower: number;
  enemyPower: number;
  losses: Partial<Record<UnitId, number>>;
}

export function campaign(state: GameState, provinceId: string): { state: GameState; result: BattleResult; events: GameEvent[] } {
  const s = clone(state);
  const events: GameEvent[] = [];
  const chance = campaignChance(s, provinceId);
  const myPower = Math.round(armyPower(s) * (needsSiege(s, provinceId) ? 0.6 : 1));
  const enemyPower = provinceDefense(s, provinceId);
  const roll = Math.random();
  const won = roll < chance;
  const lossRate = won ? 0.15 : s.reforms.includes('testudo') ? 0.22 : 0.45;
  const losses: Partial<Record<UnitId, number>> = {};
  for (const u of UNITS) {
    const n = s.units[u.id];
    if (n === 0) continue;
    let l = Math.floor(n * lossRate + Math.random() * 0.8);
    if (u.id === 'cerco' && won) l = 0;
    l = Math.min(n, l);
    if (l > 0) {
      losses[u.id] = l;
      s.units[u.id] -= l;
    }
  }
  const p = provinceById(provinceId);
  s.stats.tesouro = clamp(s.stats.tesouro - 5, 0, 100);
  if (won) {
    s.provinces.push(provinceId);
    s.flags.push(`p:${provinceId}`);
    if (!s.flags.includes('vitoria')) s.flags.push('vitoria');
    s.stats.legioes = clamp(s.stats.legioes + 8, 0, 100);
    s.stats.plebe = clamp(s.stats.plebe + 5, 0, 100);
    s.battlesWon += 1;
    s.denarios += p.tribute * 10;
    log(s, `Conquistou ${p.name}. ${p.bonus}`, 'marco');
    if (s.battlesWon === 3) addTrait(s, 'estrategista', events);
  } else {
    s.stats.legioes = clamp(s.stats.legioes - 15, 0, 100);
    s.stats.senado = clamp(s.stats.senado - 8, 0, 100);
    s.battlesLost += 1;
    if (!s.flags.includes('derrota_recente')) s.flags.push('derrota_recente');
    if (s.battlesLost >= 2) addTrait(s, 'derrotado', events);
    log(s, `Foi derrotado tentando conquistar ${p.name}.`, 'mau');
  }
  s.campaignCooldown = 5;
  detectCrisis(s);
  if (s.pendingCrisis) s.currentCardId = null;
  return { state: ensureCard(s), result: { won, chance, roll, province: provinceId, myPower, enemyPower, losses }, events };
}

export function canBuyUnit(s: GameState, id: UnitId): string | null {
  const u = unitById(id);
  if (s.status < u.minStatus) return `Requer ${STATUS[u.minStatus].label}`;
  if (armySize(s) >= armyCap(s)) return 'Exército no limite';
  if (s.denarios < unitCost(s, id)) return 'Denários insuficientes';
  return null;
}

export function buyUnit(state: GameState, id: UnitId): GameState {
  if (canBuyUnit(state, id)) return state;
  const s = clone(state);
  s.denarios -= unitCost(s, id);
  s.units[id] += 1;
  return s;
}

export function canBuyReform(s: GameState, id: ReformId): string | null {
  const r = reformById(id);
  if (s.reforms.includes(id)) return 'Adotada';
  if (s.status < r.minStatus) return `Requer ${STATUS[r.minStatus].label}`;
  if (s.denarios < r.cost) return 'Denários insuficientes';
  return null;
}

export function buyReform(state: GameState, id: ReformId): GameState {
  if (canBuyReform(state, id)) return state;
  const s = clone(state);
  s.denarios -= reformById(id).cost;
  s.reforms.push(id);
  if (id === 'mario') s.stats.senado = clamp(s.stats.senado - 15, 0, 100);
  if (id === 'aquila') s.legado += 80;
  log(s, `Adotou: ${reformById(id).name}.`, 'bom');
  detectCrisis(s);
  if (s.pendingCrisis) s.currentCardId = null;
  return ensureCard(s);
}

export function endChronicle(state: GameState): GameState {
  const s = clone(state);
  s.ended = true;
  s.currentCardId = null;
  log(s, `${s.name} encerrou a crônica da ${s.dynastyName}.`, 'marco');
  return s;
}

/** Quanto cada lado da carta mexe nas barras: usado para os indicadores. */
export function previewOf(card: Card, side: 'left' | 'right'): Partial<Record<Stat, number>> {
  const e = (side === 'left' ? card.left : card.right).effect;
  const out: Partial<Record<Stat, number>> = {};
  for (const k of STAT_KEYS) if (e[k]) out[k] = e[k];
  return out;
}

export { REFORMS, PROVINCES };
