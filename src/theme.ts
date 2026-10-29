export const C = {
  night: '#0E0A08',
  ink: '#16100D',
  wine: '#2A1210',
  oxblood: '#4A1714',
  crimson: '#8E2A22',
  purple: '#4B1F4F',
  purpleBright: '#7E3B86',
  gold: '#D4AF63',
  goldBright: '#F2D58C',
  goldDeep: '#9C7A36',
  marble: '#EFE6D3',
  parchment: '#E8D9B5',
  parchmentDark: '#C9B48A',
  stone: '#8A7E70',
  smoke: 'rgba(239,230,211,0.55)',
  faint: 'rgba(239,230,211,0.12)',
  good: '#8FBF7A',
  bad: '#D9584A',
};

export const F = {
  title: 'Cinzel_700Bold',
  titleBlack: 'Cinzel_900Black',
  caps: 'Cinzel_400Regular',
  body: 'CormorantGaramond_500Medium',
  bodyItalic: 'CormorantGaramond_500Medium_Italic',
  bodyBold: 'CormorantGaramond_700Bold',
};

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function toRoman(n: number): string {
  if (n <= 0) return 'N';
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}
