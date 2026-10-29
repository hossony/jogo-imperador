import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { C, F } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const tap = () => {
  Haptics.selectionAsync().catch(() => {});
};
export const thump = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'ghost' | 'crimson' | 'purple';
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  sub?: string;
}

/** Botão com borda dourada, escala ao toque e vibração leve. */
export function RomanButton({ label, onPress, variant = 'gold', disabled, small, style, sub }: ButtonProps) {
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const colors: Record<string, [string, string]> = {
    gold: ['#E6C77E', '#A8823A'],
    ghost: ['rgba(212,175,99,0.10)', 'rgba(212,175,99,0.04)'],
    crimson: ['#A8362B', '#5E1A15'],
    purple: ['#8A4996', '#4B1F4F'],
  };
  const textColor = variant === 'gold' ? C.ink : C.marble;
  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => {
        s.value = withSpring(0.95, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 12, stiffness: 300 });
      }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[anim, { opacity: disabled ? 0.4 : 1 }, style]}
    >
      <LinearGradient
        colors={colors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.btn, small && styles.btnSmall, variant === 'ghost' && styles.btnGhost]}
      >
        <Text style={[styles.btnText, small && styles.btnTextSmall, { color: textColor }]}>{label}</Text>
        {sub ? <Text style={[styles.btnSub, { color: variant === 'gold' ? 'rgba(22,16,13,0.7)' : C.smoke }]}>{sub}</Text> : null}
      </LinearGradient>
    </AnimatedPressable>
  );
}

/** Faixa decorativa com o padrão grego (meandro). */
export function Meander({ width, color = C.gold, opacity = 0.55 }: { width: number; color?: string; opacity?: number }) {
  const unit = 16;
  const n = Math.max(1, Math.floor(width / unit));
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = i * unit;
    d += `M${x} 13 L${x} 3 L${x + 12} 3 L${x + 12} 10 L${x + 5} 10 L${x + 5} 7 L${x + 8} 7 `;
    d += `M${x + 12} 13 L${x + 16} 13 `;
  }
  return (
    <Svg width={n * unit} height={16} style={{ opacity, alignSelf: 'center' }}>
      <Path d={d} stroke={color} strokeWidth={1.4} fill="none" />
      <Path d={`M0 15.5 L${n * unit} 15.5 M0 0.5 L${n * unit} 0.5`} stroke={color} strokeWidth={0.8} />
    </Svg>
  );
}

/** Divisor com losango central. */
export function Ornament({ width = 180, color = C.gold }: { width?: number; color?: string }) {
  const h = 12;
  const mid = width / 2;
  return (
    <Svg width={width} height={h} style={{ alignSelf: 'center' }}>
      <Path d={`M0 ${h / 2} L${mid - 12} ${h / 2} M${mid + 12} ${h / 2} L${width} ${h / 2}`} stroke={color} strokeWidth={0.8} opacity={0.6} />
      <Path d={`M${mid} 1 L${mid + 7} ${h / 2} L${mid} ${h - 1} L${mid - 7} ${h / 2} Z`} stroke={color} strokeWidth={1} fill={color} fillOpacity={0.25} />
      <Path d={`M${mid - 18} ${h / 2} L${mid - 14} 3 M${mid + 18} ${h / 2} L${mid + 14} 3`} stroke={color} strokeWidth={0.8} opacity={0.7} />
    </Svg>
  );
}

export function Panel({ children, style, glow }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; glow?: string }) {
  return (
    <View style={[styles.panel, glow ? { borderColor: glow, shadowColor: glow } : null, style]}>
      <View style={styles.panelInner}>{children}</View>
    </View>
  );
}

export function Caps({ children, style, size = 11, color = C.gold }: { children: React.ReactNode; style?: object; size?: number; color?: string }) {
  return <Text style={[{ fontFamily: F.caps, fontSize: size, letterSpacing: size * 0.22, color }, style]}>{children}</Text>;
}

export function ScreenHeader({ title, latin, onBack }: { title: string; latin?: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable hitSlop={16} onPress={() => { tap(); onBack(); }} style={styles.back}>
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <Path d="M15 5 L8 12 L15 19" stroke={C.gold} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        </Svg>
      </Pressable>
      <View style={{ alignItems: 'center', flex: 1 }}>
        {latin ? <Caps size={9} color={C.goldDeep}>{latin}</Caps> : null}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={{ width: 28 }} />
    </View>
  );
}

/** Barra horizontal animada (força, progresso de elo etc.). */
export function ProgressBar({ value, color = C.gold, height = 6, track = 'rgba(239,230,211,0.10)' }: { value: number; color?: string; height?: number; track?: string }) {
  const v = useSharedValue(0);
  React.useEffect(() => {
    v.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 700 });
  }, [value, v]);
  const style = useAnimatedStyle(() => ({ width: `${v.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 26,
    borderRadius: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242,213,140,0.7)',
  },
  btnSmall: { paddingVertical: 10, paddingHorizontal: 16 },
  btnGhost: { borderColor: 'rgba(212,175,99,0.45)' },
  btnText: { fontFamily: F.title, fontSize: 15, letterSpacing: 3 },
  btnTextSmall: { fontSize: 12, letterSpacing: 2 },
  btnSub: { fontFamily: F.bodyItalic, fontSize: 13, marginTop: 2 },
  panel: {
    borderWidth: 1,
    borderColor: 'rgba(212,175,99,0.35)',
    backgroundColor: 'rgba(22,16,13,0.72)',
    borderRadius: 4,
    padding: 3,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 2,
  },
  panelInner: {
    borderWidth: 0.5,
    borderColor: 'rgba(212,175,99,0.18)',
    borderRadius: 2,
    padding: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  back: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: F.title, color: C.marble, fontSize: 20, letterSpacing: 4, marginTop: 2 },
});
