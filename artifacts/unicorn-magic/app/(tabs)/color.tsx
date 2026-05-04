import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
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

/* ─── Brush sizes ─────────────────────────────────────────────────────────── */
const BRUSHES = [3, 6, 12, 20];

type DrawMode = 'brush' | 'fill';

/* ─── Resolve image URI (file:// on native, remote URI on web) ───────────── */
async function loadImageUri(module: number): Promise<string> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  // On native return the local file:// path so the WebView can load it
  // directly — avoids base64-encoding 1.5 MB+ images into the HTML string.
  if (Platform.OS !== 'web') {
    return asset.localUri!;
  }
  return asset.uri;
}

/* ─── Build WebView HTML ──────────────────────────────────────────────────── */
function buildHtml(dataUrl: string, color: string, mode: DrawMode, brushSize: number): string {
  return /* html */`<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
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

var color='${color}';
var mode='${mode}';
var brushSize=${brushSize};
var painting=false;
var img=new Image();

img.onload=function(){
  ctx.globalAlpha=1;
  ctx.drawImage(img,0,0,SZ,SZ);
};
img.src='${dataUrl}';

/* ── helpers ── */
function hexToRgb(h){
  return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
}
function canvasPos(e){
  var r=canvas.getBoundingClientRect();
  return[(e.clientX-r.left)*(SZ/r.width),(e.clientY-r.top)*(SZ/r.height)];
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

  var TOL=45;
  function match(i){
    return Math.abs(d[i]-sr)<=TOL&&Math.abs(d[i+1]-sg)<=TOL&&Math.abs(d[i+2]-sb)<=TOL;
  }
  function paint(i){d[i]=fr;d[i+1]=fg;d[i+2]=fb;d[i+3]=255;}

  var vis=new Uint8Array(w*h);
  /* Scanline fill: push seed span then scan above/below */
  var stack=[];
  function pushSpan(y,xl,xr,dy){stack.push(y,xl,xr,dy);}
  pushSpan(sy,sx,sx,1);
  pushSpan(sy+1,sx,sx,-1);

  while(stack.length){
    var dy=stack.pop(),xr=stack.pop(),xl=stack.pop(),y=stack.pop();
    var ny=y+dy;
    if(ny<0||ny>=h)continue;
    var x=xl;
    /* extend left */
    while(x>0&&!vis[ny*w+x-1]&&match((ny*w+x-1)*4))x--;
    var x1=x;
    /* scan right across this row */
    while(x<=xr+1&&x<w){
      var inside=(x<=xr)&&!vis[ny*w+x]&&match((ny*w+x)*4);
      if(inside){
        if(!vis[ny*w+x]){vis[ny*w+x]=1;paint((ny*w+x)*4);}
        /* extend further right */
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
  /* also fill original row xl..xr */
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

/* ── pointer events ── */
canvas.addEventListener('pointerdown',function(e){
  e.preventDefault();
  var p=canvasPos(e);
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

canvas.addEventListener('pointermove',function(e){
  e.preventDefault();
  if(!painting||mode!=='brush')return;
  var p=canvasPos(e);
  ctx.lineTo(p[0],p[1]);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p[0],p[1]);
},{passive:false});

canvas.addEventListener('pointerup',function(e){
  e.preventDefault();
  painting=false;
  ctx.beginPath();
},{passive:false});

canvas.addEventListener('pointercancel',function(e){
  painting=false;ctx.beginPath();
},{passive:false});

/* ── commands from RN ── */
function updateSettings(c,m,s){color=c;mode=m;brushSize=s;}
function clearCanvas(){
  ctx.globalAlpha=1;
  ctx.clearRect(0,0,SZ,SZ);
  ctx.drawImage(img,0,0,SZ,SZ);
}
</script>
</body></html>`;
}

/* ─── ColoringScreen ──────────────────────────────────────────────────────── */
export default function ColoringScreen() {
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();

  const topPad    = Platform.OS === 'web' ? 67 : 0;
  const canvasSize = screenWidth - 32;

  const [pageIdx,  setPageIdx]  = useState(0);
  const [selColor, setSelColor] = useState(PALETTE[0]);
  const [brushIdx, setBrushIdx] = useState(1);
  const [mode,     setMode]     = useState<DrawMode>('fill');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);

  const webViewRef = useRef<WebView>(null);

  /* ── Load image for current page ── */
  useEffect(() => {
    setLoading(true);
    setImageUri(null);
    loadImageUri(PAGES[pageIdx].src)
      .then((uri) => { setImageUri(uri); setLoading(false); })
      .catch(() => setLoading(false));
  }, [pageIdx]);

  /* ── Sync settings to WebView when they change ── */
  useEffect(() => {
    webViewRef.current?.injectJavaScript(
      `updateSettings('${selColor}','${mode}',${BRUSHES[brushIdx]});true;`
    );
  }, [selColor, mode, brushIdx]);

  /* ── Navigation ── */
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

  /* ── Clear ── */
  const handleClear = () => {
    webViewRef.current?.injectJavaScript('clearCanvas();true;');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /* ── Save ── */
  const handleSave = useCallback(() => {
    Alert.alert(
      '💾 Save Your Art',
      'Take a screenshot to save your coloring!\n\niPhone/iPad: Side Button + Volume Up',
      [{ text: 'Got it! 🌟', style: 'default' }]
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  /* ── Message from WebView ── */
  const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    if (event.nativeEvent.data === 'haptic') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

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

      {/* ── Mode toggle ── */}
      <View style={[styles.modeRow, { borderColor: colors.border }]}>
        <Pressable
          onPress={() => { setMode('brush'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.modeBtn, mode === 'brush' && { backgroundColor: colors.midPurple }]}
        >
          <MaterialCommunityIcons name="brush" size={17} color={mode === 'brush' ? '#fff' : colors.textMuted} />
          <Text style={[styles.modeBtnTxt, { color: mode === 'brush' ? '#fff' : colors.textMuted }]}>Brush</Text>
        </Pressable>
        <Pressable
          onPress={() => { setMode('fill'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
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
          style={({ pressed }) => [styles.navBtn, { opacity: pageIdx === PAGES.length - 1 ? 0.3 : pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.midPurple} />
        </Pressable>
      </View>

      {/* ── Canvas ── */}
      <View style={[styles.canvasWrap, { width: canvasSize, height: canvasSize, borderColor: colors.border }]}>
        {loading || !imageUri ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.midPurple} />
            <Text style={[styles.loaderTxt, { color: colors.textMuted }]}>Loading page…</Text>
          </View>
        ) : (
          <WebView
            key={`${pageIdx}-${imageUri.slice(-20)}`}
            ref={webViewRef}
            source={{ html: buildHtml(imageUri, selColor, mode, BRUSHES[brushIdx]), baseUrl: 'file:///' }}
            style={styles.webView}
            scrollEnabled={false}
            bounces={false}
            onMessage={onMessage}
            allowFileAccess
            allowUniversalAccessFromFileURLs
            allowFileAccessFromFileURLs
            mixedContentMode="always"
            originWhitelist={['*']}
          />
        )}
      </View>

      {/* ── Hint ── */}
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {mode === 'fill'
          ? 'Tap any region to fill it with your colour ✨'
          : 'Draw with your finger ✨'}
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
});
