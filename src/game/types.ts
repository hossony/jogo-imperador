export type Stat = 'senado' | 'plebe' | 'legioes' | 'tesouro';
export type Stats = Record<Stat, number>;
export const STAT_KEYS: Stat[] = ['senado', 'plebe', 'legioes', 'tesouro'];

export type OriginId = 'nomade' | 'herdeiro' | 'soldado' | 'agricultor' | 'nobre';
export type Era = 'republica' | 'guerras_civis' | 'principado';

export type ArtId =
  | 'laurel' | 'senate' | 'temple' | 'sword' | 'shield' | 'helmet' | 'coins' | 'wheat'
  | 'eagle' | 'scroll' | 'ship' | 'fire' | 'dagger' | 'mask' | 'wheel' | 'arena'
  | 'amphora' | 'chains' | 'crown' | 'column' | 'omen' | 'family' | 'road' | 'fasces';

export type UnitId = 'hastati' | 'principes' | 'triarii' | 'equites' | 'auxiliares' | 'cerco';
export type ReformId = 'pilum' | 'testudo' | 'engenharia' | 'mario' | 'aquila' | 'estradas';

/** Tudo o que uma escolha pode causar. */
export interface Effect {
  senado?: number;
  plebe?: number;
  legioes?: number;
  tesouro?: number;
  denarios?: number;
  legado?: number;
  /** +1 sobe na hierarquia social, -1 cai */
  status?: number;
  /** traço (virtude ou cicatriz) que fica na história */
  trait?: string;
  removeTrait?: string;
  flag?: string;
  unflag?: string;
  monument?: string;
  units?: Partial<Record<UnitId, number>>;
  /** frase registrada na crônica */
  chronicle?: string;
  /** carta obrigatória a seguir */
  next?: string;
  /** queda de status causada por uma crise */
  fall?: boolean;
  /** passa o controle ao herdeiro */
  succession?: boolean;
  /** encerra a crônica */
  end?: boolean;
}

export interface Choice {
  label: string;
  effect: Effect;
}

export type CardKind = 'normal' | 'evento' | 'crise' | 'dinastia' | 'promocao' | 'origem';

export interface CardCondition {
  origins?: OriginId[];
  eras?: Era[];
  minStatus?: number;
  maxStatus?: number;
  requires?: string[];
  excludes?: string[];
  minTurn?: number;
  minDenarios?: number;
  minLegado?: number;
  minProvinces?: number;
  minStat?: Partial<Stats>;
}

export interface Card extends CardCondition {
  id: string;
  who: string;
  role?: string;
  art: ArtId;
  text: string;
  left: Choice;
  right: Choice;
  kind?: CardKind;
  once?: boolean;
  weight?: number;
}

export interface ChronicleEntry {
  year: number;
  generation: number;
  text: string;
  tone: 'bom' | 'mau' | 'neutro' | 'marco';
}

export interface GameState {
  version: number;
  name: string;
  dynastyName: string;
  origin: OriginId;
  stats: Stats;
  status: number;
  maxStatus: number;
  denarios: number;
  legado: number;
  turn: number;
  age: number;
  generation: number;
  traits: string[];
  flags: string[];
  monuments: string[];
  provinces: string[];
  units: Record<UnitId, number>;
  reforms: ReformId[];
  seenOnce: string[];
  recent: string[];
  chronicle: ChronicleEntry[];
  currentCardId: string | null;
  forcedNext: string | null;
  pendingCrisis: { stat: Stat; high: boolean } | null;
  campaignCooldown: number;
  battlesWon: number;
  battlesLost: number;
  ended: boolean;
}

export type GameEvent =
  | { type: 'promotion'; from: number; to: number }
  | { type: 'fall'; from: number; to: number; stat: Stat; high: boolean }
  | { type: 'era'; era: Era }
  | { type: 'succession'; heir: string; generation: number }
  | { type: 'trait'; trait: string }
  | { type: 'monument'; monument: string }
  | { type: 'end' };

export interface RunRecord {
  id: string;
  name: string;
  dynastyName: string;
  origin: OriginId;
  score: number;
  provinces: number;
  maxStatus: number;
  generations: number;
  date: number;
  prDelta: number;
}

export interface Profile {
  pr: number;
  bestPr: number;
  runs: RunRecord[];
  totalConquests: number;
}
