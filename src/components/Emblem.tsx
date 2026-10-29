import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { TIERS } from '../game/world';
import { C, F, ROMAN } from '../theme';
import { Art } from './Art';

interface Props {
  index: number;
  division?: number;
  size?: number;
  animated?: boolean;
}

/** Medalha do elo: cada elo tem metal, símbolo e ornamentos próprios. */
export function Emblem({ index, division = 0, size = 120, animated = false }: Props) {
  const tier = TIERS[Math.max(0, Math.min(TIERS.length - 1, index))];
  const [dark, mid, light] = tier.colors;
  const gid = `m${index}`;
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;
    spin.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [animated, spin, pulse]);

  const raysStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.35, transform: [{ scale: 0.95 + pulse.value * 0.08 }] }));

  const hasWings = index >= 4;
  const hasRays = index >= 6;
  const hasCrownGems = index >= 7;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {animated && (
        <Animated.View
          style={[
            { position: 'absolute', width: size * 0.9, height: size * 0.9, borderRadius: size, backgroundColor: mid, shadowColor: light, shadowRadius: 30, shadowOpacity: 1 },
            glowStyle,
          ]}
        />
      )}
      {hasRays && (
        <Animated.View style={[{ position: 'absolute', width: size, height: size }, raysStyle]}>
          <Svg width={size} height={size} viewBox="0 0 120 120">
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i * 22.5 * Math.PI) / 180;
              const a1 = a - 0.08;
              const a2 = a + 0.08;
              return (
                <Polygon
                  key={i}
                  points={`${60 + 30 * Math.cos(a1)},${60 + 30 * Math.sin(a1)} ${60 + 59 * Math.cos(a)},${60 + 59 * Math.sin(a)} ${60 + 30 * Math.cos(a2)},${60 + 30 * Math.sin(a2)}`}
                  fill={i % 2 ? light : mid}
                  opacity={0.7}
                />
              );
            })}
          </Svg>
        </Animated.View>
      )}
      <Svg width={size} height={size} viewBox="0 0 120 120" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={`${gid}lin`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={light} />
            <Stop offset="0.5" stopColor={mid} />
            <Stop offset="1" stopColor={dark} />
          </LinearGradient>
          <RadialGradient id={`${gid}rad`} cx="50%" cy="40%" r="60%">
            <Stop offset="0" stopColor="#2A1F1A" />
            <Stop offset="1" stopColor="#0C0807" />
          </RadialGradient>
        </Defs>
        {hasWings && (
          <G>
            <Path d="M24 58 L2 40 L8 52 L0 54 L10 62 L4 68 L16 70 L12 78 L28 74 Z" fill={`url(#${gid}lin)`} stroke={dark} strokeWidth={0.8} />
            <Path d="M96 58 L118 40 L112 52 L120 54 L110 62 L116 68 L104 70 L108 78 L92 74 Z" fill={`url(#${gid}lin)`} stroke={dark} strokeWidth={0.8} />
          </G>
        )}
        <Circle cx={60} cy={60} r={44} fill={`url(#${gid}lin)`} stroke={dark} strokeWidth={1.2} />
        <Circle cx={60} cy={60} r={40.5} fill="none" stroke={light} strokeWidth={0.6} opacity={0.8} />
        {Array.from({ length: 28 }).map((_, i) => {
          const a = (i * (360 / 28) * Math.PI) / 180;
          return <Circle key={i} cx={60 + 42.2 * Math.cos(a)} cy={60 + 42.2 * Math.sin(a)} r={0.9} fill={dark} />;
        })}
        <Circle cx={60} cy={60} r={36} fill={`url(#${gid}rad)`} stroke={dark} strokeWidth={1} />
        {hasCrownGems && (
          <G>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = ((-90 + (i - 2) * 26) * Math.PI) / 180;
              return <Circle key={i} cx={60 + 44 * Math.cos(a)} cy={60 + 44 * Math.sin(a)} r={3.2} fill={i === 2 ? '#C0392B' : '#7E3B86'} stroke={light} strokeWidth={0.8} />;
            })}
          </G>
        )}
      </Svg>
      <View style={{ position: 'absolute', top: size * 0.24, alignItems: 'center' }}>
        <Art id={tier.symbol} size={size * 0.42} color={light} accent={mid} weight={3} />
      </View>
      {division > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.02,
            backgroundColor: dark,
            borderColor: light,
            borderWidth: 1,
            paddingHorizontal: size * 0.08,
            paddingVertical: 1,
            borderRadius: 2,
          }}
        >
          <Text style={{ fontFamily: F.title, color: C.marble, fontSize: Math.max(9, size * 0.11), letterSpacing: 2 }}>{ROMAN[division]}</Text>
        </View>
      )}
    </View>
  );
}
