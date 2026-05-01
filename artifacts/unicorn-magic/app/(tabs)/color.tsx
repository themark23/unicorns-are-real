import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Image as SvgImage,
  Path,
  Rect,
} from 'react-native-svg';

import { useUnicorn } from '@/context/UnicornContext';
import { useColors } from '@/hooks/useColors';

/* ─── Images ──────────────────────────────────────────────────────────────── */
// White-background original (used in dress tab)
// Transparent line-art (used here as overlay so colors show through)
const LINES_IMG  = require('../../assets/unicorn_lines.png');

/* ─── Locations ───────────────────────────────────────────────────────────── */
type Location = 'rainbow meadow' | 'enchanted forest' | 'crystal cave' | 'starry sky' | 'magical beach';
const LOCATIONS: { id: Location; label: string; gradient: [string, string] }[] = [
  { id: 'rainbow meadow',   label: 'Rainbow Meadow',   gradient: ['#87CEEB', '#98FB98'] },
  { id: 'enchanted forest', label: 'Enchanted Forest', gradient: ['#2d6a4f', '#1b4332'] },
  { id: 'crystal cave',     label: 'Crystal Cave',     gradient: ['#2d2d6b', '#4a1985'] },
  { id: 'starry sky',       label: 'Starry Sky',       gradient: ['#0d0d2b', '#1a1a5a'] },
  { id: 'magical beach',    label: 'Magical Beach',    gradient: ['#87CEEB', '#f4d03f'] },
];

/* ─── Zones ───────────────────────────────────────────────────────────────── */
/*
  The coloring image is 400×400 in SVG coordinate space (square crop).
  Each zone is drawn BELOW the transparent line-art so colours appear under
  the black outlines — exactly like physical coloured pencils on paper.

  Shapes are intentionally approximate; the line art on top masks any
  rough edges so they look clean on screen.
*/
interface PaintZone {
  id: string;
  label: string;
  icon: string;
  emoji: string;
  element: (fill: string, onPress: () => void) => React.ReactNode;
  hitTarget: (onPress: () => void) => React.ReactNode;
}

/*
  SVG coordinate space: 400 × 500 (matches 1122×1402 image ratio, ~0.8).
  Scale factors from image pixels → SVG: x ÷ 2.805,  y ÷ 2.804
  Zones are approximate; the transparent line-art layer on top makes
  any rough edge invisible to the user.
*/
const PAINT_ZONES: PaintZone[] = [
  /* ── Sky & background ─────────────────────────────── */
  {
    id: 'sky', label: 'Sky', icon: 'weather-sunny', emoji: '☁️',
    element: (fill, onPress) => (
      <Path
        d="M 0,0 L 400,0 L 400,196 C 270,185 140,180 0,196 Z"
        fill={fill} fillOpacity={0.88} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Rect x={0} y={0} width={400} height={196} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'moon', label: 'Moon', icon: 'moon-waning-crescent', emoji: '🌙',
    element: (fill, onPress) => (
      <Circle cx={330} cy={56} r={32} fill={fill} fillOpacity={0.90} onPress={onPress} />
    ),
    hitTarget: (onPress) => (
      <Circle cx={330} cy={56} r={42} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'stars', label: 'Stars', icon: 'star-four-points', emoji: '✨',
    element: (fill, onPress) => (
      <>
        {[
          [115,38],[195,22],[244,50],[292,30],[346,20],
          [362,90],[374,138],[255,92],[162,72],[314,118],
        ].map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={7} fill={fill} fillOpacity={0.85} onPress={onPress} />
        ))}
      </>
    ),
    hitTarget: (onPress) => (
      <Rect x={0} y={0} width={400} height={165} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'mountains', label: 'Mountains', icon: 'terrain', emoji: '⛰️',
    element: (fill, onPress) => (
      <Path
        d="M 172,198 L 234,96 L 300,198 Z M 218,202 L 268,122 L 326,202 Z"
        fill={fill} fillOpacity={0.85} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Path
        d="M 165,198 L 234,88 L 335,198 Z"
        fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'ltrees', label: 'Left Trees', icon: 'tree', emoji: '🌲',
    element: (fill, onPress) => (
      <Rect x={0} y={64} width={112} height={372} fill={fill} fillOpacity={0.75} onPress={onPress} />
    ),
    hitTarget: (onPress) => (
      <Rect x={0} y={64} width={112} height={372} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'rtrees', label: 'Right Trees', icon: 'tree-outline', emoji: '🌳',
    element: (fill, onPress) => (
      <Rect x={304} y={90} width={96} height={368} fill={fill} fillOpacity={0.75} onPress={onPress} />
    ),
    hitTarget: (onPress) => (
      <Rect x={304} y={90} width={96} height={368} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'waterfall', label: 'Waterfall', icon: 'water', emoji: '💧',
    element: (fill, onPress) => (
      <Rect x={0} y={200} width={78} height={194} fill={fill} fillOpacity={0.80} onPress={onPress} />
    ),
    hitTarget: (onPress) => (
      <Rect x={0} y={200} width={78} height={194} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'ground', label: 'Ground', icon: 'grass', emoji: '🌿',
    element: (fill, onPress) => (
      <Path
        d="M 0,402 C 100,390 250,386 400,396 L 400,500 L 0,500 Z"
        fill={fill} fillOpacity={0.88} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Rect x={0} y={386} width={400} height={114} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'flowers', label: 'Flowers', icon: 'flower', emoji: '🌸',
    element: (fill, onPress) => (
      <>
        {[
          [28,458,20],[82,448,16],[155,465,18],[52,474,14],
          [374,450,17],[342,462,15],[394,472,13],
        ].map(([cx, cy, r], i) => (
          <Circle key={i} cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.90} onPress={onPress} />
        ))}
      </>
    ),
    hitTarget: (onPress) => (
      <Rect x={0} y={435} width={400} height={65} fill="transparent" onPress={onPress} />
    ),
  },

  /* ── Unicorn zones ─────────────────────────────────── */
  {
    id: 'horn', label: 'Horn', icon: 'wave', emoji: '🦄',
    element: (fill, onPress) => (
      <Path
        d="M 190,4 L 214,108 L 168,108 Z"
        fill={fill} fillOpacity={0.88} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Path d="M 184,2 L 220,112 L 160,112 Z" fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'mane', label: 'Mane', icon: 'auto-awesome', emoji: '💜',
    element: (fill, onPress) => (
      <Ellipse
        cx={146} cy={268} rx={58} ry={145}
        fill={fill} fillOpacity={0.82} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Ellipse cx={146} cy={268} rx={68} ry={158} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'head', label: 'Head', icon: 'face-woman', emoji: '😊',
    element: (fill, onPress) => (
      <Ellipse
        cx={190} cy={140} rx={76} ry={90}
        fill={fill} fillOpacity={0.82} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Ellipse cx={190} cy={140} rx={86} ry={100} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'body', label: 'Body', icon: 'horse', emoji: '🐴',
    element: (fill, onPress) => (
      <Ellipse
        cx={252} cy={315} rx={134} ry={90}
        fill={fill} fillOpacity={0.82} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Ellipse cx={252} cy={315} rx={144} ry={100} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'legs', label: 'Hooves', icon: 'shoe-print', emoji: '🦶',
    element: (fill, onPress) => (
      <Rect
        x={155} y={386} width={180} height={60}
        fill={fill} fillOpacity={0.85} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Rect x={140} y={378} width={200} height={75} fill="transparent" onPress={onPress} />
    ),
  },
  {
    id: 'tail', label: 'Tail', icon: 'waves', emoji: '🌈',
    element: (fill, onPress) => (
      <Ellipse
        cx={352} cy={356} rx={66} ry={100}
        fill={fill} fillOpacity={0.82} onPress={onPress}
      />
    ),
    hitTarget: (onPress) => (
      <Ellipse cx={352} cy={356} rx={78} ry={112} fill="transparent" onPress={onPress} />
    ),
  },
];

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function ColorScreen() {
  const colors = useColors();
  const { paintLocation, activePaintColor, setActivePaintColor, setPaintLocation } = useUnicorn();

  const topPad    = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const [paintedZones, setPaintedZones] = useState<Record<string, string>>({});
  const [canvasWidth,  setCanvasWidth]  = useState(340);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const currentLocation = LOCATIONS.find((l) => l.id === paintLocation) ?? LOCATIONS[0];

  const handleZoneTap = (zoneId: string) => {
    setPaintedZones((prev) => ({ ...prev, [zoneId]: activePaintColor }));
    setSelectedZoneId(zoneId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClear = () => {
    setPaintedZones({});
    setSelectedZoneId(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.deepPurple }]}>Coloring Page</Text>
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [styles.clearBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="refresh" size={16} color={colors.textMuted} />
            <Text style={[styles.clearText, { color: colors.textMuted }]}>Clear</Text>
          </Pressable>
        </View>

        {/* ── Location selector ────────────────────────── */}
        <View style={styles.selectorRow}>
          <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>Location</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
            {LOCATIONS.map((loc) => (
              <Pressable
                key={loc.id}
                onPress={() => { setPaintLocation(loc.id as any); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.locationChip, { borderColor: paintLocation === loc.id ? colors.midPurple : colors.border }]}
              >
                <LinearGradient colors={loc.gradient} style={styles.locationGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                <Text style={[styles.locationText, { color: paintLocation === loc.id ? colors.midPurple : colors.textMuted }]}>
                  {loc.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Color palette ────────────────────────────── */}
        <View style={styles.paletteRow}>
          {colors.palette.map((color) => (
            <Pressable
              key={color}
              onPress={() => { setActivePaintColor(color); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[
                styles.paletteSwatch,
                { backgroundColor: color },
                activePaintColor === color && styles.swatchActive,
              ]}
            />
          ))}
        </View>

        {/* Active colour hint */}
        <Text style={[styles.colorHint, { color: colors.textMuted }]}>
          Pick a colour then tap any zone on the unicorn
        </Text>
        <View style={[styles.activeColorDot, { backgroundColor: activePaintColor }]} />

        {/* ── Coloring canvas ──────────────────────────── */}
        <LinearGradient
          colors={currentLocation.gradient}
          style={[styles.canvas, { borderColor: colors.border }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          onLayout={(e) => setCanvasWidth(Math.round(e.nativeEvent.layout.width) - 2)}
        >
          {/* Stars for night locations */}
          {(paintLocation === 'starry sky' || paintLocation === 'crystal cave') && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {[...Array(18)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.bgStar,
                    {
                      left: `${(i * 41 + 5) % 95}%` as any,
                      top:  `${(i * 57 + 8) % 85}%` as any,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/*
            SVG layout:
              Layer 1 – coloured zone fills (background)
              Layer 2 – transparent line-art PNG (lines always on top)
              Layer 3 – transparent hit-targets (receives taps)

            viewBox 400×500 matches the 1122×1402 image (portrait).
          */}
          <Svg
            viewBox="0 0 400 500"
            width={canvasWidth}
            height={canvasWidth * (500 / 400)}
          >
            {/* ── Layer 1: Coloured zones ─────────────── */}
            {PAINT_ZONES.map((zone) => {
              const c = paintedZones[zone.id];
              if (!c) return null;
              return (
                <React.Fragment key={zone.id}>
                  {zone.element(c, () => handleZoneTap(zone.id))}
                </React.Fragment>
              );
            })}

            {/* ── Layer 2: Transparent line-art ──────── */}
            <SvgImage
              href={LINES_IMG}
              x={0}
              y={0}
              width={400}
              height={500}
              preserveAspectRatio="xMidYMid meet"
            />

            {/* ── Layer 3: Transparent tap targets ───── */}
            {PAINT_ZONES.map((zone) => (
              <React.Fragment key={`hit-${zone.id}`}>
                {zone.hitTarget(() => handleZoneTap(zone.id))}
              </React.Fragment>
            ))}
          </Svg>
        </LinearGradient>

        <Text style={[styles.instructionText, { color: colors.textMuted }]}>
          Tap any zone to paint it with the selected colour
        </Text>

        {/* ── Zone quick-pick tray ─────────────────────── */}
        <View style={styles.trayLabel}>
          <MaterialCommunityIcons name="palette" size={14} color={colors.midPurple} />
          <Text style={[styles.trayLabelText, { color: colors.midPurple }]}>Zones</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.zoneTray}>
            {PAINT_ZONES.map((zone) => {
              const painted = paintedZones[zone.id];
              const isSelected = selectedZoneId === zone.id;
              return (
                <Pressable
                  key={zone.id}
                  onPress={() => { handleZoneTap(zone.id); }}
                  style={({ pressed }) => [
                    styles.zoneChip,
                    {
                      backgroundColor: isSelected ? colors.midPurple + '22' : colors.card,
                      borderColor: isSelected ? colors.midPurple : painted ? painted : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {painted && (
                    <View style={[styles.zoneChipDot, { backgroundColor: painted }]} />
                  )}
                  <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
                  <Text style={[styles.zoneChipLabel, { color: colors.textDark }]} numberOfLines={1}>
                    {zone.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

      </ScrollView>
    </View>
  );
}

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 12,
  },
  title:    { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    padding: 8, borderRadius: 12, borderWidth: 1,
  },
  clearText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  selectorRow:    { marginBottom: 12 },
  selectorLabel:  {
    fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  locationScroll: { flexGrow: 0 },
  locationChip:   {
    alignItems: 'center', marginRight: 10,
    borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', width: 100,
  },
  locationGradient: { width: '100%', height: 50 },
  locationText: {
    fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold',
    textAlign: 'center', paddingVertical: 6, paddingHorizontal: 4,
  },

  paletteRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 8 },
  paletteSwatch: { width: 36, height: 36, borderRadius: 18 },
  swatchActive:  { borderWidth: 3, borderColor: '#26215C', transform: [{ scale: 1.15 }] },

  colorHint:     { fontSize: 12, textAlign: 'center', fontFamily: 'Inter_400Regular', marginBottom: 4 },
  activeColorDot: { width: 20, height: 20, borderRadius: 10, alignSelf: 'center', marginBottom: 12 },

  canvas: {
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  bgStar: {
    position: 'absolute', width: 3, height: 3,
    borderRadius: 1.5, backgroundColor: '#ffffff80',
  },

  instructionText: {
    fontSize: 13, textAlign: 'center',
    fontFamily: 'Inter_400Regular', marginBottom: 12,
  },

  trayLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginBottom: 8,
  },
  trayLabelText: {
    fontSize: 12, fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  zoneTray: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  zoneChip: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 14, borderWidth: 1.5,
    minWidth: 72, gap: 2,
    flexDirection: 'row',
  },
  zoneChipDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  zoneEmoji:   { fontSize: 14 },
  zoneChipLabel: {
    fontSize: 11, fontFamily: 'Inter_500Medium',
  },
});
