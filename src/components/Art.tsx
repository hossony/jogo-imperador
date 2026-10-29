import React, { memo } from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import type { ArtId } from '../game/types';
import { C } from '../theme';

interface Props {
  id: ArtId;
  size: number;
  color?: string;
  accent?: string;
  /** espessura do traço no viewBox 0-100 */
  weight?: number;
}

type Draw = (c: string, a: string, w: number) => React.ReactNode;

const leaves = (cx: number, cy: number, r: number, from: number, to: number, step: number, c: string, w: number) => {
  const out: React.ReactNode[] = [];
  const dir = to > from ? 1 : -1;
  for (let a = from; dir > 0 ? a <= to : a >= to; a += step * dir) {
    const rad = (a * Math.PI) / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    // folha pontuda saindo do ramo, inclinada para fora
    const tilt = a + 90 * dir + 35 * dir;
    const t = (tilt * Math.PI) / 180;
    const len = 11;
    const tx = x + len * Math.cos(t);
    const ty = y + len * Math.sin(t);
    const nx = -Math.sin(t) * 3.2;
    const ny = Math.cos(t) * 3.2;
    const mx = (x + tx) / 2;
    const my = (y + ty) / 2;
    out.push(
      <Path key={a} d={`M${x} ${y} Q${mx + nx} ${my + ny} ${tx} ${ty} Q${mx - nx} ${my - ny} ${x} ${y} Z`}
        fill={c} fillOpacity={0.35} stroke={c} strokeWidth={w * 0.5} strokeLinejoin="round" />,
    );
  }
  return out;
};

const ART: Record<ArtId, Draw> = {
  laurel: (c, a, w) => (
    <G>
      <Path d="M50 86 A36 36 0 0 1 20 30" stroke={c} strokeWidth={w * 0.7} fill="none" />
      <Path d="M50 86 A36 36 0 0 0 80 30" stroke={c} strokeWidth={w * 0.7} fill="none" />
      {leaves(50, 50, 36, 102, 240, 12, c, w)}
      {leaves(50, 50, 36, 78, -60, 12, c, w)}
      <Circle cx={50} cy={86} r={3} fill={a} stroke={a} strokeWidth={w * 0.5} />
      <Path d="M48 88 Q42 94 38 96 M52 88 Q58 94 62 96" stroke={a} strokeWidth={w * 0.8} fill="none" strokeLinecap="round" />
    </G>
  ),
  senate: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Polygon points="12,36 50,15 88,36" fill={c} fillOpacity={0.15} />
      <Circle cx={50} cy={29} r={3} stroke={a} />
      <Rect x={12} y={36} width={76} height={7} />
      {[0, 1, 2, 3, 4].map((i) => (
        <G key={i}>
          <Rect x={18 + i * 14.5} y={46} width={6} height={30} />
          <Line x1={21 + i * 14.5} y1={49} x2={21 + i * 14.5} y2={73} strokeWidth={w * 0.4} />
        </G>
      ))}
      <Rect x={10} y={77} width={80} height={5} />
      <Rect x={5} y={82} width={90} height={6} />
    </G>
  ),
  temple: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Path d="M22 42 A28 24 0 0 1 78 42 Z" fill={c} fillOpacity={0.15} />
      <Line x1={50} y1={18} x2={50} y2={10} />
      <Circle cx={50} cy={8} r={2.5} stroke={a} />
      <Rect x={18} y={42} width={64} height={6} />
      {[0, 1, 2, 3].map((i) => <Rect key={i} x={23 + i * 15.5} y={50} width={7} height={26} />)}
      <Rect x={14} y={76} width={72} height={5} />
      <Rect x={8} y={81} width={84} height={6} />
    </G>
  ),
  sword: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Polygon points="50,6 57,18 57,60 43,60 43,18" fill={c} fillOpacity={0.15} />
      <Line x1={50} y1={16} x2={50} y2={58} strokeWidth={w * 0.5} />
      <Rect x={34} y={60} width={32} height={6} rx={3} />
      <Rect x={45} y={66} width={10} height={17} rx={2} />
      <Line x1={45} y1={71} x2={55} y2={71} strokeWidth={w * 0.5} />
      <Line x1={45} y1={77} x2={55} y2={77} strokeWidth={w * 0.5} />
      <Circle cx={50} cy={88} r={6} stroke={a} />
    </G>
  ),
  shield: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Rect x={26} y={10} width={48} height={80} rx={12} fill={c} fillOpacity={0.12} />
      <Rect x={31} y={15} width={38} height={70} rx={9} strokeWidth={w * 0.5} />
      <Circle cx={50} cy={50} r={9} stroke={a} fill={a} fillOpacity={0.2} />
      <Path d="M50 41 L50 20 M50 59 L50 80 M44 44 L36 26 M56 44 L64 26 M44 56 L36 74 M56 56 L64 74" strokeWidth={w * 0.7} />
    </G>
  ),
  helmet: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round">
      <Path d="M24 66 Q22 30 50 28 Q78 30 76 66" fill={c} fillOpacity={0.12} />
      <Path d="M24 66 L20 72 L34 72" />
      <Path d="M76 66 L80 72 L66 72" />
      <Path d="M36 50 L36 80 Q42 84 46 78 L46 56" />
      <Path d="M64 50 L64 80 Q58 84 54 78 L54 56" />
      <Path d="M28 44 Q50 38 72 44" strokeWidth={w * 0.6} />
      {Array.from({ length: 13 }).map((_, i) => {
        const x = 26 + i * 4;
        const top = 10 + Math.abs(6 - i) * 1.4;
        return <Line key={i} x1={x} y1={28 - Math.abs(6 - i) * 0.2} x2={x - 1} y2={top} stroke={a} strokeWidth={w * 0.8} />;
      })}
    </G>
  ),
  coins: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none">
      {[0, 1, 2, 3].map((i) => (
        <G key={i}>
          <Ellipse cx={34} cy={82 - i * 7} rx={20} ry={6} fill={C.night} />
          <Ellipse cx={34} cy={82 - i * 7} rx={20} ry={6} fill={c} fillOpacity={0.2} />
        </G>
      ))}
      <Circle cx={64} cy={42} r={24} fill={C.night} />
      <Circle cx={64} cy={42} r={24} fill={c} fillOpacity={0.18} />
      <Circle cx={64} cy={42} r={18} strokeWidth={w * 0.5} />
      <Path d="M60 30 Q70 30 70 40 Q70 46 64 48 L66 54 M60 30 Q56 36 58 42 Q60 46 64 48" stroke={a} strokeWidth={w * 0.8} />
      {Array.from({ length: 12 }).map((_, i) => {
        const r = (i * 30 * Math.PI) / 180;
        return <Circle key={i} cx={64 + 21 * Math.cos(r)} cy={42 + 21 * Math.sin(r)} r={0.9} fill={c} stroke="none" />;
      })}
    </G>
  ),
  wheat: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinecap="round">
      {[-14, 0, 14].map((dx, k) => (
        <G key={k} rotation={dx} origin="50, 92">
          <Path d="M50 92 Q50 60 50 20" />
          {[0, 1, 2, 3, 4].map((i) => (
            <G key={i}>
              <Ellipse cx={45} cy={26 + i * 9} rx={3.5} ry={6} rotation={-28} origin={`45, ${26 + i * 9}`} fill={k === 1 ? a : c} fillOpacity={0.35} strokeWidth={w * 0.6} />
              <Ellipse cx={55} cy={26 + i * 9} rx={3.5} ry={6} rotation={28} origin={`55, ${26 + i * 9}`} fill={k === 1 ? a : c} fillOpacity={0.35} strokeWidth={w * 0.6} />
            </G>
          ))}
          <Line x1={50} y1={20} x2={50} y2={10} strokeWidth={w * 0.5} />
        </G>
      ))}
    </G>
  ),
  eagle: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Line x1={50} y1={58} x2={50} y2={96} />
      <Circle cx={50} cy={66} r={8} stroke={a} />
      <Path d="M44 30 L10 14 L16 24 L6 26 L16 34 L8 40 L20 42 L44 44 Z" fill={c} fillOpacity={0.18} />
      <Path d="M56 30 L90 14 L84 24 L94 26 L84 34 L92 40 L80 42 L56 44 Z" fill={c} fillOpacity={0.18} />
      <Ellipse cx={50} cy={38} rx={7} ry={13} fill={c} fillOpacity={0.25} />
      <Circle cx={50} cy={20} r={5} fill={c} fillOpacity={0.25} />
      <Path d="M54 19 L60 21 L54 23" stroke={a} />
      <Path d="M44 50 L40 56 M56 50 L60 56" />
      <Rect x={38} y={54} width={24} height={4} />
    </G>
  ),
  scroll: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Rect x={24} y={20} width={52} height={60} fill={c} fillOpacity={0.12} />
      <Rect x={18} y={12} width={64} height={10} rx={5} />
      <Rect x={18} y={78} width={64} height={10} rx={5} />
      <Circle cx={18} cy={17} r={4} stroke={a} />
      <Circle cx={82} cy={17} r={4} stroke={a} />
      <Circle cx={18} cy={83} r={4} stroke={a} />
      <Circle cx={82} cy={83} r={4} stroke={a} />
      {[0, 1, 2, 3, 4].map((i) => <Line key={i} x1={32} y1={32 + i * 9} x2={i % 2 ? 60 : 68} y2={32 + i * 9} strokeWidth={w * 0.6} />)}
    </G>
  ),
  ship: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Path d="M8 60 Q50 76 92 60 L86 70 Q50 84 14 70 Z" fill={c} fillOpacity={0.2} />
      <Path d="M92 60 Q98 52 94 46" stroke={a} />
      <Line x1={50} y1={64} x2={50} y2={12} />
      <Path d="M28 18 Q50 26 72 18 L72 50 Q50 58 28 50 Z" fill={c} fillOpacity={0.12} />
      <Path d="M44 30 L56 30 M50 26 L50 46" stroke={a} strokeWidth={w * 0.7} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Line key={i} x1={24 + i * 10} y1={74} x2={18 + i * 10} y2={90} strokeWidth={w * 0.6} />)}
    </G>
  ),
  fire: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Path d="M50 8 C64 26 78 40 72 60 C68 74 32 74 28 60 C24 46 36 40 38 26 C44 38 48 40 50 44 C52 32 46 20 50 8 Z" fill={a} fillOpacity={0.25} stroke={a} />
      <Path d="M50 34 C58 44 62 52 58 62 C54 68 44 68 42 62 C40 54 46 50 50 34 Z" fill={c} fillOpacity={0.3} />
      <Path d="M22 70 L78 70 L70 82 L30 82 Z" fill={c} fillOpacity={0.15} />
      <Line x1={36} y1={82} x2={30} y2={94} />
      <Line x1={64} y1={82} x2={70} y2={94} />
      <Line x1={50} y1={82} x2={50} y2={94} />
    </G>
  ),
  dagger: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <G rotation={-35} origin="50, 50">
        <Path d="M50 4 Q58 22 56 56 L44 56 Q42 22 50 4 Z" fill={c} fillOpacity={0.15} />
        <Line x1={50} y1={14} x2={50} y2={52} strokeWidth={w * 0.5} />
        <Path d="M36 56 L64 56 L60 62 L40 62 Z" />
        <Rect x={46} y={62} width={8} height={16} />
        <Circle cx={50} cy={84} r={6} />
      </G>
      <Path d="M70 70 Q66 78 70 82 Q74 78 70 70 Z" fill={a} stroke={a} />
      <Path d="M80 82 Q77 88 80 91 Q83 88 80 82 Z" fill={a} stroke={a} />
    </G>
  ),
  mask: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Path d="M26 18 Q50 10 74 18 Q78 52 66 72 Q50 90 34 72 Q22 52 26 18 Z" fill={c} fillOpacity={0.12} />
      <Path d="M34 36 Q40 30 46 36 Q40 40 34 36 Z" fill={a} stroke={a} />
      <Path d="M54 36 Q60 30 66 36 Q60 40 54 36 Z" fill={a} stroke={a} />
      <Path d="M32 28 Q40 22 46 28 M54 28 Q60 22 68 28" strokeWidth={w * 0.6} />
      <Path d="M50 40 L47 54 L52 54" strokeWidth={w * 0.7} />
      <Path d="M38 62 Q50 72 62 62 Q50 66 38 62 Z" fill={c} fillOpacity={0.4} />
    </G>
  ),
  wheel: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none">
      <Circle cx={50} cy={50} r={36} />
      <Circle cx={50} cy={50} r={31} strokeWidth={w * 0.5} />
      <Circle cx={50} cy={50} r={8} fill={a} fillOpacity={0.3} stroke={a} />
      {Array.from({ length: 8 }).map((_, i) => {
        const r = (i * 45 * Math.PI) / 180;
        return <Line key={i} x1={50 + 8 * Math.cos(r)} y1={50 + 8 * Math.sin(r)} x2={50 + 31 * Math.cos(r)} y2={50 + 31 * Math.sin(r)} />;
      })}
    </G>
  ),
  arena: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none">
      <Ellipse cx={50} cy={30} rx={42} ry={11} fill={c} fillOpacity={0.12} />
      <Path d="M8 30 L8 74 Q50 92 92 74 L92 30" />
      <Path d="M8 52 Q50 68 92 52" strokeWidth={w * 0.6} />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 14 + i * 9;
        const dy = Math.sin((i / 8) * Math.PI) * 7;
        return (
          <G key={i}>
            <Path d={`M${x} ${48 + dy} L${x} ${40 + dy} Q${x + 3.5} ${35 + dy} ${x + 7} ${40 + dy} L${x + 7} ${48 + dy}`} strokeWidth={w * 0.5} />
            <Path d={`M${x} ${72 + dy} L${x} ${62 + dy} Q${x + 3.5} ${57 + dy} ${x + 7} ${62 + dy} L${x + 7} ${72 + dy}`} strokeWidth={w * 0.5} stroke={a} />
          </G>
        );
      })}
    </G>
  ),
  amphora: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Path d="M42 12 L58 12 L58 22 Q76 34 70 60 Q64 82 50 94 Q36 82 30 60 Q24 34 42 22 Z" fill={c} fillOpacity={0.15} />
      <Path d="M42 22 Q26 22 30 40 M58 22 Q74 22 70 40" />
      <Path d="M31 46 Q50 52 69 46 M30 58 Q50 64 70 58" stroke={a} strokeWidth={w * 0.7} />
      <Path d="M38 52 L42 49 L46 52 L50 49 L54 52 L58 49 L62 52" stroke={a} strokeWidth={w * 0.5} />
    </G>
  ),
  chains: (c, a, w) => (
    <G stroke={c} strokeWidth={w * 1.1} fill="none">
      <Ellipse cx={24} cy={30} rx={13} ry={8} rotation={45} origin="24, 30" />
      <Ellipse cx={38} cy={44} rx={13} ry={8} rotation={-45} origin="38, 44" stroke={a} />
      <Ellipse cx={52} cy={58} rx={13} ry={8} rotation={45} origin="52, 58" />
      <Ellipse cx={66} cy={72} rx={13} ry={8} rotation={-45} origin="66, 72" stroke={a} />
      <Circle cx={80} cy={84} r={7} />
    </G>
  ),
  crown: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Path d="M14 70 L18 34 L32 52 L40 22 L50 46 L60 22 L68 52 L82 34 L86 70 Z" fill={c} fillOpacity={0.2} />
      <Rect x={14} y={70} width={72} height={10} rx={2} />
      <Circle cx={30} cy={75} r={2.5} fill={a} stroke={a} />
      <Circle cx={50} cy={75} r={3} fill={a} stroke={a} />
      <Circle cx={70} cy={75} r={2.5} fill={a} stroke={a} />
      <Circle cx={40} cy={20} r={3} stroke={a} />
      <Circle cx={60} cy={20} r={3} stroke={a} />
      <Circle cx={18} cy={32} r={2.5} />
      <Circle cx={82} cy={32} r={2.5} />
    </G>
  ),
  column: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Rect x={24} y={12} width={52} height={6} />
      <Circle cx={30} cy={23} r={5} stroke={a} />
      <Circle cx={70} cy={23} r={5} stroke={a} />
      <Path d="M30 18 Q50 26 70 18" />
      <Rect x={34} y={28} width={32} height={52} fill={c} fillOpacity={0.12} />
      {[0, 1, 2, 3].map((i) => <Line key={i} x1={40 + i * 6.5} y1={31} x2={40 + i * 6.5} y2={77} strokeWidth={w * 0.5} />)}
      <Rect x={28} y={80} width={44} height={5} />
      <Rect x={22} y={85} width={56} height={6} />
    </G>
  ),
  omen: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Path d="M62 14 A28 28 0 1 0 84 56 A22 22 0 1 1 62 14 Z" fill={c} fillOpacity={0.2} />
      {[[24, 20], [40, 12], [16, 46]].map(([x, y], i) => (
        <Path key={i} d={`M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 4} L${x - 1.2} ${y + 1.2} L${x - 4} ${y} L${x - 1.2} ${y - 1.2} Z`} fill={a} stroke={a} strokeWidth={w * 0.4} />
      ))}
      <Path d="M18 74 Q24 68 30 74 Q36 68 42 74" stroke={a} />
      <Path d="M48 86 Q53 81 58 86 Q63 81 68 86" stroke={a} />
      <Path d="M30 90 Q34 86 38 90 Q42 86 46 90" stroke={a} strokeWidth={w * 0.7} />
    </G>
  ),
  family: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Circle cx={30} cy={26} r={9} fill={c} fillOpacity={0.15} />
      <Path d="M14 88 Q14 44 30 42 Q46 44 46 88" fill={c} fillOpacity={0.12} />
      <Circle cx={70} cy={26} r={9} fill={c} fillOpacity={0.15} />
      <Path d="M54 88 Q54 44 70 42 Q86 44 86 88" fill={c} fillOpacity={0.12} />
      <Circle cx={50} cy={52} r={6.5} stroke={a} fill={a} fillOpacity={0.2} />
      <Path d="M40 90 Q40 66 50 64 Q60 66 60 90" stroke={a} fill={a} fillOpacity={0.15} />
      <Path d="M26 16 Q30 12 34 16 M66 16 Q70 12 74 16" stroke={a} strokeWidth={w * 0.6} />
    </G>
  ),
  road: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Path d="M6 52 L26 30 L38 40 L56 18 L76 42 L86 34 L96 52" fill={c} fillOpacity={0.1} />
      <Path d="M40 94 L48 54 M60 94 L52 54" />
      <Path d="M50 90 L50 84 M50 76 L50 70 M50 64 L50 60" stroke={a} strokeWidth={w * 0.7} />
      <Path d="M6 54 L94 54" strokeWidth={w * 0.5} />
      <Rect x={72} y={62} width={12} height={26} rx={5} fill={c} fillOpacity={0.2} />
      <Line x1={75} y1={70} x2={81} y2={70} stroke={a} strokeWidth={w * 0.6} />
      <Line x1={75} y1={76} x2={81} y2={76} stroke={a} strokeWidth={w * 0.6} />
    </G>
  ),
  fasces: (c, a, w) => (
    <G stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round">
      <Rect x={38} y={18} width={24} height={72} rx={6} fill={c} fillOpacity={0.12} />
      {[0, 1, 2, 3].map((i) => <Line key={i} x1={42 + i * 5.3} y1={20} x2={42 + i * 5.3} y2={88} strokeWidth={w * 0.5} />)}
      {[0, 1, 2, 3, 4].map((i) => <Line key={i} x1={38} y1={30 + i * 13} x2={62} y2={36 + i * 13} stroke={a} strokeWidth={w * 0.8} />)}
      <Line x1={50} y1={18} x2={50} y2={8} />
      <Path d="M50 10 Q72 4 76 20 Q66 18 50 22 Z" fill={a} fillOpacity={0.3} stroke={a} />
    </G>
  ),
};

function ArtBase({ id, size, color = C.gold, accent = C.goldBright, weight = 2.2 }: Props) {
  const draw = ART[id] ?? ART.laurel;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {draw(color, accent, weight)}
    </Svg>
  );
}

export const Art = memo(ArtBase);
