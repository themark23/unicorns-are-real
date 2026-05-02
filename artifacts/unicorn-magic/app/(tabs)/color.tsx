import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useColors } from '@/hooks/useColors';

/* ─── Coloring pages ──────────────────────────────────────────────────────── */
const PAGES = [
  { src: require('../../assets/coloring_1.png'),  label: 'Rainbow Unicorn' },
  { src: require('../../assets/coloring_2.png'),  label: 'Starry Night' },
  { src: require('../../assets/coloring_3.png'),  label: 'Castle Dream' },
  { src: require('../../assets/coloring_4.png'),  label: 'Mountain Magic' },
  { src: require('../../assets/coloring_5.png'),  label: 'Enchanted Forest' },
  { src: require('../../assets/coloring_6.png'),  label: 'Butterfly Meadow' },
  { src: require('../../assets/coloring_7.png'),  label: 'Beach Gallop' },
  { src: require('../../assets/coloring_8.png'),  label: 'Rainbow Bridge' },
  { src: require('../../assets/coloring_9.png'),  label: 'Moonlit Rest' },
  { src: require('../../assets/coloring_10.png'), label: 'Rainbow Hearts' },
];

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const PALETTE = [
  '#ff6eb4', '#ff9de2', '#f472b6', '#c084fc', '#a78bfa', '#818cf8',
  '#60a5fa', '#7dd3fc', '#34d399', '#4ade80', '#fbbf24', '#fb923c',
  '#f87171', '#fb7185', '#fcd34d', '#6ee7b7', '#ffffff', '#26215C', '#000000',
];

/* ─── Brush sizes ─────────────────────────────────────────────────────────── */
const BRUSHES = [3, 6, 12, 20];

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Point = [number, number];
interface Stroke { color: string; size: number; points: Point[] }

/* ─── Helper: stroke → SVG d string ──────────────────────────────────────── */
function strokeToPath(stroke: Stroke): string {
  const { points } = stroke;
  if (points.length === 0) return '';
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M ${x} ${y} L ${x + 0.1} ${y + 0.1}`;
  }
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return d;
}

/* ─── ColoringScreen ──────────────────────────────────────────────────────── */
export default function ColoringScreen() {
  const colors   = useColors();
  const { width: screenWidth } = useWindowDimensions();

  const topPad    = Platform.OS === 'web' ? 67 : 0;

  /* canvas is square, 16px padding each side */
  const canvasSize = screenWidth - 32;

  /* ── State ────────────────────────────────── */
  const [pageIdx,   setPageIdx]   = useState(0);
  const [selColor,  setSelColor]  = useState(PALETTE[0]);
  const [brushIdx,  setBrushIdx]  = useState(1);

  /* allStrokes[pageIndex] = Stroke[] */
  const [allStrokes, setAllStrokes] = useState<Stroke[][]>(
    () => PAGES.map(() => [])
  );
  /* the stroke currently being drawn (not yet committed) */
  const activeStroke = useRef<Stroke | null>(null);
  const [renderTick, setRenderTick] = useState(0); // force re-render mid-stroke

  /* ── Navigation ───────────────────────────── */
  const goNext = () => {
    if (pageIdx < PAGES.length - 1) {
      setPageIdx((p) => p + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  const goPrev = () => {
    if (pageIdx > 0) {
      setPageIdx((p) => p - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  /* ── Clear current page ───────────────────── */
  const handleClear = () => {
    setAllStrokes((prev) => {
      const next = [...prev];
      next[pageIdx] = [];
      return next;
    });
    activeStroke.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /* ── Save ─────────────────────────────────── */
  const handleSave = useCallback(() => {
    if (Platform.OS === 'web') {
      Alert.alert(
        '💾 Save Your Art',
        'Take a screenshot to save your coloring! On iPad press Side Button + Volume Up. On iPhone press Side Button + Volume Up.',
        [{ text: 'Got it!', style: 'default' }]
      );
    } else {
      Alert.alert(
        '💾 Save Your Art',
        'Take a screenshot to save your coloring!\n\nOn iPad: Press Side Button + Volume Up\nOn iPhone: Press Side Button + Volume Up',
        [{ text: 'Got it! 🌟', style: 'default' }]
      );
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  /* ── PanResponder ─────────────────────────── */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:        () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder:         () => true,
      onMoveShouldSetPanResponderCapture:  () => true,

      onPanResponderGrant: (evt) => {
        const { locationX: x, locationY: y } = evt.nativeEvent;
        /* snapshot colour/brush at stroke start (refs would be stale) */
        activeStroke.current = {
          color: selColorRef.current,
          size:  brushSizeRef.current,
          points: [[x, y]],
        };
        setRenderTick((t) => t + 1);
      },

      onPanResponderMove: (evt) => {
        if (!activeStroke.current) return;
        const { locationX: x, locationY: y } = evt.nativeEvent;
        const pts = activeStroke.current.points;
        /* throttle: only add point if moved ≥ 2px */
        const last = pts[pts.length - 1];
        const dx = x - last[0], dy = y - last[1];
        if (dx * dx + dy * dy < 4) return;
        activeStroke.current = {
          ...activeStroke.current,
          points: [...pts, [x, y]],
        };
        setRenderTick((t) => t + 1);
      },

      onPanResponderRelease: () => {
        if (!activeStroke.current) return;
        const finished = activeStroke.current;
        activeStroke.current = null;
        setAllStrokes((prev) => {
          const next = [...prev];
          next[pageIdxRef.current] = [...(next[pageIdxRef.current] ?? []), finished];
          return next;
        });
        setRenderTick((t) => t + 1);
      },

      onPanResponderTerminate: () => {
        activeStroke.current = null;
        setRenderTick((t) => t + 1);
      },
    })
  ).current;

  /* refs so PanResponder callbacks (created once) can read current state */
  const selColorRef  = useRef(selColor);
  selColorRef.current = selColor;
  const brushSizeRef = useRef(BRUSHES[brushIdx]);
  brushSizeRef.current = BRUSHES[brushIdx];
  const pageIdxRef   = useRef(pageIdx);
  pageIdxRef.current = pageIdx;

  /* ── Render ───────────────────────────────── */
  const page        = PAGES[pageIdx];
  const strokes     = allStrokes[pageIdx] ?? [];
  const brushSize   = BRUSHES[brushIdx];

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>

      {/* ── Header ─────────────────────────── */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.deepPurple }]}>Colouring</Text>
        <View style={styles.headerBtns}>
          <Pressable
            onPress={handleClear}
            style={({ pressed }) => [styles.hdrBtn, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="refresh" size={15} color={colors.textMuted} />
            <Text style={[styles.hdrBtnTxt, { color: colors.textMuted }]}>Clear</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.hdrBtn, { borderColor: colors.midPurple, opacity: pressed ? 0.6 : 1 }]}
          >
            <MaterialCommunityIcons name="content-save" size={15} color={colors.midPurple} />
            <Text style={[styles.hdrBtnTxt, { color: colors.midPurple }]}>Save</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Colour palette ─────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.paletteScroll}
        contentContainerStyle={styles.paletteContent}
      >
        {PALETTE.map((c) => (
          <Pressable
            key={c}
            onPress={() => { setSelColor(c); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[
              styles.swatch,
              { backgroundColor: c },
              c === '#ffffff' && styles.swatchWhite,
              selColor === c  && styles.swatchActive,
            ]}
          />
        ))}
      </ScrollView>

      {/* ── Brush size row ─────────────────── */}
      <View style={styles.brushRow}>
        <Text style={[styles.brushLabel, { color: colors.textMuted }]}>Brush:</Text>
        {BRUSHES.map((sz, i) => (
          <Pressable
            key={sz}
            onPress={() => { setBrushIdx(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[
              styles.brushBtn,
              { borderColor: i === brushIdx ? colors.midPurple : colors.border },
            ]}
          >
            <View style={[
              styles.brushDot,
              {
                backgroundColor: i === brushIdx ? colors.midPurple : colors.textMuted,
                width: Math.min(sz * 1.4, 28),
                height: Math.min(sz * 1.4, 28),
                borderRadius: Math.min(sz * 0.7, 14),
              },
            ]} />
          </Pressable>
        ))}
        <View style={[styles.previewDot, { backgroundColor: selColor, width: brushSize * 1.4, height: brushSize * 1.4, borderRadius: brushSize * 0.7 }]} />
      </View>

      {/* ── Page navigation ────────────────── */}
      <View style={styles.pageNav}>
        <Pressable
          onPress={goPrev}
          disabled={pageIdx === 0}
          style={({ pressed }) => [styles.navBtn, { opacity: pageIdx === 0 ? 0.3 : pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.midPurple} />
        </Pressable>

        <View style={styles.pageInfo}>
          <Text style={[styles.pageTitle,  { color: colors.deepPurple }]}>{page.label}</Text>
          <Text style={[styles.pageCount, { color: colors.textMuted }]}>{pageIdx + 1} / {PAGES.length}</Text>
        </View>

        <Pressable
          onPress={goNext}
          disabled={pageIdx === PAGES.length - 1}
          style={({ pressed }) => [styles.navBtn, { opacity: pageIdx === PAGES.length - 1 ? 0.3 : pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.midPurple} />
        </Pressable>
      </View>

      {/* ── Drawing canvas ─────────────────── */}
      <View
        style={[
          styles.canvasWrap,
          {
            width: canvasSize,
            height: canvasSize,
            borderColor: colors.border,
            alignSelf: 'center',
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Coloring page image */}
        <Image
          source={page.src}
          style={[styles.canvasImg, { width: canvasSize, height: canvasSize }]}
          resizeMode="contain"
        />

        {/* Drawing layer */}
        <Svg
          style={StyleSheet.absoluteFill}
          width={canvasSize}
          height={canvasSize}
          pointerEvents="none"
        >
          {/* committed strokes */}
          {strokes.map((stroke, i) => (
            <Path
              key={i}
              d={strokeToPath(stroke)}
              stroke={stroke.color}
              strokeWidth={stroke.size}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.82}
            />
          ))}
          {/* active (in-progress) stroke */}
          {activeStroke.current && (
            <Path
              d={strokeToPath(activeStroke.current)}
              stroke={activeStroke.current.color}
              strokeWidth={activeStroke.current.size}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.82}
            />
          )}
        </Svg>
      </View>

      {/* ── Hint ───────────────────────────── */}
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Draw with your finger · Tap Save to screenshot your art ✨
      </Text>

    </View>
  );
}

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14, paddingBottom: 10,
  },
  title: { fontSize: 24, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  hdrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1,
  },
  hdrBtnTxt: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  paletteScroll:  { flexGrow: 0, marginBottom: 8 },
  paletteContent: { paddingRight: 16, gap: 8, flexDirection: 'row', alignItems: 'center' },
  swatch:         { width: 34, height: 34, borderRadius: 17 },
  swatchWhite:    { borderWidth: 1, borderColor: '#ccc' },
  swatchActive:   { borderWidth: 3, borderColor: '#26215C', transform: [{ scale: 1.2 }] },

  brushRow:  {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 10,
  },
  brushLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  brushBtn: {
    width: 40, height: 40, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  brushDot:   {},
  previewDot: { marginLeft: 4 },

  pageNav: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 8,
  },
  navBtn:    { padding: 6 },
  pageInfo:  { flex: 1, alignItems: 'center' },
  pageTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  pageCount: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },

  canvasWrap: {
    borderRadius: 18, borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  canvasImg: {},

  hint: {
    fontSize: 11, textAlign: 'center',
    fontFamily: 'Inter_400Regular', marginTop: 8,
  },
});
