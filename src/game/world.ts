import type { ArtId, Era, OriginId, ReformId, Stats, UnitId } from './types';

/* ───────────────────────── Hierarquia social ───────────────────────── */

export const STATUS = [
  { label: 'Escravo', desc: 'Sem nome, sem direitos. Mas ainda respira.', legado: 0 },
  { label: 'Liberto', desc: 'Livre das correntes, longe da honra.', legado: 10 },
  { label: 'Peregrino', desc: 'Estrangeiro sem cidadania romana.', legado: 25 },
  { label: 'Cidadão', desc: 'Civis Romanus sum.', legado: 60 },
  { label: 'Équite', desc: 'Cavaleiro da ordem equestre.', legado: 120 },
  { label: 'Senador', desc: 'Uma voz na Cúria.', legado: 220 },
  { label: 'Cônsul', desc: 'O mais alto magistrado da República.', legado: 400 },
  { label: 'Imperador', desc: 'Augusto. Pai da Pátria.', legado: 750 },
];
export const MAX_STATUS = STATUS.length - 1;

/* ───────────────────────── Origens ───────────────────────── */

export interface Origin {
  id: OriginId;
  name: string;
  epithet: string;
  art: ArtId;
  status: number;
  stats: Stats;
  denarios: number;
  units: Partial<Record<UnitId, number>>;
  multiplier: number;
  difficulty: string;
  desc: string;
  perk: string;
  firstCard: string;
}

export const ORIGINS: Origin[] = [
  {
    id: 'nomade',
    name: 'Nômade',
    epithet: 'Filho das estradas',
    art: 'road',
    status: 2,
    stats: { senado: 25, plebe: 45, legioes: 35, tesouro: 25 },
    denarios: 40,
    units: { auxiliares: 2 },
    multiplier: 1.6,
    difficulty: 'Lendária',
    desc: 'Você nasceu além das fronteiras, entre tribos que Roma chama de bárbaras. Ninguém espera nada de você.',
    perk: 'Cartas exclusivas de tribos e alianças bárbaras. Maior multiplicador de legado.',
    firstCard: 'origem_nomade',
  },
  {
    id: 'agricultor',
    name: 'Agricultor',
    epithet: 'Mãos na terra',
    art: 'wheat',
    status: 3,
    stats: { senado: 35, plebe: 60, legioes: 40, tesouro: 35 },
    denarios: 60,
    units: { hastati: 2 },
    multiplier: 1.35,
    difficulty: 'Difícil',
    desc: 'Um pequeno lote no Lácio, uma colheita incerta e a lembrança de Cincinato, que largou o arado para salvar Roma.',
    perk: 'Começa amado pela plebe. Caminho de tribuno e reforma agrária.',
    firstCard: 'origem_agricultor',
  },
  {
    id: 'soldado',
    name: 'Soldado',
    epithet: 'Escudo da República',
    art: 'shield',
    status: 3,
    stats: { senado: 40, plebe: 45, legioes: 60, tesouro: 35 },
    denarios: 70,
    units: { hastati: 3, principes: 1 },
    multiplier: 1.25,
    difficulty: 'Média',
    desc: 'Legionário de dezessete anos, pilum na mão e sandálias gastas. O caminho para o topo é feito de batalhas.',
    perk: 'Exército inicial maior. Carreira militar até general.',
    firstCard: 'origem_soldado',
  },
  {
    id: 'herdeiro',
    name: 'Herdeiro',
    epithet: 'Ouro e veneno',
    art: 'coins',
    status: 4,
    stats: { senado: 45, plebe: 30, legioes: 40, tesouro: 70 },
    denarios: 260,
    units: { hastati: 2, equites: 1 },
    multiplier: 1.1,
    difficulty: 'Média',
    desc: 'Seu pai morreu e deixou uma fortuna, inimigos e irmãos que juram que o testamento é falso.',
    perk: 'Muito ouro desde o início. Cartas de intriga familiar.',
    firstCard: 'origem_herdeiro',
  },
  {
    id: 'nobre',
    name: 'Nobre',
    epithet: 'Sangue patrício',
    art: 'senate',
    status: 5,
    stats: { senado: 60, plebe: 35, legioes: 45, tesouro: 55 },
    denarios: 180,
    units: { hastati: 2, principes: 1, equites: 1 },
    multiplier: 1.0,
    difficulty: 'Fácil',
    desc: 'Sua família tem máscaras de cônsules no átrio. Agora é a sua vez de honrar o nome, ou de enterrá-lo.',
    perk: 'Começa no Senado. Cursus honorum até o consulado.',
    firstCard: 'origem_nobre',
  },
];

export const originById = (id: OriginId) => ORIGINS.find((o) => o.id === id)!;

/* ───────────────────────── Traços ───────────────────────── */

export const TRAITS: Record<string, { label: string; good: boolean; desc: string }> = {
  leal: { label: 'Leal', good: true, desc: 'Nunca abandonou um aliado.' },
  valente: { label: 'Valente', good: true, desc: 'Lutou na primeira linha.' },
  piedoso: { label: 'Piedoso', good: true, desc: 'Os deuses olham por você.' },
  generoso: { label: 'Generoso', good: true, desc: 'Pão para quem tem fome.' },
  estrategista: { label: 'Estrategista', good: true, desc: 'Vence antes da batalha.' },
  eloquente: { label: 'Eloquente', good: true, desc: 'Sua voz move o Senado.' },
  justo: { label: 'Justo', good: true, desc: 'A lei acima de tudo.' },
  clemente: { label: 'Clemente', good: true, desc: 'Perdoa os vencidos.' },
  traidor: { label: 'Traidor', good: false, desc: 'Vendeu quem confiava em você.' },
  covarde: { label: 'Covarde', good: false, desc: 'Fugiu quando Roma precisou.' },
  corrupto: { label: 'Corrupto', good: false, desc: 'Ouro compra seu voto.' },
  cruel: { label: 'Cruel', good: false, desc: 'O sangue não te incomoda.' },
  sacrilego: { label: 'Sacrílego', good: false, desc: 'Ofendeu os deuses.' },
  tirano: { label: 'Tirano', good: false, desc: 'Governa pelo medo.' },
  exilado: { label: 'Marcado pelo exílio', good: false, desc: 'Já foi expulso de Roma.' },
  derrotado: { label: 'Derrotado', good: false, desc: 'Perdeu águias de legião.' },
  falido: { label: 'Falido', good: false, desc: 'Credores batem à porta.' },
  odiado: { label: 'Odiado pelo povo', good: false, desc: 'Pedras voaram em sua direção.' },
};

/* ───────────────────────── Monumentos ───────────────────────── */

export const MONUMENTS: Record<string, { label: string; legado: number }> = {
  aqueduto: { label: 'Aqueduto', legado: 35 },
  templo: { label: 'Templo de Júpiter', legado: 40 },
  arena: { label: 'Anfiteatro', legado: 50 },
  forum: { label: 'Fórum', legado: 55 },
  arco: { label: 'Arco do Triunfo', legado: 60 },
  termas: { label: 'Termas', legado: 35 },
  biblioteca: { label: 'Biblioteca', legado: 40 },
  via: { label: 'Via pavimentada', legado: 30 },
  mausoleu: { label: 'Mausoléu da Dinastia', legado: 70 },
  panteao: { label: 'Panteão', legado: 80 },
  muralha: { label: 'Muralha da fronteira', legado: 55 },
};

/* ───────────────────────── Eras ───────────────────────── */

export const ERAS: { id: Era; name: string; latin: string; fromTurn: number; desc: string }[] = [
  { id: 'republica', name: 'República', latin: 'RES PVBLICA', fromTurn: 0, desc: 'Cônsules, Senado e guerras contra Cartago.' },
  { id: 'guerras_civis', name: 'Guerras Civis', latin: 'BELLA CIVILIA', fromTurn: 70, desc: 'Generais marcham sobre Roma. A República sangra.' },
  { id: 'principado', name: 'Principado', latin: 'PRINCIPATVS', fromTurn: 150, desc: 'Um só homem governa. O mundo inteiro é Roma.' },
];

/* ───────────────────────── Províncias ───────────────────────── */

export interface Province {
  id: string;
  name: string;
  latin: string;
  x: number;
  y: number;
  defense: number;
  legado: number;
  walled: boolean;
  tribute: number;
  neighbors: string[];
  bonus: string;
}

export const PROVINCES: Province[] = [
  { id: 'latium', name: 'Lácio', latin: 'LATIVM', x: 470, y: 270, defense: 0, legado: 0, walled: false, tribute: 3, neighbors: ['etruria', 'campania'], bonus: 'O coração de Roma.' },
  { id: 'etruria', name: 'Etrúria', latin: 'ETRVRIA', x: 440, y: 215, defense: 18, legado: 30, walled: false, tribute: 2, neighbors: ['latium', 'cisalpina', 'sardinia'], bonus: 'Augúrios etruscos.' },
  { id: 'campania', name: 'Campânia', latin: 'CAMPANIA', x: 520, y: 310, defense: 20, legado: 30, walled: false, tribute: 3, neighbors: ['latium', 'sicilia'], bonus: 'Terras férteis do Vesúvio.' },
  { id: 'sicilia', name: 'Sicília', latin: 'SICILIA', x: 520, y: 400, defense: 34, legado: 50, walled: false, tribute: 4, neighbors: ['campania', 'africa', 'sardinia'], bonus: 'Celeiro de Roma.' },
  { id: 'sardinia', name: 'Sardenha', latin: 'SARDINIA', x: 385, y: 320, defense: 28, legado: 40, walled: false, tribute: 2, neighbors: ['etruria', 'sicilia', 'hispania'], bonus: 'Minas e portos.' },
  { id: 'cisalpina', name: 'Gália Cisalpina', latin: 'GALLIA CISALPINA', x: 425, y: 150, defense: 40, legado: 55, walled: false, tribute: 3, neighbors: ['etruria', 'gallia', 'illyricum'], bonus: 'Porta dos Alpes.' },
  { id: 'hispania', name: 'Hispânia', latin: 'HISPANIA', x: 150, y: 270, defense: 60, legado: 90, walled: false, tribute: 5, neighbors: ['sardinia', 'gallia', 'africa'], bonus: 'Minas de prata.' },
  { id: 'gallia', name: 'Gália', latin: 'GALLIA', x: 300, y: 120, defense: 75, legado: 120, walled: false, tribute: 5, neighbors: ['cisalpina', 'hispania', 'germania', 'britannia'], bonus: 'Sessenta tribos guerreiras.' },
  { id: 'britannia', name: 'Britânia', latin: 'BRITANNIA', x: 245, y: 35, defense: 85, legado: 140, walled: false, tribute: 3, neighbors: ['gallia'], bonus: 'O fim do mundo conhecido.' },
  { id: 'germania', name: 'Germânia', latin: 'GERMANIA', x: 420, y: 60, defense: 105, legado: 170, walled: false, tribute: 2, neighbors: ['gallia', 'illyricum'], bonus: 'Florestas que engolem legiões.' },
  { id: 'illyricum', name: 'Ilírico', latin: 'ILLYRICVM', x: 560, y: 175, defense: 45, legado: 60, walled: false, tribute: 3, neighbors: ['cisalpina', 'germania', 'macedonia', 'dacia'], bonus: 'Piratas e montanhas.' },
  { id: 'dacia', name: 'Dácia', latin: 'DACIA', x: 690, y: 110, defense: 90, legado: 150, walled: true, tribute: 6, neighbors: ['illyricum', 'macedonia'], bonus: 'Ouro dos Cárpatos.' },
  { id: 'macedonia', name: 'Macedônia', latin: 'MACEDONIA', x: 660, y: 225, defense: 55, legado: 80, walled: false, tribute: 4, neighbors: ['illyricum', 'dacia', 'achaea', 'asia'], bonus: 'A falange de Alexandre.' },
  { id: 'achaea', name: 'Acaia', latin: 'ACHAEA', x: 650, y: 315, defense: 50, legado: 90, walled: true, tribute: 4, neighbors: ['macedonia'], bonus: 'Filosofia, arte e Atenas.' },
  { id: 'asia', name: 'Ásia Menor', latin: 'ASIA', x: 790, y: 270, defense: 65, legado: 110, walled: false, tribute: 6, neighbors: ['macedonia', 'syria'], bonus: 'Cidades ricas de Pérgamo.' },
  { id: 'syria', name: 'Síria', latin: 'SYRIA', x: 900, y: 330, defense: 80, legado: 130, walled: true, tribute: 6, neighbors: ['asia', 'aegyptus'], bonus: 'Fronteira com a Pártia.' },
  { id: 'aegyptus', name: 'Egito', latin: 'AEGYPTVS', x: 830, y: 450, defense: 95, legado: 180, walled: true, tribute: 8, neighbors: ['syria', 'africa'], bonus: 'O trigo do Nilo e o tesouro dos faraós.' },
  { id: 'africa', name: 'África', latin: 'AFRICA', x: 450, y: 470, defense: 70, legado: 140, walled: true, tribute: 5, neighbors: ['sicilia', 'hispania', 'aegyptus'], bonus: 'Cartago deve ser destruída.' },
];

export const provinceById = (id: string) => PROVINCES.find((p) => p.id === id)!;

/* ───────────────────────── Exército ───────────────────────── */

export interface Unit {
  id: UnitId;
  name: string;
  latin: string;
  power: number;
  cost: number;
  art: ArtId;
  desc: string;
  minStatus: number;
}

export const UNITS: Unit[] = [
  { id: 'hastati', name: 'Hastati', latin: 'HASTATI', power: 3, cost: 35, art: 'sword', desc: 'Jovens da primeira linha. Baratos e corajosos.', minStatus: 0 },
  { id: 'auxiliares', name: 'Auxiliares', latin: 'AVXILIA', power: 4, cost: 45, art: 'road', desc: 'Arqueiros e fundeiros estrangeiros.', minStatus: 0 },
  { id: 'principes', name: 'Principes', latin: 'PRINCIPES', power: 6, cost: 70, art: 'shield', desc: 'Veteranos da segunda linha.', minStatus: 2 },
  { id: 'equites', name: 'Equites', latin: 'EQVITES', power: 7, cost: 95, art: 'wheel', desc: 'Cavalaria para os flancos.', minStatus: 3 },
  { id: 'triarii', name: 'Triarii', latin: 'TRIARII', power: 10, cost: 130, art: 'helmet', desc: 'A última linha. Quando chegam, a batalha é decidida.', minStatus: 3 },
  { id: 'cerco', name: 'Máquinas de cerco', latin: 'TORMENTA', power: 4, cost: 150, art: 'column', desc: 'Balistas e onagros. Essenciais contra cidades muradas.', minStatus: 4 },
];

export const unitById = (id: UnitId) => UNITS.find((u) => u.id === id)!;

export interface Reform {
  id: ReformId;
  name: string;
  cost: number;
  desc: string;
  minStatus: number;
  bonus: number;
}

export const REFORMS: Reform[] = [
  { id: 'pilum', name: 'Pilum pesado', cost: 140, desc: '+10% de força. Dardos que entortam no escudo inimigo.', minStatus: 2, bonus: 0.1 },
  { id: 'testudo', name: 'Formação Testudo', cost: 200, desc: '+15% de força e metade das baixas em derrotas.', minStatus: 3, bonus: 0.15 },
  { id: 'engenharia', name: 'Engenharia legionária', cost: 260, desc: '+10% de força. Cidades muradas não exigem mais máquinas de cerco.', minStatus: 3, bonus: 0.1 },
  { id: 'estradas', name: 'Estradas romanas', cost: 320, desc: '+2 denários por província a cada carta.', minStatus: 4, bonus: 0 },
  { id: 'mario', name: 'Reforma de Mário', cost: 420, desc: '+25% de força e tropas 20% mais baratas. O Senado não vai gostar.', minStatus: 4, bonus: 0.25 },
  { id: 'aquila', name: 'Águia de ouro', cost: 380, desc: '+10% de força e +80 de legado. Perder a águia é desonra eterna.', minStatus: 5, bonus: 0.1 },
];

export const reformById = (id: ReformId) => REFORMS.find((r) => r.id === id)!;

/* ───────────────────────── Elos de ranking ───────────────────────── */

export interface Tier {
  id: string;
  metal: string;
  title: string;
  colors: [string, string, string];
  symbol: ArtId;
  divisions: number;
}

export const TIERS: Tier[] = [
  { id: 'bronze', metal: 'Bronze', title: 'Plebeu', colors: ['#5C3A1E', '#B07A45', '#E3B07A'], symbol: 'coins', divisions: 3 },
  { id: 'prata', metal: 'Prata', title: 'Legionário', colors: ['#4A4E55', '#A9AFB8', '#EEF1F5'], symbol: 'shield', divisions: 3 },
  { id: 'ouro', metal: 'Ouro', title: 'Centurião', colors: ['#6E5216', '#D4AF63', '#FFE7A3'], symbol: 'helmet', divisions: 3 },
  { id: 'platina', metal: 'Platina', title: 'Tribuno', colors: ['#1F4A49', '#5FB3AD', '#C9F2EC'], symbol: 'scroll', divisions: 3 },
  { id: 'diamante', metal: 'Diamante', title: 'Legado', colors: ['#16305E', '#4F8BE0', '#CFE3FF'], symbol: 'eagle', divisions: 3 },
  { id: 'mestre', metal: 'Mestre', title: 'Cônsul', colors: ['#4A0F0F', '#B83A2E', '#FFC2A8'], symbol: 'fasces', divisions: 3 },
  { id: 'graomestre', metal: 'Grão-Mestre', title: 'César', colors: ['#2E0F33', '#8E44A0', '#F0C8FF'], symbol: 'laurel', divisions: 3 },
  { id: 'imperador', metal: 'Imperador Grão-Mestre', title: 'Imperator', colors: ['#3A0F3F', '#D4AF63', '#FFF1C4'], symbol: 'crown', divisions: 1 },
];

export const PR_PER_DIVISION = 100;

/** Figuras históricas usadas como referência no Salão do Legado. */
export const LEGENDS = [
  { name: 'Cincinato', note: 'Largou o arado, salvou Roma, voltou ao arado.', score: 700 },
  { name: 'Cipião Africano', note: 'Derrotou Aníbal em Zama.', score: 1500 },
  { name: 'Caio Mário', note: 'Sete vezes cônsul.', score: 2000 },
  { name: 'Pompeu Magno', note: 'Limpou o mar de piratas.', score: 2600 },
  { name: 'Júlio César', note: 'Veni, vidi, vici.', score: 3400 },
  { name: 'Augusto', note: 'Encontrou Roma de tijolo, deixou-a de mármore.', score: 4300 },
  { name: 'Trajano', note: 'Optimus Princeps. O império em sua maior extensão.', score: 5200 },
];

export const PRAENOMINA = ['Marcus', 'Gaius', 'Lucius', 'Titus', 'Quintus', 'Publius', 'Gnaeus', 'Aulus', 'Sextus', 'Decimus', 'Servius', 'Spurius'];
export const NOMINA = ['Valerius', 'Cornelius', 'Aemilius', 'Claudius', 'Fabius', 'Iulius', 'Licinius', 'Sempronius', 'Flavius', 'Aurelius', 'Antonius', 'Domitius'];
export const COGNOMINA = ['Maximus', 'Rufus', 'Severus', 'Felix', 'Magnus', 'Varus', 'Scaevola', 'Corvus', 'Lentulus', 'Agricola', 'Celer', 'Nerva'];
export const BARBARIAN = ['Arminius', 'Brennus', 'Vercingetorix', 'Ambiorix', 'Viriato', 'Boduognatus', 'Segestes', 'Maroboduus'];

export function randomName(origin: OriginId): { name: string; dynasty: string } {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  if (origin === 'nomade') {
    const n = pick(BARBARIAN);
    return { name: n, dynasty: `Casa de ${n}` };
  }
  const nomen = pick(NOMINA);
  return { name: `${pick(PRAENOMINA)} ${nomen} ${pick(COGNOMINA)}`, dynasty: `Gens ${nomen}` };
}

export const STAT_INFO: Record<keyof Stats, { label: string; latin: string }> = {
  senado: { label: 'Senado', latin: 'SENATVS' },
  plebe: { label: 'Plebe', latin: 'POPVLVS' },
  legioes: { label: 'Legiões', latin: 'LEGIONES' },
  tesouro: { label: 'Tesouro', latin: 'AERARIVM' },
};
