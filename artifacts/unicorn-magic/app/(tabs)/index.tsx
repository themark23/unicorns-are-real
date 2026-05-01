import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UnicornSVG from '@/components/UnicornSVG';
import { useUnicorn } from '@/context/UnicornContext';
import { useColors } from '@/hooks/useColors';

type Zone = 'body' | 'mane' | 'horn' | 'tail';

const ZONES: { id: Zone; label: string }[] = [
  { id: 'body', label: 'Body' },
  { id: 'mane', label: 'Mane' },
  { id: 'horn', label: 'Horn' },
  { id: 'tail', label: 'Tail' },
];

interface AccessoryItem {
  id: string;
  label: string;
  iconName: string;
  iconSet: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  bgColor: string;
}

const ACCESSORIES: AccessoryItem[] = [
  { id: 'crown-gold',   label: 'Crown',     iconName: 'crown',          iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd' },
  { id: 'crown-pink',   label: 'Tiara',     iconName: 'crown-outline',  iconSet: 'MaterialCommunityIcons', color: '#ff9de2', bgColor: '#fff0f8' },
  { id: 'flower',       label: 'Flowers',   iconName: 'flower',         iconSet: 'MaterialCommunityIcons', color: '#86efac', bgColor: '#f0fff4' },
  { id: 'necklace',     label: 'Necklace',  iconName: 'heart',          iconSet: 'Ionicons',               color: '#fb7185', bgColor: '#fff0f2' },
  { id: 'star-badge',   label: 'Star',      iconName: 'star',           iconSet: 'Ionicons',               color: '#ffd700', bgColor: '#fffbdd' },
  { id: 'bow',          label: 'Bow Tie',   iconName: 'bow-tie',        iconSet: 'MaterialCommunityIcons', color: '#c084fc', bgColor: '#f5f0ff' },
  { id: 'glasses',      label: 'Glasses',   iconName: 'glasses',        iconSet: 'MaterialCommunityIcons', color: '#93c5fd', bgColor: '#f0f4ff' },
  { id: 'gem',          label: 'Gem',       iconName: 'diamond-stone',  iconSet: 'MaterialCommunityIcons', color: '#5eead4', bgColor: '#f0fffe' },
  { id: 'butterfly',    label: 'Wings',     iconName: 'butterfly',      iconSet: 'MaterialCommunityIcons', color: '#ddd6fe', bgColor: '#f8f5ff' },
  { id: 'wand',         label: 'Wand',      iconName: 'auto-fix',       iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd' },
];

// SVG rendered dimensions (must match UnicornSVG component)
const SVG_W = 295;
const SVG_H = 250;
const SVG_PAD_V = 16; // unicornArea paddingVertical

// Accessory icon dimensions
const ICON_SIZE = 52;
const ICON_HALF = ICON_SIZE / 2;

// Sparkle positions as fractions of the rendered SVG (0–1)
interface SparkleSpec {
  pctX: number;
  pctY: number;
  size: number;
  color: string;
  delay: number;
  speed: number; // ms for one full rotation
}

const SPARKLE_SPECS: SparkleSpec[] = [
  { pctX: 0.12, pctY: 0.25, size: 15, color: '#ffd700', delay: 0,   speed: 2200 },
  { pctX: 0.80, pctY: 0.11, size: 13, color: '#ffd700', delay: 110, speed: 2800 },
  { pctX: 0.06, pctY: 0.62, size: 11, color: '#ff9de2', delay: 210, speed: 2000 },
  { pctX: 0.97, pctY: 0.53, size: 13, color: '#c084fc', delay: 55,  speed: 3200 },
  { pctX: 0.24, pctY: 0.15, size: 9,  color: '#ffd700', delay: 160, speed: 2500 },
  { pctX: 0.74, pctY: 0.85, size: 11, color: '#ffd700', delay: 260, speed: 1900 },
  { pctX: 0.41, pctY: 0.12, size: 10, color: '#93c5fd', delay: 85,  speed: 2700 },
  { pctX: 0.96, pctY: 0.26, size: 9,  color: '#ff9de2', delay: 190, speed: 3000 },
  { pctX: 0.47, pctY: 0.84, size: 8,  color: '#c084fc', delay: 130, speed: 2400 },
  { pctX: 0.16, pctY: 0.75, size: 8,  color: '#ffd700', delay: 230, speed: 2600 },
];

// ─── AnimatedSparkle ─────────────────────────────────────────────────────────

interface AnimatedSparkleProps extends SparkleSpec {
  svgLeft: number;
  svgTop: number;
}

function AnimatedSparkle({ pctX, pctY, size, color, delay, speed, svgLeft, svgTop }: AnimatedSparkleProps) {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const rotateAnim  = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | undefined;

    const spinLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    const entranceTimer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 160,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => {
        pulseLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.45,
              duration: 550 + Math.random() * 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.78,
              duration: 550 + Math.random() * 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        pulseLoop.start();
      });
    }, delay);

    return () => {
      clearTimeout(entranceTimer);
      spinLoop.stop();
      pulseLoop?.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: svgLeft + pctX * SVG_W - size / 2,
        top:  svgTop  + pctY * SVG_H - size / 2,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { rotate }],
      }}
    >
      <MaterialCommunityIcons name="star-four-points" size={size} color={color} />
    </Animated.View>
  );
}

// ─── SparkleOverlay ──────────────────────────────────────────────────────────

function SparkleOverlay({ svgLeft, svgTop }: { svgLeft: number; svgTop: number }) {
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: containerOpacity }]}
    >
      {SPARKLE_SPECS.map((sp, i) => (
        <AnimatedSparkle key={i} {...sp} svgLeft={svgLeft} svgTop={svgTop} />
      ))}
    </Animated.View>
  );
}

// ─── DraggableAccessory ───────────────────────────────────────────────────────

interface DragProps {
  acc: AccessoryItem;
  initialX: number; // center X within unicornArea
  initialY: number; // center Y within unicornArea
  areaWidth: number;
  areaHeight: number;
  onPositionChange: (x: number, y: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function DraggableAccessory({
  acc,
  initialX,
  initialY,
  areaWidth,
  areaHeight,
  onPositionChange,
  onDragStart,
  onDragEnd,
}: DragProps) {
  // Animated.ValueXY starts at top-left of icon (center - ICON_HALF)
  const pan = useRef(
    new Animated.ValueXY({ x: initialX - ICON_HALF, y: initialY - ICON_HALF })
  ).current;
  const scale = useRef(new Animated.Value(0)).current;

  // Keep a ref to the latest pan value so callbacks can read it
  const currentPan = useRef({ x: initialX - ICON_HALF, y: initialY - ICON_HALF });
  const dragOrigin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const listenerId = pan.addListener((v) => {
      currentPan.current = v;
    });
    return () => pan.removeListener(listenerId);
  }, []);

  // Pop-in on mount
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 170,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,

      onPanResponderGrant: () => {
        // Capture where we started the drag
        dragOrigin.current = { ...currentPan.current };
        pan.setOffset(currentPan.current);
        pan.setValue({ x: 0, y: 0 });
        Animated.spring(scale, { toValue: 1.38, useNativeDriver: true }).start();
        onDragStart();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

        // Clamp final center position to stay inside the area
        const rawX = dragOrigin.current.x + g.dx + ICON_HALF;
        const rawY = dragOrigin.current.y + g.dy + ICON_HALF;
        const clampedX = Math.max(ICON_HALF, Math.min(areaWidth  - ICON_HALF, rawX));
        const clampedY = Math.max(ICON_HALF, Math.min(areaHeight - ICON_HALF, rawY));

        pan.setValue({ x: clampedX - ICON_HALF, y: clampedY - ICON_HALF });
        onPositionChange(clampedX, clampedY);
        onDragEnd();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },

      onPanResponderTerminate: () => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        onDragEnd();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.draggableAccessory,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.accessoryBubble, { backgroundColor: acc.bgColor, borderColor: acc.color }]}>
        {acc.iconSet === 'Ionicons' ? (
          <Ionicons name={acc.iconName as any} size={26} color={acc.color} />
        ) : (
          <MaterialCommunityIcons name={acc.iconName as any} size={26} color={acc.color} />
        )}
      </View>
    </Animated.View>
  );
}

// ─── DressScreen ──────────────────────────────────────────────────────────────

export default function DressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    dressColors,
    sparkles,
    selectedZone,
    setDressColor,
    toggleSparkles,
    setSelectedZone,
    resetDressColors,
  } = useUnicorn();

  const [placedAccessories, setPlacedAccessories] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [isDragging, setIsDragging] = useState(false);
  const [unicornLayout, setUnicornLayout] = useState({
    x: 0, y: 0, width: 0, height: 0,
  });

  const topPad    = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const handleZonePress = (zone: Zone) => {
    setSelectedZone(zone);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleColorPress = (color: string) => {
    if (selectedZone) {
      setDressColor(selectedZone, color);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAccessoryTap = (acc: AccessoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlacedAccessories((prev) => {
      if (prev[acc.id]) {
        const next = { ...prev };
        delete next[acc.id];
        return next;
      }
      const w = unicornLayout.width  || SVG_W;
      const h = unicornLayout.height || SVG_H + SVG_PAD_V * 2;
      const cx = w / 2 + (Math.random() - 0.5) * 100;
      const cy = h / 2 + (Math.random() - 0.5) * 70;
      return { ...prev, [acc.id]: { x: cx, y: cy } };
    });
  };

  const handleReset = () => {
    resetDressColors();
    setPlacedAccessories({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // SVG offset within the unicornArea (SVG is centered horizontally, padded vertically)
  const svgLeft = unicornLayout.width > 0 ? (unicornLayout.width - SVG_W) / 2 : 0;
  const svgTop  = SVG_PAD_V;

  const hasAccessories = Object.keys(placedAccessories).length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isDragging}
      >
        {/* ── Header ─────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.deepPurple }]}>Dress Your Unicorn</Text>
          <View style={styles.sparklesRow}>
            <MaterialCommunityIcons name="star-four-points" size={16} color={colors.midPurple} />
            <Text style={[styles.sparklesLabel, { color: colors.midPurple }]}>Sparkles</Text>
            <Switch
              value={sparkles}
              onValueChange={() => {
                toggleSparkles();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: colors.border, true: colors.midPurple }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ── Unicorn canvas ─────────────────────────── */}
        <View
          onLayout={(e) => setUnicornLayout(e.nativeEvent.layout)}
          style={[styles.unicornArea, { backgroundColor: colors.lavender, borderColor: colors.border }]}
        >
          {/* Unicorn SVG — drawn first (back layer) */}
          <UnicornSVG
            colors={dressColors}
            mode="dress"
            sparkles={false}
            onZonePress={handleZonePress}
          />

          {/* Animated sparkle overlay */}
          {sparkles && unicornLayout.width > 0 && (
            <SparkleOverlay svgLeft={svgLeft} svgTop={svgTop} />
          )}

          {/* Draggable accessories (front layer) */}
          {Object.entries(placedAccessories).map(([id, pos]) => {
            const acc = ACCESSORIES.find((a) => a.id === id);
            if (!acc) return null;
            return (
              <DraggableAccessory
                key={id}
                acc={acc}
                initialX={pos.x}
                initialY={pos.y}
                areaWidth={unicornLayout.width}
                areaHeight={unicornLayout.height}
                onPositionChange={(x, y) =>
                  setPlacedAccessories((prev) => ({ ...prev, [id]: { x, y } }))
                }
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              />
            );
          })}
        </View>

        {hasAccessories && (
          <Text style={[styles.dragHint, { color: colors.textMuted }]}>
            Drag accessories anywhere on your unicorn!
          </Text>
        )}

        {/* ── Zone selector pills ────────────────────── */}
        <View style={styles.zonePills}>
          {ZONES.map((zone) => (
            <Pressable
              key={zone.id}
              onPress={() => handleZonePress(zone.id)}
              style={({ pressed }) => [
                styles.zonePill,
                {
                  backgroundColor: selectedZone === zone.id ? colors.midPurple : colors.card,
                  borderColor:     selectedZone === zone.id ? colors.midPurple : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={[styles.zoneSwatch, { backgroundColor: dressColors[zone.id] }]} />
              <Text
                style={[
                  styles.zonePillText,
                  { color: selectedZone === zone.id ? '#fff' : colors.deepPurple },
                ]}
              >
                {zone.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Color palette ──────────────────────────── */}
        <View style={[styles.paletteSection, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            {selectedZone ? `Tap a color for the ${selectedZone}` : 'Select a zone above'}
          </Text>
          <View style={styles.palette}>
            {colors.palette.map((color) => (
              <Pressable
                key={color}
                onPress={() => handleColorPress(color)}
                style={({ pressed }) => [
                  styles.swatch,
                  { backgroundColor: color, opacity: pressed ? 0.8 : 1 },
                  selectedZone && dressColors[selectedZone] === color && styles.swatchSelected,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── Accessories tray ───────────────────────── */}
        <View style={styles.accessoriesSection}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Accessories — tap to add, drag to move
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.accessoryScroll}
            scrollEnabled={!isDragging}
          >
            {ACCESSORIES.map((acc) => {
              const isPlaced = !!placedAccessories[acc.id];
              return (
                <Pressable
                  key={acc.id}
                  onPress={() => handleAccessoryTap(acc)}
                  style={({ pressed }) => [
                    styles.accessoryChip,
                    {
                      backgroundColor: isPlaced ? acc.bgColor : colors.card,
                      borderColor:     isPlaced ? acc.color  : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  {acc.iconSet === 'Ionicons' ? (
                    <Ionicons name={acc.iconName as any} size={28} color={acc.color} />
                  ) : (
                    <MaterialCommunityIcons name={acc.iconName as any} size={28} color={acc.color} />
                  )}
                  <Text style={[styles.accessoryLabel, { color: colors.textDark }]}>{acc.label}</Text>
                  {isPlaced && (
                    <View style={[styles.placedBadge, { backgroundColor: acc.color }]}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Reset ─────────────────────────────────── */}
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.resetBtn,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="refresh" size={16} color={colors.textMuted} />
          <Text style={[styles.resetText, { color: colors.textMuted }]}>Reset Everything</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  scroll:     { paddingHorizontal: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 8,
  },
  title:         { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  sparklesRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sparklesLabel: { fontSize: 13, fontWeight: '500', fontFamily: 'Inter_500Medium' },

  unicornArea: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: SVG_PAD_V,
    marginBottom: 6,
    overflow: 'hidden',
    minHeight: SVG_H + SVG_PAD_V * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dragHint: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
    marginTop: 2,
    fontStyle: 'italic',
  },

  zonePills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'center',
    marginTop: 8,
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  zoneSwatch:    { width: 12, height: 12, borderRadius: 6 },
  zonePillText:  { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  paletteSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  palette:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  swatch:        { width: 38, height: 38, borderRadius: 19 },
  swatchSelected: { borderWidth: 3, borderColor: '#26215C' },

  accessoriesSection: { marginBottom: 16 },
  accessoryScroll:    { marginTop: 8 },
  accessoryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    marginRight: 10,
    minWidth: 70,
    position: 'relative',
  },
  accessoryLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
  placedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Draggable accessory on the unicorn canvas
  draggableAccessory: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 20,
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  accessoryBubble: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_HALF,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#26215C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 6,
  },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  resetText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
