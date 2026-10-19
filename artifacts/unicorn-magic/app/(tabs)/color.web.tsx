/**
 * Web-platform implementation of the Coloring tab.
 * Uses an HTML5 <canvas> element accessed via DOM ref (React Native Web renders
 * Views as real <div>s, so DOM APIs are available on .current).
 */
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useColors } from '@/hooks/useColors';

/* ─── Coloring pages ──────────────────────────────────────────────────────── */
const PAGES = [
  { src: require('../../assets/coloring_1.png'),  label: 'Rainbow Unicorn' },
  { src: require('../../assets/coloring_2.png'),  label: 'Starry Night' },
  { src: require('../../assets/coloring_3.png'),  label: 'Castle Dream' },
  { src: require('../../assets/coloring_4.png'),  label: 'Enchanted Forest' },
  { src: require('../../assets/coloring_5.png'),  label: 'Mountain Magic' },
  { src: require('../../assets/coloring_6.png'),  label: 'Beach Gallop' },
  { src: require('../../assets/coloring_7.png'),  label: 'Rainbow Bridge' },
  { src: require('../../assets/coloring_8.png'),  label: 'Butterfly Meadow' },
  { src: require('../../assets/coloring_9.png'),  label: 'Waterfall Magic' },
  { src: require('../../assets/coloring_10.png'), label: 'Rainbow Hearts' },
];

const PALETTE = [
  '#ff6eb4', '#ff9de2', '#f472b6', '#c084fc', '#a78bfa', '#818cf8',
  '#60a5fa', '#7dd3fc', '#34d399', '#4ade80', '#fbbf24', '#fb923c',
  '#f87171', '#fb7185', '#fcd34d', '#6ee7b7', '#ffffff', '#26215C', '#000000',
];

const BRUSHES = [3, 6, 12, 20];
type DrawMode = 'brush' | 'fill';
const CANVAS_SZ = 800;

/* ─── Flood-fill helper ──────────────────────────────────────────────────── */
function floodFill(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  hexColor: string,
) {
  sx = Math.round(sx); sy = Math.round(sy);
  if (sx < 0 || sx >= CANVAS_SZ || sy < 0 || sy >= CANVAS_SZ) return;

  const id   = ctx.getImageData(0, 0, CANVAS_SZ, CANVAS_SZ);
  const data = id.data;
  const W    = CANVAS_SZ;

  const si   = (sy * W + sx) * 4;
  const sr   = data[si], sg = data[si + 1], sb = data[si + 2];

  const fr = parseInt(hexColor.slice(1, 3), 16);
  const fg = parseInt(hexColor.slice(3, 5), 16);
  const fb = parseInt(hexColor.slice(5, 7), 16);

  if (sr === fr && sg === fg && sb === fb) return;

  const TOL = 45;
  function match(i: number) {
    return (
      Math.abs(data[i]     - sr) <= TOL &&
      Math.abs(data[i + 1] - sg) <= TOL &&
      Math.abs(data[i + 2] - sb) <= TOL
    );
  }
  function paint(i: number) { data[i] = fr; data[i+1] = fg; data[i+2] = fb; data[i+3] = 255; }

  const vis   = new Uint8Array(W * CANVAS_SZ);
  const stack: number[] = [sx + sy * W];
  vis[sx + sy * W] = 1;

  while (stack.length) {
    const pos = stack.pop()!;
    const x = pos % W, y = (pos / W) | 0;
    const idx = pos * 4;
    paint(idx);

    const left  = pos - 1, right = pos + 1,
          up    = pos - W, down  = pos + W;

    if (x > 0            && !vis[left]  && match(left  * 4)) { vis[left]  = 1; stack.push(left);  }
    if (x < W - 1        && !vis[right] && match(right * 4)) { vis[right] = 1; stack.push(right); }
    if (y > 0            && !vis[up]    && match(up    * 4)) { vis[up]    = 1; stack.push(up);    }
    if (y < CANVAS_SZ - 1 && !vis[down] && match(down  * 4)) { vis[down]  = 1; stack.push(down);  }
  }

  ctx.putImageData(id, 0, 0);
}

/* ─── Canvas component (DOM-backed) ─────────────────────────────────────── */
interface CanvasProps {
  imageUri:  string;
  color:     string;
  mode:      DrawMode;
  brushSize: number;
  clearTick: number;
}

// The <canvas> is created inside ColorCanvas but Save lives on the parent
// screen, so the live element is tracked here.
let liveCanvas: HTMLCanvasElement | null = null;

function ColorCanvas({ imageUri, color, mode, brushSize, clearTick }: CanvasProps) {
  const containerRef = useRef<any>(null);
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const ctxRef       = useRef<CanvasRenderingContext2D | null>(null);
  const imgRef       = useRef<HTMLImageElement | null>(null);
  const paintingRef  = useRef(false);

  /* live refs so event handlers (attached once) see current values */
  const colorRef     = useRef(color);     colorRef.current     = color;
  const modeRef      = useRef(mode);      modeRef.current      = mode;
  const brushSizeRef = useRef(brushSize); brushSizeRef.current = brushSize;

  /* Build / rebuild canvas when image changes */
  useEffect(() => {
    const container = containerRef.current as HTMLDivElement | null;
    if (!container) return;

    /* remove previous canvas */
    const prev = container.querySelector('canvas');
    if (prev) container.removeChild(prev);

    const canvas = document.createElement('canvas');
    canvas.width  = CANVAS_SZ;
    canvas.height = CANVAS_SZ;
    canvas.style.cssText = 'width:100%;height:100%;touch-action:none;cursor:crosshair;display:block;';
    canvasRef.current = canvas;
    liveCanvas = canvas;

    const ctx = canvas.getContext('2d')!;
    ctxRef.current = ctx;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.globalAlpha = 1;
      ctx.drawImage(img, 0, 0, CANVAS_SZ, CANVAS_SZ);
    };
    img.src = imageUri;
    imgRef.current = img;

    /* canvas pos helper */
    function canvasXY(e: PointerEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      return [
        (e.clientX - r.left) * (CANVAS_SZ / r.width),
        (e.clientY - r.top)  * (CANVAS_SZ / r.height),
      ];
    }

    function onDown(e: PointerEvent) {
      e.preventDefault();
      const [x, y] = canvasXY(e);
      if (modeRef.current === 'fill') {
        floodFill(ctx, x, y, colorRef.current);
      } else {
        paintingRef.current = true;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle  = colorRef.current;
        ctx.lineWidth    = brushSizeRef.current;
        ctx.lineCap      = 'round';
        ctx.lineJoin     = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
    function onMove(e: PointerEvent) {
      e.preventDefault();
      if (!paintingRef.current || modeRef.current !== 'brush') return;
      const [x, y] = canvasXY(e);
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth   = brushSizeRef.current;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    function onUp(e: PointerEvent) {
      e.preventDefault();
      paintingRef.current = false;
      ctx.beginPath();
    }

    canvas.addEventListener('pointerdown',   onDown, { passive: false });
    canvas.addEventListener('pointermove',   onMove, { passive: false });
    canvas.addEventListener('pointerup',     onUp,   { passive: false });
    canvas.addEventListener('pointercancel', onUp,   { passive: false });

    container.appendChild(canvas);

    return () => {
      canvas.removeEventListener('pointerdown',   onDown);
      canvas.removeEventListener('pointermove',   onMove);
      canvas.removeEventListener('pointerup',     onUp);
      canvas.removeEventListener('pointercancel', onUp);
      if (container.contains(canvas)) container.removeChild(canvas);
      canvasRef.current = null;
      liveCanvas = null;
      ctxRef.current    = null;
    };
  }, [imageUri]);

  /* Clear */
  useEffect(() => {
    if (!ctxRef.current || !imgRef.current) return;
    const ctx = ctxRef.current;
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, CANVAS_SZ, CANVAS_SZ);
    if (imgRef.current.complete) {
      ctx.drawImage(imgRef.current, 0, 0, CANVAS_SZ, CANVAS_SZ);
    } else {
      imgRef.current.onload = () => ctx.drawImage(imgRef.current!, 0, 0, CANVAS_SZ, CANVAS_SZ);
    }
  }, [clearTick]);

  return <View ref={containerRef} style={styles.webCanvas} />;
}

/* ─── Main Screen ────────────────────────────────────────────────────────── */
export default function ColoringScreen() {
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();

  const TOP_PAD  = 67; /* web header offset */
  const canvasSize = screenWidth - 32;

  const [pageIdx,   setPageIdx]   = useState(0);
  const [selColor,  setSelColor]  = useState(PALETTE[0]);
  const [brushIdx,  setBrushIdx]  = useState(1);
  const [mode,      setMode]      = useState<DrawMode>('fill');
  const [imageUri,  setImageUri]  = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [clearTick, setClearTick] = useState(0);

  /* Load image URI for the current page */
  useEffect(() => {
    setLoading(true);
    setImageUri(null);
    const asset = Asset.fromModule(PAGES[pageIdx].src);
    asset.downloadAsync().then(() => {
      setImageUri(asset.uri);
      setLoading(false);
    });
  }, [pageIdx]);

  const goNext = () => { if (pageIdx < PAGES.length - 1) { setPageIdx(p => p + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } };
  const goPrev = () => { if (pageIdx > 0) { setPageIdx(p => p - 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } };

  const handleClear = () => {
    setClearTick(t => t + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /* On web the canvas is a real <canvas>, so Save can actually save: hand the
     artwork back as a PNG download instead of telling a child to take a
     screenshot (which is what this used to do). */
  const handleSave = useCallback(() => {
    const canvas = liveCanvas;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = `unicorn-magic-${PAGES[pageIdx].label.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* saving is best-effort; never interrupt a child mid-drawing */
    }
  }, [pageIdx]);

  const page      = PAGES[pageIdx];
  const brushSize = BRUSHES[brushIdx];

  return (
    <View style={[styles.root, { paddingTop: TOP_PAD }]}>
      <LinearGradient colors={['#FFD6EC', '#EDD6FF', '#D6EEFF', '#D6FFE8']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.deepPurple }]}>Coloring</Text>
        <View style={styles.headerBtns}>
          <Pressable onPress={handleClear} accessibilityRole="button" accessibilityLabel="Clear this page and start over" style={({ pressed }) => [styles.hdrBtn, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="refresh" size={15} color={colors.textMuted} />
            <Text style={[styles.hdrBtnTxt, { color: colors.textMuted }]}>Clear</Text>
          </Pressable>
          <Pressable onPress={handleSave} accessibilityRole="button" accessibilityLabel="Save your artwork" style={({ pressed }) => [styles.hdrBtn, { borderColor: colors.midPurple, opacity: pressed ? 0.6 : 1 }]}>
            <MaterialCommunityIcons name="content-save" size={15} color={colors.midPurple} />
            <Text style={[styles.hdrBtnTxt, { color: colors.midPurple }]}>Save</Text>
          </Pressable>
        </View>
      </View>

      {/* Mode toggle */}
      <View style={[styles.modeRow, { borderColor: colors.border }]}>
        <Pressable onPress={() => { setMode('brush'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={[styles.modeBtn, mode === 'brush' && { backgroundColor: colors.midPurple }]}>
          <MaterialCommunityIcons name="brush"  size={17} color={mode === 'brush' ? '#fff' : colors.textMuted} />
          <Text style={[styles.modeBtnTxt, { color: mode === 'brush' ? '#fff' : colors.textMuted }]}>Brush</Text>
        </Pressable>
        <Pressable onPress={() => { setMode('fill'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={[styles.modeBtn, mode === 'fill' && { backgroundColor: colors.midPurple }]}>
          <MaterialCommunityIcons name="bucket" size={17} color={mode === 'fill' ? '#fff' : colors.textMuted} />
          <Text style={[styles.modeBtnTxt, { color: mode === 'fill' ? '#fff' : colors.textMuted }]}>Fill</Text>
        </Pressable>
      </View>

      {/* Palette */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteScroll} contentContainerStyle={styles.paletteContent}>
        {PALETTE.map(c => (
          <Pressable key={c} onPress={() => { setSelColor(c); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={[styles.swatch, { backgroundColor: c }, c === '#ffffff' && styles.swatchWhite, selColor === c && styles.swatchActive]} />
        ))}
      </ScrollView>

      {/* Brush size */}
      <View style={styles.brushRow}>
        <Text style={[styles.brushLabel, { color: colors.textMuted }]}>{mode === 'fill' ? 'Fill:' : 'Brush:'}</Text>
        {BRUSHES.map((sz, i) => (
          <Pressable key={sz} onPress={() => { setBrushIdx(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={[styles.brushBtn, { borderColor: i === brushIdx ? colors.midPurple : colors.border }]}>
            <View style={[styles.brushDot, { backgroundColor: i === brushIdx ? colors.midPurple : colors.textMuted, width: Math.min(sz * 1.4, 28), height: Math.min(sz * 1.4, 28), borderRadius: 14 }]} />
          </Pressable>
        ))}
        <View style={[styles.previewDot, { backgroundColor: selColor, width: brushSize * 1.4, height: brushSize * 1.4, borderRadius: brushSize * 0.7 }]} />
      </View>

      {/* Page nav */}
      <View style={styles.pageNav}>
        <Pressable onPress={goPrev} disabled={pageIdx === 0} style={({ pressed }) => [styles.navBtn, { opacity: pageIdx === 0 ? 0.3 : pressed ? 0.6 : 1 }]}>
          <Ionicons name="chevron-back" size={22} color={colors.midPurple} />
        </Pressable>
        <View style={styles.pageInfo}>
          <Text style={[styles.pageTitle, { color: colors.deepPurple }]}>{page.label}</Text>
          <Text style={[styles.pageCount, { color: colors.textMuted }]}>{pageIdx + 1} / {PAGES.length}</Text>
        </View>
        <Pressable onPress={goNext} disabled={pageIdx === PAGES.length - 1} style={({ pressed }) => [styles.navBtn, { opacity: pageIdx === PAGES.length - 1 ? 0.3 : pressed ? 0.6 : 1 }]}>
          <Ionicons name="chevron-forward" size={22} color={colors.midPurple} />
        </Pressable>
      </View>

      {/* Canvas */}
      <View style={[styles.canvasWrap, { width: canvasSize, height: canvasSize, borderColor: colors.border }]}>
        {loading || !imageUri ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.midPurple} />
            <Text style={[styles.loaderTxt, { color: colors.textMuted }]}>Loading page…</Text>
          </View>
        ) : (
          <ColorCanvas
            key={pageIdx}
            imageUri={imageUri}
            color={selColor}
            mode={mode}
            brushSize={BRUSHES[brushIdx]}
            clearTick={clearTick}
          />
        )}
      </View>

      {/* Hint */}
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {mode === 'fill' ? 'Tap any region to fill it with your color ✨' : 'Draw with your finger ✨'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, paddingHorizontal: 16 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 8 },
  title:      { fontSize: 24, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  hdrBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  hdrBtnTxt:  { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  modeRow:    { flexDirection: 'row', borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  modeBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  modeBtnTxt: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  paletteScroll:  { flexGrow: 0, marginBottom: 6 },
  paletteContent: { paddingRight: 16, gap: 8, flexDirection: 'row', alignItems: 'center' },
  swatch:         { width: 34, height: 34, borderRadius: 17 },
  swatchWhite:    { borderWidth: 1, borderColor: '#ccc' },
  swatchActive:   { borderWidth: 3, borderColor: '#26215C', transform: [{ scale: 1.2 }] },

  brushRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  brushLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  brushBtn:   { width: 40, height: 40, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  brushDot:   {},
  previewDot: { marginLeft: 4 },

  pageNav:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  navBtn:    { padding: 6 },
  pageInfo:  { flex: 1, alignItems: 'center' },
  pageTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  pageCount: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },

  canvasWrap: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', backgroundColor: '#fff', alignSelf: 'center' },
  webCanvas:  { flex: 1, backgroundColor: '#fff' },

  loader:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loaderTxt: { fontSize: 13, fontFamily: 'Inter_400Regular' },

  hint: { fontSize: 11, textAlign: 'center', fontFamily: 'Inter_400Regular', marginTop: 8 },
});
