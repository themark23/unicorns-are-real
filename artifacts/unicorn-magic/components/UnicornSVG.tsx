import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

type Zone = 'body' | 'mane' | 'horn' | 'tail';

interface UnicornColors {
  body: string;
  mane: string;
  horn: string;
  tail: string;
}

interface UnicornSVGProps {
  colors: UnicornColors;
  mode: 'dress' | 'paint';
  sparkles?: boolean;
  onZonePress: (zone: Zone) => void;
  showWings?: boolean;
}

function SparkleShape({ cx, cy, size, color }: { cx: number; cy: number; size: number; color: string }) {
  const s = size;
  return (
    <Path
      d={`M ${cx},${cy - s} L ${cx + s / 3},${cy} L ${cx},${cy + s} L ${cx - s / 3},${cy} Z M ${cx - s},${cy} L ${cx},${cy + s / 3} L ${cx + s},${cy} L ${cx},${cy - s / 3} Z`}
      fill={color}
    />
  );
}

export default function UnicornSVG({ colors, mode, sparkles, onZonePress, showWings }: UnicornSVGProps) {
  const bodyFill = mode === 'paint' ? '#ffffff' : colors.body;
  const maneFill = mode === 'paint' ? '#ffffff' : colors.mane;
  const hornFill = mode === 'paint' ? '#ffffff' : colors.horn;
  const tailFill = mode === 'paint' ? '#ffffff' : colors.tail;

  const border = mode === 'paint' ? '#CECBF6' : 'none';

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 312 272" width={268} height={233}>
        {/* Tail */}
        <Path
          d="M 56,142 C 30,155 8,178 20,204 C 32,230 62,222 72,198 C 80,180 70,162 58,154 Z"
          fill={tailFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('tail')}
        />
        <Path
          d="M 52,145 C 22,135 5,158 18,184 C 5,155 10,132 52,145 Z"
          fill={tailFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('tail')}
        />

        {/* Back legs */}
        <Rect
          x={100} y={224} width={20} height={44} rx={8}
          fill={bodyFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('body')}
        />
        <Rect
          x={130} y={224} width={20} height={44} rx={8}
          fill={bodyFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('body')}
        />

        {/* Main body */}
        <Ellipse
          cx={150} cy={166} rx={98} ry={70}
          fill={bodyFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('body')}
        />

        {/* Front legs */}
        <Rect
          x={174} y={224} width={20} height={44} rx={8}
          fill={bodyFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('body')}
        />
        <Rect
          x={202} y={224} width={20} height={44} rx={8}
          fill={bodyFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('body')}
        />

        {/* Wings (alicorn) */}
        {showWings && (
          <Path
            d="M 106,152 C 72,130 42,148 52,172 C 57,184 78,178 94,164 C 76,178 66,194 78,206 C 84,213 100,202 104,188 Z"
            fill={maneFill}
            stroke={border}
            strokeWidth={mode === 'paint' ? 1.5 : 0}
            onPress={() => onZonePress('mane')}
          />
        )}

        {/* Neck */}
        <Path
          d="M 200,122 L 222,116 L 240,144 L 218,150 Z"
          fill={bodyFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('body')}
        />

        {/* Mane (flowing shape along neck and head) */}
        <Path
          d="M 208,76 C 197,62 186,76 194,90 C 180,86 178,102 190,108 C 176,108 174,124 186,128 C 172,132 170,148 186,150 C 200,152 216,144 220,134 C 226,122 220,108 214,102 C 228,98 230,86 224,78 C 232,72 228,58 218,64 Z"
          fill={maneFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('mane')}
        />

        {/* Head */}
        <Ellipse
          cx={236} cy={100} rx={42} ry={38}
          fill={bodyFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('body')}
        />

        {/* Ear */}
        <Path
          d="M 214,70 L 224,56 L 234,72 Z"
          fill={bodyFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('body')}
        />
        <Path
          d="M 218,70 L 224,61 L 231,72 Z"
          fill={maneFill}
          onPress={() => onZonePress('mane')}
        />

        {/* Horn */}
        <Path
          d="M 242,68 L 274,12 L 254,74 Z"
          fill={hornFill}
          stroke={border}
          strokeWidth={mode === 'paint' ? 1.5 : 0}
          onPress={() => onZonePress('horn')}
        />
        {/* Horn spiral detail */}
        <Path d="M 246,66 L 271,16" stroke="#ffffff50" strokeWidth={1.5} strokeLinecap="round" />
        <Path d="M 250,70 L 266,30" stroke="#ffffff50" strokeWidth={1.5} strokeLinecap="round" />

        {/* Eye */}
        <Circle cx={248} cy={100} r={7} fill="#ffffff" />
        <Circle cx={249} cy={101} r={4} fill="#26215C" />
        <Circle cx={250} cy={99} r={1.5} fill="#ffffff" />

        {/* Nostril */}
        <Ellipse cx={272} cy={114} rx={3.5} ry={4.5} fill="#26215C20" />

        {/* Hooves */}
        <Rect x={100} y={262} width={20} height={6} rx={3} fill="#CECBF6" />
        <Rect x={130} y={262} width={20} height={6} rx={3} fill="#CECBF6" />
        <Rect x={174} y={262} width={20} height={6} rx={3} fill="#CECBF6" />
        <Rect x={202} y={262} width={20} height={6} rx={3} fill="#CECBF6" />

        {/* Sparkles */}
        {sparkles && (
          <>
            <SparkleShape cx={45} cy={78} size={10} color="#ffd700cc" />
            <SparkleShape cx={278} cy={38} size={8} color="#ffd700cc" />
            <SparkleShape cx={30} cy={180} size={7} color="#ff9de2cc" />
            <SparkleShape cx={290} cy={155} size={9} color="#c084fccc" />
            <SparkleShape cx={88} cy={50} size={6} color="#ffd700cc" />
            <SparkleShape cx={265} cy={200} size={8} color="#ffd700cc" />
            <SparkleShape cx={155} cy={40} size={7} color="#93c5fdcc" />
            <SparkleShape cx={310} cy={80} size={6} color="#ff9de2cc" />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
