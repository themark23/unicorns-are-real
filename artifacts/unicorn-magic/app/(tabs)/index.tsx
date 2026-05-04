import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useUnicorn } from '@/context/UnicornContext';
import { useColors } from '@/hooks/useColors';

const UNICORN_IMG = require('../../assets/unicorn.png');

// ─── Accessory types ─────────────────────────────────────────────────────────
// 'cutie-mark' → flat stamp rendered directly on the unicorn (no bubble)
// 'accessory'  → worn item (crown, glasses, etc.) rendered as free-floating icon

type AccessoryType = 'cutie-mark' | 'accessory';

interface AccessoryItem {
  id: string;
  label: string;
  iconName: string;
  iconSet: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  bgColor: string;
  accType: AccessoryType;
}

const ACCESSORIES: AccessoryItem[] = [
  // ── Cutie marks ─────────────────────────────────────────────────────────
  { id: 'heart',     label: 'Heart',     iconName: 'heart',         iconSet: 'Ionicons',               color: '#fb7185', bgColor: '#fff0f2', accType: 'cutie-mark' },
  { id: 'star',      label: 'Star',      iconName: 'star',          iconSet: 'Ionicons',               color: '#ffd700', bgColor: '#fffbdd', accType: 'cutie-mark' },
  { id: 'leaf',      label: 'Clover',    iconName: 'leaf',          iconSet: 'Ionicons',               color: '#4ade80', bgColor: '#f0fff4', accType: 'cutie-mark' },
  { id: 'butterfly', label: 'Butterfly', iconName: 'butterfly',     iconSet: 'MaterialCommunityIcons', color: '#c084fc', bgColor: '#f8f5ff', accType: 'cutie-mark' },
  { id: 'gem',       label: 'Gem',       iconName: 'diamond-stone', iconSet: 'MaterialCommunityIcons', color: '#5eead4', bgColor: '#f0fffe', accType: 'cutie-mark' },
  { id: 'note',      label: 'Music',     iconName: 'musical-note',  iconSet: 'Ionicons',               color: '#a78bfa', bgColor: '#f5f0ff', accType: 'cutie-mark' },
  // ── Wearable accessories ─────────────────────────────────────────────────
  { id: 'crown',     label: 'Crown',     iconName: 'crown',         iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd', accType: 'accessory' },
  { id: 'tiara',     label: 'Tiara',     iconName: 'crown-outline', iconSet: 'MaterialCommunityIcons', color: '#ff9de2', bgColor: '#fff0f8', accType: 'accessory' },
  { id: 'glasses',   label: 'Glasses',   iconName: 'glasses',       iconSet: 'MaterialCommunityIcons', color: '#93c5fd', bgColor: '#f0f4ff', accType: 'accessory' },
  { id: 'bow',       label: 'Bow Tie',   iconName: 'bow-tie',       iconSet: 'MaterialCommunityIcons', color: '#c084fc', bgColor: '#f5f0ff', accType: 'accessory' },
  { id: 'wand',      label: 'Wand',      iconName: 'auto-fix',      iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd', accType: 'accessory' },
];

// Container size is the same for both types (determines touch target + positioning)
const ICON_SIZE = 62;
const ICON_HALF = ICON_SIZE / 2;

// Sizes of the rendered icon inside the container
const CUTIE_ICON_SIZE = 42;
const WEAR_ICON_SIZE  = 54;

// Sparkle overlay config
const SVG_W     = 295;
const SVG_H     = 250;
const SVG_PAD_V = 16;

interface SparkleSpec {
  pctX: number; pctY: number;
  size: number; color: string;
  delay: number; speed: number;
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

function AnimatedSparkle({ pctX, pctY, size, color, delay, speed, svgLeft, svgTop }: SparkleSpec & { svgLeft: number; svgTop: number }) {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const rotateAnim  = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | undefined;

    const spinLoop = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: speed, easing: Easing.linear, useNativeDriver: true })
    );
    spinLoop.start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 160, friction: 5, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start(() => {
        pulseLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.45, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.78, duration: 600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        );
        pulseLoop.start();
      });
    }, delay);

    return () => { clearTimeout(t); spinLoop.stop(); pulseLoop?.stop(); };
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

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

function SparkleOverlay({ svgLeft, svgTop }: { svgLeft: number; svgTop: number }) {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(containerOpacity, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: containerOpacity }]}>
      {SPARKLE_SPECS.map((sp, i) => (
        <AnimatedSparkle key={i} {...sp} svgLeft={svgLeft} svgTop={svgTop} />
      ))}
    </Animated.View>
  );
}

// ─── DraggableAccessory ───────────────────────────────────────────────────────

interface DragProps {
  acc: AccessoryItem;
  initialX: number;
  initialY: number;
  areaWidth: number;
  areaHeight: number;
  onPositionChange: (x: number, y: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

function DraggableAccessory({ acc, initialX, initialY, areaWidth, areaHeight, onPositionChange, onDragStart, onDragEnd }: DragProps) {
  const pan       = useRef(new Animated.ValueXY({ x: initialX - ICON_HALF, y: initialY - ICON_HALF })).current;
  const scale     = useRef(new Animated.Value(0)).current;
  const dragOrigin = useRef({ x: 0, y: 0 });
  const currentPan = useRef({ x: initialX - ICON_HALF, y: initialY - ICON_HALF });

  useEffect(() => {
    const id = pan.addListener((v) => { currentPan.current = v; });
    return () => pan.removeListener(id);
  }, []);

  // Pop-in on mount
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 170, friction: 7, useNativeDriver: true }).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: () => {
        dragOrigin.current = { ...currentPan.current };
        pan.setOffset(currentPan.current);
        pan.setValue({ x: 0, y: 0 });
        Animated.spring(scale, { toValue: 1.25, useNativeDriver: true }).start();
        onDragStart();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
        const rawX = dragOrigin.current.x + g.dx + ICON_HALF;
        const rawY = dragOrigin.current.y + g.dy + ICON_HALF;
        const cx = Math.max(ICON_HALF, Math.min(areaWidth  - ICON_HALF, rawX));
        const cy = Math.max(ICON_HALF, Math.min(areaHeight - ICON_HALF, rawY));
        pan.setValue({ x: cx - ICON_HALF, y: cy - ICON_HALF });
        onPositionChange(cx, cy);
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

  const Icon = acc.iconSet === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
  const isMark = acc.accType === 'cutie-mark';

  return (
    <Animated.View
      style={[
        styles.draggableOuter,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }] },
      ]}
      {...panResponder.panHandlers}
    >
      {isMark ? (
        // ── Cutie mark: a flat stamp with a subtle halo ──
        <View style={styles.cutieMarkWrap}>
          {/* Soft white glow behind stamp (integrates with body colour) */}
          <View style={[styles.cutieMarkHalo, { backgroundColor: 'white', opacity: 0.55 }]} />
          {/* Coloured tint ring */}
          <View style={[styles.cutieMarkHalo, { backgroundColor: acc.color, opacity: 0.18 }]} />
          <Icon name={acc.iconName as any} size={CUTIE_ICON_SIZE} color={acc.color} />
        </View>
      ) : (
        // ── Wearable: free-floating icon, no container ──
        <View style={styles.wearableWrap}>
          <Icon
            name={acc.iconName as any}
            size={WEAR_ICON_SIZE}
            color={acc.color}
            style={styles.wearableIcon}
          />
        </View>
      )}
    </Animated.View>
  );
}

// ─── DressScreen ──────────────────────────────────────────────────────────────

export default function DressScreen() {
  const colors = useColors();
  const { sparkles, toggleSparkles } = useUnicorn();

  const [placedAccessories, setPlacedAccessories] = useState<Record<string, { x: number; y: number }>>({});
  const [isDragging, setIsDragging]   = useState(false);
  const [unicornLayout, setUnicornLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const { width: screenWidth } = useWindowDimensions();
  const topPad    = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;
  // Image fills the scroll content width (screen − 16px padding × 2 − 2px border)
  const imgWidth  = screenWidth - 34;
  const imgHeight = imgWidth * (1402 / 1122);

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
      // Default placement: cutie marks land on the flank, accessories near the head
      const cx = acc.accType === 'cutie-mark'
        ? w * 0.42 + (Math.random() - 0.5) * 60  // mid-body area
        : w * 0.72 + (Math.random() - 0.5) * 30; // head/neck area
      const cy = acc.accType === 'cutie-mark'
        ? h * 0.58 + (Math.random() - 0.5) * 40
        : h * 0.32 + (Math.random() - 0.5) * 30;
      return { ...prev, [acc.id]: { x: cx, y: cy } };
    });
  };

  const handleReset = () => {
    setPlacedAccessories({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const svgLeft = unicornLayout.width > 0 ? (unicornLayout.width - SVG_W) / 2 : 0;
  const svgTop  = SVG_PAD_V;
  const hasAccessories = Object.keys(placedAccessories).length > 0;

  // Split accessories for the tray section labels
  const cutieMarks  = ACCESSORIES.filter((a) => a.accType === 'cutie-mark');
  const wearables   = ACCESSORIES.filter((a) => a.accType === 'accessory');

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
              onValueChange={() => { toggleSparkles(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ false: colors.border, true: colors.midPurple }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ── Unicorn canvas ─────────────────────────── */}
        <View
          onLayout={(e) => setUnicornLayout(e.nativeEvent.layout)}
          style={[styles.unicornArea, { backgroundColor: '#ffffff', borderColor: colors.border }]}
        >
          <Image
            source={UNICORN_IMG}
            style={{ width: imgWidth, height: imgHeight }}
            resizeMode="cover"
          />

          {sparkles && unicornLayout.width > 0 && (
            <SparkleOverlay svgLeft={svgLeft} svgTop={svgTop} />
          )}

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
                onPositionChange={(x, y) => setPlacedAccessories((p) => ({ ...p, [id]: { x, y } }))}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              />
            );
          })}
        </View>

        {hasAccessories && (
          <Text style={[styles.dragHint, { color: colors.textMuted }]}>
            Drag accessories to move them
          </Text>
        )}

        {/* ── Cutie marks tray ───────────────────────── */}
        <View style={styles.traySection}>
          <View style={styles.trayHeader}>
            <MaterialCommunityIcons name="star-four-points" size={14} color={colors.midPurple} />
            <Text style={[styles.trayLabel, { color: colors.midPurple }]}>Cutie Marks</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={!isDragging}>
            <View style={styles.chipRow}>
              {cutieMarks.map((acc) => {
                const isPlaced = !!placedAccessories[acc.id];
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => handleAccessoryTap(acc)}
                    style={({ pressed }) => [
                      styles.chip,
                      styles.cutieChip,
                      {
                        backgroundColor: isPlaced ? acc.bgColor : colors.card,
                        borderColor:     isPlaced ? acc.color  : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    {acc.iconSet === 'Ionicons'
                      ? <Ionicons name={acc.iconName as any} size={26} color={acc.color} />
                      : <MaterialCommunityIcons name={acc.iconName as any} size={26} color={acc.color} />
                    }
                    <Text style={[styles.chipLabel, { color: colors.textDark }]}>{acc.label}</Text>
                    {isPlaced && <View style={[styles.chipBadge, { backgroundColor: acc.color }]}><Ionicons name="checkmark" size={9} color="#fff" /></View>}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── Wearable accessories tray ──────────────── */}
        <View style={styles.traySection}>
          <View style={styles.trayHeader}>
            <MaterialCommunityIcons name="crown" size={14} color={colors.midPurple} />
            <Text style={[styles.trayLabel, { color: colors.midPurple }]}>Accessories</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={!isDragging}>
            <View style={styles.chipRow}>
              {wearables.map((acc) => {
                const isPlaced = !!placedAccessories[acc.id];
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => handleAccessoryTap(acc)}
                    style={({ pressed }) => [
                      styles.chip,
                      styles.wearChip,
                      {
                        backgroundColor: isPlaced ? acc.bgColor : colors.card,
                        borderColor:     isPlaced ? acc.color  : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    {acc.iconSet === 'Ionicons'
                      ? <Ionicons name={acc.iconName as any} size={28} color={acc.color} />
                      : <MaterialCommunityIcons name={acc.iconName as any} size={28} color={acc.color} />
                    }
                    <Text style={[styles.chipLabel, { color: colors.textDark }]}>{acc.label}</Text>
                    {isPlaced && <View style={[styles.chipBadge, { backgroundColor: acc.color }]}><Ionicons name="checkmark" size={9} color="#fff" /></View>}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── Reset ─────────────────────────────────── */}
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [styles.resetBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="refresh" size={16} color={colors.textMuted} />
          <Text style={[styles.resetText, { color: colors.textMuted }]}>Reset Everything</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16, paddingBottom: 8,
  },
  title:         { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  sparklesRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sparklesLabel: { fontSize: 13, fontWeight: '500', fontFamily: 'Inter_500Medium' },

  unicornArea: {
    borderRadius: 24, borderWidth: 1,
    marginBottom: 6,
    overflow: 'hidden',
  },

  dragHint: {
    textAlign: 'center', fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8, marginTop: 2,
    fontStyle: 'italic',
  },

  // ── Tray ────────────────────────────────────────────
  traySection: { marginBottom: 14 },
  trayHeader:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  trayLabel:   { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow:     { flexDirection: 'row', gap: 10 },

  chip: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, position: 'relative',
  },
  cutieChip: {
    width: 72, paddingVertical: 10,
    borderRadius: 18,
  },
  wearChip: {
    width: 76, paddingVertical: 11,
    borderRadius: 18,
  },
  chipLabel: { fontSize: 10, marginTop: 4, fontWeight: '500', fontFamily: 'Inter_500Medium' },
  chipBadge: {
    position: 'absolute', top: -5, right: -5,
    width: 17, height: 17, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── On-canvas rendering ─────────────────────────────
  draggableOuter: {
    position: 'absolute', left: 0, top: 0,
    zIndex: 20,
    width: ICON_SIZE, height: ICON_SIZE,
  },

  // Cutie mark: flat stamp
  cutieMarkWrap: {
    width: ICON_SIZE, height: ICON_SIZE,
    alignItems: 'center', justifyContent: 'center',
  },
  cutieMarkHalo: {
    position: 'absolute',
    width: ICON_SIZE - 8,
    height: ICON_SIZE - 8,
    borderRadius: (ICON_SIZE - 8) / 2,
  },

  // Wearable: free-floating icon with drop shadow
  wearableWrap: {
    width: ICON_SIZE, height: ICON_SIZE,
    alignItems: 'center', justifyContent: 'center',
  },
  wearableIcon: {
    textShadow: '0px 3px 5px rgba(0,0,0,0.22)',
  } as any,

  resetBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6,
    padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 4,
  },
  resetText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
