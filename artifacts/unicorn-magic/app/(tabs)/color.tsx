import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

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

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const PALETTE = [
  '#ff6eb4', '#ff9de2', '#f472b6', '#c084fc', '#a78bfa', '#818cf8',
  '#60a5fa', '#7dd3fc', '#34d399', '#4ade80', '#fbbf24', '#fb923c',
  '#f87171', '#fb7185', '#fcd34d', '#6ee7b7', '#ffffff', '#26215C', '#000000',
];

/* Spoken names, so the palette is usable with VoiceOver. */
const COLOR_NAMES: Record<string, string> = {
  '#ff6eb4': 'Hot pink',   '#ff9de2': 'Bubblegum', '#f472b6': 'Rose',
  '#c084fc': 'Purple',     '#a78bfa': 'Lavender',  '#818cf8': 'Periwinkle',
  '#60a5fa': 'Blue',       '#7dd3fc': 'Sky blue',  '#34d399': 'Emerald',
  '#4ade80': 'Green',      '#fbbf24': 'Amber',     '#fb923c': 'Orange',
  '#f87171': 'Red',        '#fb7185': 'Coral',     '#fcd34d': 'Yellow',
  '#6ee7b7': 'Mint',       '#ffffff': 'White',     '#26215C': 'Midnight',
  '#000000': 'Black',
};

/* ─── Brush sizes ─────────────────────────────────────────────────────────── */
const BRUSHES = [3, 6, 12, 20];
const BRUSH_NAMES = ['Extra small', 'Small', 'Medium', 'Large'];

type DrawMode = 'brush' | 'fill';

/* ─── Saved artwork ────────────────────────────────────────────────────────
   Each page's canvas is written to the document directory as a PNG, so a
   drawing survives page changes, tab changes and app restarts. Images are
   far too large for AsyncStorage, hence the filesystem. */
const ART_DIR = new Directory(Paths.document, 'coloring');

function artFile(pageIdx: number): File {
  return new File(ART_DIR, `page-${pageIdx}.png`);
}

function ensureArtDir(): void {
  if (!ART_DIR.exists) ART_DIR.create({ intermediates: true, idempotent: true });
}

/* ─── Load image as base64 data URL ───────────────────────────────────────
   NOTE: expo-file-system v19 moved readAsStringAsync to the /legacy entry —
   calling it from the package root throws at runtime. Uses the File API. */
async function loadBundledPage(module: number): Promise<string> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  const b64 = await new File(asset.localUri!).base64();
  return `data:image/png;base64,${b64}`;
}

/* Prefer the child's saved artwork; fall back to the blank line art. */
async function loadPage(pageIdx: number): Promise<string> {
  ensureArtDir();
  const saved = artFile(pageIdx);
  if (saved.exists) {
    return `data:image/png;base64,${await saved.base64()}`;
  }
  return loadBundledPage(PAGES[pageIdx].src);
}

function writeArt(pageIdx: number, dataUrl: string): void {
  ensureArtDir();
  const f = artFile(pageIdx);
  if (f.exists) f.delete();
  f.create();
  f.write(dataUrl.replace(/^data:image\/png;base64,/, ''), { encoding: 'base64' });
}

function deleteArt(pageIdx: number): void {
  const f = artFile(pageIdx);
  if (f.exists) f.delete();
}

/* ─── Build WebView HTML ──────────────────────────────────────────────────── */
/* buildHtml only depends on the image data + viewport width.
   Color / mode / brushSize are injected via updateSettings() so changing
   them never causes a WebView reload that would wipe the painted canvas. */
function buildHtml(dataUrl: string, vpWidth: number): string {
  return /* html */`<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=${vpWidth},initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;overflow:hidden;background:#fff}
  canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}
</style>
</head><body>
<canvas id="c"></canvas>
<script>
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');
var SZ=800;
canvas.width=SZ;canvas.height=SZ;

/* defaults — overwritten immediately by updateSettings() injected onLoad */
var color='#FF69B4';
var mode='fill';
var brushSize=6;
var painting=false;
var img=new Image();

/* ── undo history (up to 10 snapshots) ── */
var hist=[];
var MAX_HIST=10;
function pushHistory(){
  hist.push(ctx.getImageData(0,0,SZ,SZ));
  if(hist.length>MAX_HIST)hist.shift();
  if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('canUndo:1');
}

img.onload=function(){
  ctx.globalAlpha=1;
  ctx.drawImage(img,0,0,SZ,SZ);
};
img.src='${dataUrl}';

/* ── helpers ── */
function hexToRgb(h){
  return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
}

/* Touch-based coordinate mapping — most reliable on iOS WKWebView.
   Uses touches[0].clientX/Y relative to canvas bounding rect (CSS px). */
function canvasPos(touch){
  var r=canvas.getBoundingClientRect();
  var cx=(touch.clientX-r.left)*(SZ/r.width);
  var cy=(touch.clientY-r.top)*(SZ/r.height);
  return[cx,cy];
}

/* ── scanline flood fill ── */
function floodFill(sx,sy){
  sx=Math.round(sx);sy=Math.round(sy);
  if(sx<0||sx>=SZ||sy<0||sy>=SZ)return;

  var id=ctx.getImageData(0,0,SZ,SZ);
  var d=id.data,w=SZ,h=SZ;
  var si=(sy*w+sx)*4;
  var sr=d[si],sg=d[si+1],sb=d[si+2];
  var fc=hexToRgb(color),fr=fc[0],fg=fc[1],fb=fc[2];
  if(sr===fr&&sg===fg&&sb===fb)return;
  /* Protect outline: don't start a fill on a very dark pixel (line art).
     Threshold on max-channel so dark-colored fills can still be re-colored. */
  if(Math.max(sr,sg,sb)<80)return;

  /* Absolute-brightness matching: fill any connected pixel that is not dark.
     This prevents anti-aliased gray pixels inside a region from acting as
     false interior barriers (which caused rainbow bands to fill only partly).
     The dark outlines (max channel < 80) act as the true flood-fill walls. */
  function match(i){
    return Math.max(d[i],d[i+1],d[i+2])>=80;
  }
  function paint(i){d[i]=fr;d[i+1]=fg;d[i+2]=fb;d[i+3]=255;}

  var vis=new Uint8Array(w*h);
  var stack=[];
  function pushSpan(y,xl,xr,dy){stack.push(y,xl,xr,dy);}
  pushSpan(sy,sx,sx,1);
  pushSpan(sy+1,sx,sx,-1);

  while(stack.length){
    var dy=stack.pop(),xr=stack.pop(),xl=stack.pop(),y=stack.pop();
    var ny=y+dy;
    if(ny<0||ny>=h)continue;
    var x=xl;
    while(x>0&&!vis[ny*w+x-1]&&match((ny*w+x-1)*4))x--;
    var x1=x;
    while(x<=xr+1&&x<w){
      var inside=(x<=xr)&&!vis[ny*w+x]&&match((ny*w+x)*4);
      if(inside){
        if(!vis[ny*w+x]){vis[ny*w+x]=1;paint((ny*w+x)*4);}
        while(x+1<w&&!vis[ny*w+x+1]&&match((ny*w+x+1)*4)){
          x++;vis[ny*w+x]=1;paint((ny*w+x)*4);
        }
        pushSpan(ny,x1,x,dy);
        if(x>xr+1)pushSpan(ny,xr+1,x,-dy);
      } else {
        x1=x+1;
      }
      x++;
    }
  }
  /* fill seed row */
  var sx2=sx;
  while(sx2>=0&&match((sy*w+sx2)*4)){
    if(!vis[sy*w+sx2]){vis[sy*w+sx2]=1;paint((sy*w+sx2)*4);}
    sx2--;
  }
  sx2=sx+1;
  while(sx2<w&&match((sy*w+sx2)*4)){
    if(!vis[sy*w+sx2]){vis[sy*w+sx2]=1;paint((sy*w+sx2)*4);}
    sx2++;
  }
  ctx.putImageData(id,0,0);
}

/* ── touch events (iOS WKWebView — most reliable coordinate source) ── */
canvas.addEventListener('touchstart',function(e){
  e.preventDefault();
  var t=e.touches[0];
  if(!t)return;
  pushHistory();
  var p=canvasPos(t);
  if(mode==='fill'){
    floodFill(p[0],p[1]);
    if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('haptic');
  } else {
    painting=true;
    ctx.globalAlpha=0.9;
    ctx.strokeStyle=color;
    ctx.lineWidth=brushSize;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.beginPath();
    ctx.moveTo(p[0],p[1]);
  }
},{passive:false});

canvas.addEventListener('touchmove',function(e){
  e.preventDefault();
  if(!painting||mode!=='brush')return;
  var t=e.touches[0];
  if(!t)return;
  var p=canvasPos(t);
  ctx.lineTo(p[0],p[1]);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p[0],p[1]);
},{passive:false});

canvas.addEventListener('touchend',function(e){
  e.preventDefault();
  painting=false;
  ctx.beginPath();
},{passive:false});

canvas.addEventListener('touchcancel',function(e){
  painting=false;ctx.beginPath();
},{passive:false});

/* ── commands from RN ── */
function updateSettings(c,m,s){color=c;mode=m;brushSize=s;}
function undoCanvas(){
  if(!hist.length)return;
  ctx.putImageData(hist.pop(),0,0);
  if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('canUndo:'+(hist.length>0?'1':'0'));
}
function clearCanvas(){
  hist=[];
  ctx.globalAlpha=1;
  ctx.clearRect(0,0,SZ,SZ);
  ctx.drawImage(img,0,0,SZ,SZ);
  if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('canUndo:0');
}
/* Hand the finished canvas back to RN so it can be written to disk. */
function requestSave(tag){
  if(!window.ReactNativeWebView)return;
  window.ReactNativeWebView.postMessage('art:'+tag+':'+canvas.toDataURL('image/png'));
}
</script>
</body></html>`;
}

/* ─── ColoringScreen ──────────────────────────────────────────────────────── */
export default function ColoringScreen() {
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();

  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const canvasSize = screenWidth - 32;

  const [pageIdx,  setPageIdx]  = useState(0);
  const [selColor, setSelColor] = useState(PALETTE[0]);
  const [brushIdx, setBrushIdx] = useState(1);
  const [mode,     setMode]     = useState<DrawMode>('fill');

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [canUndo,      setCanUndo]      = useState(false);

  const webViewRef = useRef<WebView>(null);
  /* Page we should move to once the current canvas has been handed back. */
  const pendingPage = useRef<number | null>(null);
  const canvasReady = useRef(false);

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const showToast = useCallback(() => {
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [toastOpacity]);

  /* ── Load image for current page (saved artwork wins over blank line art) ── */
  useEffect(() => {
    let cancelled = false;
    canvasReady.current = false;
    setLoading(true);
    setImageDataUrl(null);
    setCanUndo(false);
    loadPage(pageIdx)
      .then((url) => { if (!cancelled) { setImageDataUrl(url); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageIdx]);

  /* ── Sync settings to WebView when they change ── */
  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      `updateSettings('${selColor}','${mode}',${BRUSHES[brushIdx]});true;`
    );
  }, [selColor, mode, brushIdx]);

  /* ── Navigation — always bank the drawing before leaving the page ── */
  const goToPage = useCallback((next: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!canvasReady.current) { setPageIdx(next); return; }
    pendingPage.current = next;
    webViewRef.current?.injectJavaScript("requestSave('turn');true;");
  }, []);

  const goNext = () => { if (pageIdx < PAGES.length - 1) goToPage(pageIdx + 1); };
  const goPrev = () => { if (pageIdx > 0) goToPage(pageIdx - 1); };

  /* Bank the drawing when the child navigates away from the tab entirely. */
  useEffect(() => () => {
    if (canvasReady.current) {
      webViewRef.current?.injectJavaScript("requestSave('leave');true;");
    }
  }, []);

  /* ── Undo ── */
  const handleUndo = () => {
    webViewRef.current?.injectJavaScript('undoCanvas();true;');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /* ── Clear — also discards the saved copy ── */
  const handleClear = () => {
    webViewRef.current?.injectJavaScript('clearCanvas();true;');
    deleteArt(pageIdx);
    setCanUndo(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /* ── Save ── */
  const handleSave = useCallback(() => {
    webViewRef.current?.injectJavaScript("requestSave('button');true;");
  }, []);

  /* ── Message from WebView ── */
  const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    const msg = event.nativeEvent.data;
    if (msg === 'haptic') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (msg === 'canUndo:1') { setCanUndo(true);  return; }
    if (msg === 'canUndo:0') { setCanUndo(false); return; }

    if (msg.startsWith('art:')) {
      const sep = msg.indexOf(':', 4);
      const tag = msg.slice(4, sep);
      const dataUrl = msg.slice(sep + 1);
      try {
        writeArt(pageIdx, dataUrl);
      } catch {
        /* Saving is best-effort; never interrupt a child mid-drawing. */
      }
      if (tag === 'button') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast();
      }
      if (pendingPage.current !== null) {
        const next = pendingPage.current;
        pendingPage.current = null;
        setPageIdx(next);
      }
    }
  }, [pageIdx, showToast]);

  const page      = PAGES[pageIdx];
  const brushSize = BRUSHES[brushIdx];

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <LinearGradient
        colors={['#FFD6EC', '#EDD6FF', '#D6EEFF', '#D6FFE8']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.deepPurple }]}>Coloring</Text>
        <View style={styles.headerBtns}>
          <Pressable
            onPress={handleUndo}
            disabled={!canUndo}
            accessibilityRole="button"
            accessibilityLabel="Undo last change"
            style={({ pressed }) => [
              styles.hdrBtn,
              { borderColor: colors.border, opacity: !canUndo ? 0.35 : pressed ? 0.6 : 1 },
            ]}
          >
            <Ionicons name="arrow-undo" size={15} color={colors.textMuted} />
            <Text style={[styles.hdrBtnTxt, { color: colors.textMuted }]}>Undo</Text>
          </Pressable>
          <Pressable
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Clear this page and start over"
            style={({ pressed }) => [styles.hdrBtn, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="refresh" size={15} color={colors.textMuted} />
            <Text style={[styles.hdrBtnTxt, { color: colors.textMuted }]}>Clear</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save your artwork"
            style={({ pressed }) => [styles.hdrBtn, { borderColor: colors.midPurple, opacity: pressed ? 0.6 : 1 }]}
          >
            <MaterialCommunityIcons name="content-save" size={15} color={colors.midPurple} />
            <Text style={[styles.hdrBtnTxt, { color: colors.midPurple }]}>Save</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Mode toggle ── */}
      <View style={[styles.modeRow, { borderColor: colors.border }]}>
        <Pressable
          onPress={() => { setMode('brush'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          accessibilityRole="button"
          accessibilityLabel="Brush mode"
          accessibilityState={{ selected: mode === 'brush' }}
          style={[styles.modeBtn, mode === 'brush' && { backgroundColor: colors.midPurple }]}
        >
          <MaterialCommunityIcons name="brush" size={17} color={mode === 'brush' ? '#fff' : colors.textMuted} />
          <Text style={[styles.modeBtnTxt, { color: mode === 'brush' ? '#fff' : colors.textMuted }]}>Brush</Text>
        </Pressable>
        <Pressable
          onPress={() => { setMode('fill'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          accessibilityRole="button"
          accessibilityLabel="Fill mode"
          accessibilityState={{ selected: mode === 'fill' }}
          style={[styles.modeBtn, mode === 'fill' && { backgroundColor: colors.midPurple }]}
        >
          <MaterialCommunityIcons name="bucket" size={17} color={mode === 'fill' ? '#fff' : colors.textMuted} />
          <Text style={[styles.modeBtnTxt, { color: mode === 'fill' ? '#fff' : colors.textMuted }]}>Fill</Text>
        </Pressable>
      </View>

      {/* ── Palette ── */}
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
            accessibilityRole="button"
            accessibilityLabel={`${COLOR_NAMES[c] ?? c} color`}
            accessibilityState={{ selected: selColor === c }}
            style={[
              styles.swatch,
              { backgroundColor: c },
              c === '#ffffff' && styles.swatchWhite,
              selColor === c  && styles.swatchActive,
            ]}
          />
        ))}
      </ScrollView>

      {/* ── Brush size row ── */}
      <View style={styles.brushRow}>
        <Text style={[styles.brushLabel, { color: colors.textMuted }]}>
          {mode === 'fill' ? 'Fill:' : 'Brush:'}
        </Text>
        {BRUSHES.map((sz, i) => (
          <Pressable
            key={sz}
            onPress={() => { setBrushIdx(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            accessibilityRole="button"
            accessibilityLabel={`${BRUSH_NAMES[i]} ${mode === 'fill' ? 'fill' : 'brush'}`}
            accessibilityState={{ selected: i === brushIdx }}
            style={[styles.brushBtn, { borderColor: i === brushIdx ? colors.midPurple : colors.border }]}
          >
            <View style={[
              styles.brushDot,
              {
                backgroundColor: i === brushIdx ? colors.midPurple : colors.textMuted,
                width:  Math.min(sz * 1.4, 28),
                height: Math.min(sz * 1.4, 28),
                borderRadius: 14,
              },
            ]} />
          </Pressable>
        ))}
        <View style={[
          styles.previewDot,
          { backgroundColor: selColor, width: brushSize * 1.4, height: brushSize * 1.4, borderRadius: brushSize * 0.7 },
        ]} />
      </View>

      {/* ── Page navigation ── */}
      <View style={styles.pageNav}>
        <Pressable
          onPress={goPrev}
          disabled={pageIdx === 0}
          accessibilityRole="button"
          accessibilityLabel="Previous coloring page"
          style={({ pressed }) => [styles.navBtn, { opacity: pageIdx === 0 ? 0.3 : pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.midPurple} />
        </Pressable>
        <View style={styles.pageInfo}>
          <Text style={[styles.pageTitle, { color: colors.deepPurple }]}>{page.label}</Text>
          <Text style={[styles.pageCount, { color: colors.textMuted }]}>{pageIdx + 1} / {PAGES.length}</Text>
        </View>
        <Pressable
          onPress={goNext}
          disabled={pageIdx === PAGES.length - 1}
          accessibilityRole="button"
          accessibilityLabel="Next coloring page"
          style={({ pressed }) => [styles.navBtn, { opacity: pageIdx === PAGES.length - 1 ? 0.3 : pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.midPurple} />
        </Pressable>
      </View>

      {/* ── Canvas ── */}
      <View style={[styles.canvasWrap, { width: canvasSize, height: canvasSize, borderColor: colors.border }]}>
        {loading || !imageDataUrl ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.midPurple} />
            <Text style={[styles.loaderTxt, { color: colors.textMuted }]}>Loading page…</Text>
          </View>
        ) : (
          <WebView
            key={`${pageIdx}-${imageDataUrl.slice(0, 30)}`}
            ref={webViewRef}
            source={{ html: buildHtml(imageDataUrl, canvasSize) }}
            style={styles.webView}
            scrollEnabled={false}
            bounces={false}
            onLoad={() => {
              canvasReady.current = true;
              webViewRef.current?.injectJavaScript(
                `updateSettings('${selColor}','${mode}',${BRUSHES[brushIdx]});true;`
              );
            }}
            onMessage={onMessage}
            /* Kids Category: this canvas is a local document and must never be
               able to navigate anywhere. Everything below is deliberate. */
            originWhitelist={['about:blank']}
            onShouldStartLoadWithRequest={(req) => req.url === 'about:blank'}
            javaScriptCanOpenWindowsAutomatically={false}
            allowsLinkPreview={false}
            setSupportMultipleWindows={false}
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
          />
        )}
      </View>

      {/* ── Hint ── */}
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {mode === 'fill'
          ? 'Tap any region to fill it with your color ✨'
          : 'Draw with your finger ✨'}
      </Text>

      {/* ── Saved toast ── */}
      <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toastOpacity }]}>
        <MaterialCommunityIcons name="star-four-points" size={15} color="#fff" />
        <Text style={styles.toastText}>Artwork Saved!</Text>
      </Animated.View>
    </View>
  );
}

/* ─── Styles ───────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14, paddingBottom: 8,
  },
  title:      { fontSize: 24, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  hdrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1,
  },
  hdrBtnTxt: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  modeRow: {
    flexDirection: 'row', borderRadius: 12,
    borderWidth: 1, overflow: 'hidden', marginBottom: 8,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingVertical: 8,
  },
  modeBtnTxt: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  paletteScroll:  { flexGrow: 0, marginBottom: 6 },
  paletteContent: { paddingRight: 16, gap: 8, flexDirection: 'row', alignItems: 'center' },
  swatch:         { width: 34, height: 34, borderRadius: 17 },
  swatchWhite:    { borderWidth: 1, borderColor: '#ccc' },
  swatchActive:   { borderWidth: 3, borderColor: '#26215C', transform: [{ scale: 1.2 }] },

  brushRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  brushLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  brushBtn: {
    width: 40, height: 40, borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  brushDot:   {},
  previewDot: { marginLeft: 4 },

  pageNav:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  navBtn:    { padding: 6 },
  pageInfo:  { flex: 1, alignItems: 'center' },
  pageTitle: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  pageCount: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },

  canvasWrap: {
    borderRadius: 18, borderWidth: 1,
    overflow: 'hidden', backgroundColor: '#ffffff',
    alignSelf: 'center',
  },
  webView: { flex: 1, backgroundColor: 'transparent' },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loaderTxt: { fontSize: 13, fontFamily: 'Inter_400Regular' },

  hint: {
    fontSize: 11, textAlign: 'center',
    fontFamily: 'Inter_400Regular', marginTop: 8,
  },

  toast: {
    position: 'absolute',
    bottom: 96,
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
