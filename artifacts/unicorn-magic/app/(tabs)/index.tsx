import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

// Transparent line-art — gradient glows through the unicorn body
const LINES_IMG = require('../../assets/unicorn_lines.png');

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
  { id: 'heart',      label: 'Heart',     iconName: 'heart',              iconSet: 'Ionicons',               color: '#fb7185', bgColor: '#fff0f2', accType: 'cutie-mark' },
  { id: 'star',       label: 'Star',      iconName: 'star',               iconSet: 'Ionicons',               color: '#ffd700', bgColor: '#fffbdd', accType: 'cutie-mark' },
  { id: 'leaf',       label: 'Clover',    iconName: 'leaf',               iconSet: 'Ionicons',               color: '#4ade80', bgColor: '#f0fff4', accType: 'cutie-mark' },
  { id: 'butterfly',  label: 'Butterfly', iconName: 'butterfly',          iconSet: 'MaterialCommunityIcons', color: '#c084fc', bgColor: '#f8f5ff', accType: 'cutie-mark' },
  { id: 'gem',        label: 'Gem',       iconName: 'diamond-stone',      iconSet: 'MaterialCommunityIcons', color: '#5eead4', bgColor: '#f0fffe', accType: 'cutie-mark' },
  { id: 'note',       label: 'Music',     iconName: 'musical-note',       iconSet: 'Ionicons',               color: '#a78bfa', bgColor: '#f5f0ff', accType: 'cutie-mark' },
  { id: 'moon',       label: 'Moon',      iconName: 'moon',               iconSet: 'Ionicons',               color: '#93c5fd', bgColor: '#eff6ff', accType: 'cutie-mark' },
  { id: 'sun',        label: 'Sun',       iconName: 'sunny',              iconSet: 'Ionicons',               color: '#fb923c', bgColor: '#fff7ed', accType: 'cutie-mark' },
  { id: 'flower',     label: 'Flower',    iconName: 'flower',             iconSet: 'MaterialCommunityIcons', color: '#f472b6', bgColor: '#fdf2f8', accType: 'cutie-mark' },
  { id: 'snowflake',  label: 'Ice',       iconName: 'snowflake',          iconSet: 'MaterialCommunityIcons', color: '#67e8f9', bgColor: '#ecfeff', accType: 'cutie-mark' },
  { id: 'rainbow',    label: 'Rainbow',   iconName: 'color-palette',      iconSet: 'Ionicons',               color: '#c084fc', bgColor: '#f5f0ff', accType: 'cutie-mark' },
  { id: 'bolt',       label: 'Bolt',      iconName: 'flash',              iconSet: 'Ionicons',               color: '#fbbf24', bgColor: '#fffbeb', accType: 'cutie-mark' },
  { id: 'paw',        label: 'Paw',       iconName: 'paw',                iconSet: 'MaterialCommunityIcons', color: '#fb923c', bgColor: '#fff7ed', accType: 'cutie-mark' },
  { id: 'cloud',      label: 'Cloud',     iconName: 'cloud',              iconSet: 'Ionicons',               color: '#93c5fd', bgColor: '#eff6ff', accType: 'cutie-mark' },
  { id: 'flame',      label: 'Flame',     iconName: 'flame',              iconSet: 'Ionicons',               color: '#f97316', bgColor: '#fff7ed', accType: 'cutie-mark' },
  { id: 'horseshoe',  label: 'Lucky',     iconName: 'horseshoe',          iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd', accType: 'cutie-mark' },
  { id: 'bee',        label: 'Bee',       iconName: 'bee',                iconSet: 'MaterialCommunityIcons', color: '#fbbf24', bgColor: '#fffbeb', accType: 'cutie-mark' },
  // ── Wearable accessories ─────────────────────────────────────────────────
  { id: 'crown',      label: 'Crown',     iconName: 'crown',              iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd', accType: 'accessory' },
  { id: 'tiara',      label: 'Tiara',     iconName: 'crown-outline',      iconSet: 'MaterialCommunityIcons', color: '#ff9de2', bgColor: '#fff0f8', accType: 'accessory' },
  { id: 'glasses',    label: 'Glasses',   iconName: 'glasses',            iconSet: 'MaterialCommunityIcons', color: '#93c5fd', bgColor: '#f0f4ff', accType: 'accessory' },
  { id: 'bow',        label: 'Bow Tie',   iconName: 'bow-tie',            iconSet: 'MaterialCommunityIcons', color: '#c084fc', bgColor: '#f5f0ff', accType: 'accessory' },
  { id: 'wand',       label: 'Wand',      iconName: 'auto-fix',           iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd', accType: 'accessory' },
  { id: 'tophat',     label: 'Top Hat',   iconName: 'hat-fedora',         iconSet: 'MaterialCommunityIcons', color: '#534AB7', bgColor: '#eef2ff', accType: 'accessory' },
  { id: 'ribbon',     label: 'Ribbon',    iconName: 'ribbon',             iconSet: 'Ionicons',               color: '#fb7185', bgColor: '#fff0f2', accType: 'accessory' },
  { id: 'balloon',    label: 'Balloon',   iconName: 'balloon',            iconSet: 'MaterialCommunityIcons', color: '#f472b6', bgColor: '#fdf2f8', accType: 'accessory' },
  { id: 'feather',    label: 'Wings',     iconName: 'feather',            iconSet: 'MaterialCommunityIcons', color: '#a78bfa', bgColor: '#f5f0ff', accType: 'accessory' },
  { id: 'party',      label: 'Party',     iconName: 'party-popper',       iconSet: 'MaterialCommunityIcons', color: '#fb923c', bgColor: '#fff7ed', accType: 'accessory' },
  { id: 'sunglasses', label: 'Sunnies',   iconName: 'sunglasses',         iconSet: 'MaterialCommunityIcons', color: '#fb7185', bgColor: '#fff0f2', accType: 'accessory' },
  { id: 'medal',      label: 'Medal',     iconName: 'medal',              iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd', accType: 'accessory' },
  { id: 'headphones', label: 'Headphones',iconName: 'headset',            iconSet: 'Ionicons',               color: '#a78bfa', bgColor: '#f5f0ff', accType: 'accessory' },
  { id: 'lollipop',   label: 'Candy',     iconName: 'candy',              iconSet: 'MaterialCommunityIcons', color: '#ff9de2', bgColor: '#fff0f8', accType: 'accessory' },
  { id: 'trophy',     label: 'Trophy',    iconName: 'trophy',             iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd', accType: 'accessory' },
];

// Container size is the same for both types (determines touch target + positioning)
const ICON_SIZE = 62;
const ICON_HALF = ICON_SIZE / 2;

// Sizes of the rendered icon inside the container
const CUTIE_ICON_SIZE = 42;
const WEAR_ICON_SIZE  = 54;

/* ─── Magic palettes ─────────────────────────────────────────────────────────
   The line art is transparent, so whatever sits behind it becomes the
   unicorn's colours. Letting the child pick that gradient is what makes this
   screen a "dress up" screen rather than a static picture. */
interface Palette {
  id: string;
  label: string;
  colors: [string, string, string, string];
}

const PALETTES: Palette[] = [
  { id: 'rainbow', label: 'Rainbow', colors: ['#FFD6EC', '#EDD6FF', '#D6EEFF', '#D6FFE8'] },
  { id: 'sunset',  label: 'Sunset',  colors: ['#FFE0C2', '#FFC2B4', '#FFAECF', '#E5B8FF'] },
  { id: 'ocean',   label: 'Ocean',   colors: ['#CDF3FF', '#B5E3FF', '#BCCCFF', '#D8C6FF'] },
  { id: 'candy',   label: 'Candy',   colors: ['#FFD9EC', '#FFC2DE', '#FFB3E6', '#F0C2FF'] },
  { id: 'meadow',  label: 'Meadow',  colors: ['#E4FFD6', '#C8F7D4', '#BEEBF0', '#DFF0C0'] },
  { id: 'galaxy',  label: 'Galaxy',  colors: ['#DCD3FF', '#C3B6FF', '#B9CBFF', '#EBC6FF'] },
  { id: 'sunny',   label: 'Sunny',   colors: ['#FFF4C2', '#FFE7A8', '#FFDCC2', '#FFF0D6'] },
];

const PALETTE_KEY = '@unicorn_palette';


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

function AnimatedSparkle({ pctX, pctY, size, color, delay, speed, areaW, areaH }: SparkleSpec & { areaW: number; areaH: number }) {
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
        left: pctX * areaW - size / 2,
        top:  pctY * areaH - size / 2,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }, { rotate }],
      }}
    >
      <MaterialCommunityIcons name="star-four-points" size={size} color={color} />
    </Animated.View>
  );
}

function SparkleOverlay({ areaW, areaH }: { areaW: number; areaH: number }) {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(containerOpacity, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: containerOpacity }]}>
      {SPARKLE_SPECS.map((sp, i) => (
        <AnimatedSparkle key={i} {...sp} areaW={areaW} areaH={areaH} />
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

const SAVE_KEY = '@unicorn_dress_save';

export default function DressScreen() {
  const colors = useColors();
  const { sparkles, toggleSparkles } = useUnicorn();

  const [placedAccessories, setPlacedAccessories] = useState<Record<string, { x: number; y: number }>>({});
  const [paletteId, setPaletteId]     = useState<string>(PALETTES[0].id);
  const [isDragging, setIsDragging]   = useState(false);
  const [unicornLayout, setUnicornLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { width: screenWidth } = useWindowDimensions();
  const topPad    = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;
  const imgWidth  = screenWidth - 34;
  const imgHeight = imgWidth * (1402 / 1122);

  /* Restore the last saved design. Without this the Save button writes a key
     that nothing ever reads, and the "Design Saved!" toast is a lie. */
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(SAVE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setPlacedAccessories(parsed);
      })
      .catch(() => {});
    AsyncStorage.getItem(PALETTE_KEY)
      .then((id) => {
        if (cancelled || !id) return;
        if (PALETTES.some((p) => p.id === id)) setPaletteId(id);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const choosePalette = useCallback((id: string) => {
    setPaletteId(id);
    AsyncStorage.setItem(PALETTE_KEY, id).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);


  const showToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(toastOpacity, { toValue: 0, duration: 340, useNativeDriver: true }),
    ]).start();
  }, [toastOpacity]);

  const handleSave = useCallback(async () => {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(placedAccessories));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast();
  }, [placedAccessories, showToast]);

  const handleAccessoryTap = (acc: AccessoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlacedAccessories((prev) => {
      if (prev[acc.id]) {
        const next = { ...prev };
        delete next[acc.id];
        return next;
      }
      const w = unicornLayout.width  || imgWidth;
      const h = unicornLayout.height || imgHeight;
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

  const handleReset = useCallback(async () => {
    setPlacedAccessories({});
    await AsyncStorage.removeItem(SAVE_KEY);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const hasAccessories = Object.keys(placedAccessories).length > 0;
  const activePalette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0];

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
          style={[styles.unicornArea, { borderColor: colors.border }]}
        >
          {/* The chosen palette glows through the transparent line art */}
          <LinearGradient
            colors={activePalette.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
          />
          {/* Transparent unicorn line art — gradient shows through body */}
          <Image
            source={LINES_IMG}
            style={{ width: imgWidth, height: imgHeight }}
            resizeMode="cover"
          />

          {sparkles && unicornLayout.width > 0 && (
            <SparkleOverlay areaW={unicornLayout.width} areaH={unicornLayout.height} />
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

        {/* ── Magic palette picker ───────────────────── */}
        <View style={styles.traySection}>
          <View style={styles.trayHeader}>
            <MaterialCommunityIcons name="palette" size={14} color={colors.midPurple} />
            <Text style={[styles.trayLabel, { color: colors.midPurple }]}>Magic Colors</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={!isDragging}>
            <View style={styles.chipRow}>
              {PALETTES.map((p) => {
                const active = p.id === paletteId;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => choosePalette(p.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.label} colors`}
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.paletteChip,
                      {
                        borderColor: active ? colors.midPurple : colors.border,
                        borderWidth: active ? 2.5 : 1.5,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={p.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.paletteSwatch}
                    />
                    <Text style={[styles.chipLabel, { color: colors.textDark }]}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

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
                    accessibilityRole="button"
                    accessibilityLabel={`${acc.label}${isPlaced ? ', placed, tap to remove' : ', tap to add'}`}
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
                    accessibilityRole="button"
                    accessibilityLabel={`${acc.label}${isPlaced ? ', placed, tap to remove' : ', tap to add'}`}
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

        {/* ── Save / Reset row ──────────────────────── */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save your unicorn design"
            style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.midPurple, opacity: pressed ? 0.8 : 1 }]}
          >
            <MaterialCommunityIcons name="content-save-outline" size={17} color="#fff" />
            <Text style={styles.saveBtnText}>Save Design</Text>
          </Pressable>

          <Pressable
            onPress={handleReset}
            accessibilityRole="button"
            accessibilityLabel="Remove all accessories and start over"
            style={({ pressed }) => [styles.resetBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="refresh" size={15} color={colors.textMuted} />
            <Text style={[styles.resetText, { color: colors.textMuted }]}>Reset</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Saved toast ────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[styles.toast, { opacity: toastOpacity }]}
      >
        <MaterialCommunityIcons name="star-four-points" size={16} color="#fff" />
        <Text style={styles.toastText}>Design Saved!</Text>
        <MaterialCommunityIcons name="star-four-points" size={16} color="#fff" />
      </Animated.View>
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

  paletteChip: {
    width: 76, paddingVertical: 9,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  paletteSwatch: {
    width: 46, height: 30, borderRadius: 9,
  },
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

  // ── Save / Reset row ────────────────────────────────
  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginTop: 4, marginBottom: 4,
  },

  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 7,
    paddingVertical: 13, borderRadius: 14,
  },
  saveBtnText: {
    color: '#fff', fontSize: 14,
    fontWeight: '700', fontFamily: 'Inter_700Bold',
  },

  resetBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
    paddingVertical: 13, paddingHorizontal: 16,
    borderRadius: 14, borderWidth: 1,
  },
  resetText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  // ── Saved toast ──────────────────────────────────────
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#534AB7',
    paddingHorizontal: 22, paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#534AB7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    color: '#fff', fontSize: 15,
    fontWeight: '700', fontFamily: 'Inter_700Bold',
  },
});
