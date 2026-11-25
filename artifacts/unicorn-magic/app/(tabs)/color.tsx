import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import ParentalGate from '@/components/ParentalGate';
import { useColors } from '@/hooks/useColors';

/* ─── Coloring pages ──────────────────────────────────────────────────────────
   `barriers` are short invisible segments, [x1, y1, x2, y2] in the 800×800
   page image, that close an opening in the outlines. They are never drawn —
   the fill just treats them as lines. Each closes one specific leak: on
   Mountain Magic, for example, the ear's outline stops ~10px short of the
   mane, so without its barrier, filling the unicorn also filled the mountain
   behind it. Found by mapping every region of every page and checking each
   leak by eye. Pages with no leaks have none.

   Left alone on purpose: on Waterfall Magic the pond's shore is only hinted
   at, so water and ground are one area. Closing it would mean inventing a
   shoreline the drawing doesn't have. */
type Segment = [number, number, number, number];

const PAGES: { src: number; label: string; barriers: Segment[] }[] = [
  { src: require('../../assets/coloring_1.png'),  label: 'Rainbow Unicorn',
    barriers: [[708, 477, 698, 472], [185, 494, 176, 492]] },
  { src: require('../../assets/coloring_2.png'),  label: 'Starry Night', barriers: [] },
  { src: require('../../assets/coloring_3.png'),  label: 'Castle Dream',
    barriers: [
      [303, 774, 294, 763], [333, 799, 333, 788], [244, 733, 244, 722],
      [595, 799, 592, 783], [433, 509, 427, 494], [479, 405, 470, 405],
    ] },
  { src: require('../../assets/coloring_4.png'),  label: 'Enchanted Forest', barriers: [] },
  { src: require('../../assets/coloring_5.png'),  label: 'Mountain Magic',
    barriers: [[443, 238, 450, 251]] },
  { src: require('../../assets/coloring_6.png'),  label: 'Beach Gallop', barriers: [] },
  { src: require('../../assets/coloring_7.png'),  label: 'Rainbow Bridge', barriers: [] },
  { src: require('../../assets/coloring_8.png'),  label: 'Butterfly Meadow', barriers: [] },
  { src: require('../../assets/coloring_9.png'),  label: 'Waterfall Magic', barriers: [] },
  { src: require('../../assets/coloring_10.png'), label: 'Rainbow Hearts',
    barriers: [[314, 171, 314, 158], [221, 175, 208, 175]] },
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
type ToastIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/* ─── Saved artwork ──────────────────────────────────────────────────────────
   The canvas holds only the child's colour layer; the line art sits on top of
   it and is never painted on (see buildHtml). The colour layer is saved as
   paint-N.png in the document directory, so a drawing survives page changes,
   tab changes and app restarts.

   Builds up to 3 saved the flattened picture (colour + lines) as page-N.png.
   That still works as a colour layer — the lines drawn over it land exactly on
   the lines baked into it — so it is read once, then replaced on next save. */
const ART_DIR = new Directory(Paths.document, 'coloring');

function paintFile(pageIdx: number): File {
  return new File(ART_DIR, `paint-${pageIdx}.png`);
}

function legacyFile(pageIdx: number): File {
  return new File(ART_DIR, `page-${pageIdx}.png`);
}

/* The finished picture for Photos, colour layer with the lines over it. Lives
   in the cache only long enough to hand to the photo library. */
function exportFile(pageIdx: number): File {
  return new File(Paths.cache, `unicorn-magic-coloring-${pageIdx + 1}.png`);
}

function ensureArtDir(): void {
  if (!ART_DIR.exists) ART_DIR.create({ intermediates: true, idempotent: true });
}

async function fileDataUrl(f: File): Promise<string> {
  return `data:image/png;base64,${await f.base64()}`;
}

/* ─── Load image as base64 data URL ───────────────────────────────────────
   NOTE: expo-file-system v19 moved readAsStringAsync to the /legacy entry —
   calling it from the package root throws at runtime. Uses the File API. */
async function loadBundledPage(module: number): Promise<string> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  return fileDataUrl(new File(asset.localUri!));
}

/* What one page needs: its line art, and the child's colour layer if any. */
type PageArt = { idx: number; lines: string; paint: string | null };

async function loadPage(pageIdx: number): Promise<PageArt> {
  ensureArtDir();
  const lines = await loadBundledPage(PAGES[pageIdx].src);
  for (const f of [paintFile(pageIdx), legacyFile(pageIdx)]) {
    if (f.exists) return { idx: pageIdx, lines, paint: await fileDataUrl(f) };
  }
  return { idx: pageIdx, lines, paint: null };
}

function writePng(f: File, dataUrl: string): void {
  if (f.exists) f.delete();
  f.create();
  f.write(dataUrl.replace(/^data:image\/png;base64,/, ''), { encoding: 'base64' });
}

function writeArt(pageIdx: number, dataUrl: string): void {
  ensureArtDir();
  writePng(paintFile(pageIdx), dataUrl);
  /* Drop the old flattened copy only once the new one is safely written. */
  const legacy = legacyFile(pageIdx);
  if (legacy.exists) legacy.delete();
}

function deleteArt(pageIdx: number): void {
  for (const f of [paintFile(pageIdx), legacyFile(pageIdx)]) {
    if (f.exists) f.delete();
  }
}

/* ─── Build WebView HTML ────────────────────────────────────────────────────
   Two layers. The <canvas> is the child's colour layer; the line art is an
   <img> above it with mix-blend-mode:multiply, so the white of the drawing
   lets the colour through and the black lines always stay crisp on top.
   Nothing ever paints over a line, and the line art itself is never changed.

   Filling uses a region map built once per page from the line art: every
   pixel is assigned to the area it belongs to, and a fill recolours exactly
   one area. This replaced a scanline flood fill that (1) missed whole strips
   of a shape — a white bar left across the unicorn's muzzle — and (2) decided
   what to fill from the *current* colours, so a dark fill became a new wall
   and anything filled black could never be recoloured.

   buildHtml depends only on the page. Colour / mode / brush size are injected
   via updateSettings() so changing them never reloads the WebView. */
function buildHtml(art: PageArt, barriers: Segment[], vpWidth: number): string {
  return /* html */`<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=${vpWidth},initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;overflow:hidden;background:#fff}
  #c,#lines{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
  #c{touch-action:none}
  #lines{mix-blend-mode:multiply;pointer-events:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
</style>
</head><body>
<canvas id="c"></canvas><img id="lines" alt="">
<script>
var SZ=800,N=SZ*SZ;
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');
canvas.width=SZ;canvas.height=SZ;
ctx.fillStyle='#fff';ctx.fillRect(0,0,SZ,SZ);
var lines=document.getElementById('lines');

/* defaults — overwritten immediately by updateSettings() injected onLoad */
var color='#FF69B4';
var mode='fill';
var brushSize=6;
var painting=false;

function post(m){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(m);}

/* ── undo history (up to 10 snapshots of the colour layer) ── */
var hist=[];
var MAX_HIST=10;
function remember(snapshot){
  hist.push(snapshot);
  if(hist.length>MAX_HIST)hist.shift();
  post('canUndo:1');
}

/* ── region map ──
   WALL_LEVEL  a pixel darker than this is part of a line.
   GAP_CLOSE   breaks in a line up to 2*GAP_CLOSE+1 px wide still count as
               closed when deciding which areas connect, so a hairline gap
               cannot let a fill escape. Wider ones are the page's barriers.
   TAP_SLOP    a tap that lands on a line fills the nearest area, unless it
               is deeper than this inside a solid black shape (a pupil). */
var WALL_LEVEL=128,GAP_CLOSE=2,TAP_SLOP=6;
var BARRIERS=${JSON.stringify(barriers)};
var owner=null,wallDepth=null;

function grow(m){
  var out=new Uint8Array(m),p,x;
  for(p=0;p<N;p++){
    if(m[p])continue;
    x=p%SZ;
    if((x>0&&m[p-1])||(x<SZ-1&&m[p+1])||(p>=SZ&&m[p-SZ])||(p<N-SZ&&m[p+SZ]))out[p]=1;
  }
  return out;
}

function stamp(wall,s){
  var x1=s[0],y1=s[1],x2=s[2],y2=s[3];
  var n=Math.ceil(Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)))*2+1;
  for(var k=0;k<=n;k++){
    var cx=x1+(x2-x1)*k/n,cy=y1+(y2-y1)*k/n;
    for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
      var x=Math.round(cx+dx),y=Math.round(cy+dy);
      if(x>=0&&x<SZ&&y>=0&&y<SZ)wall[y*SZ+x]=1;
    }
  }
}

/* Breadth-first: hand each queued pixel's owner to unowned, unblocked
   neighbours, in distance order. Returns the new end of the queue. */
function spread(q,h,t,blocked,depth){
  var c,x,n,k,id;
  while(h<t){
    c=q[h++];x=c%SZ;id=owner[c];
    for(k=0;k<4;k++){
      if(k===0){if(x===0)continue;n=c-1;}
      else if(k===1){if(x===SZ-1)continue;n=c+1;}
      else if(k===2){if(c<SZ)continue;n=c-SZ;}
      else{if(c>=N-SZ)continue;n=c+SZ;}
      if(owner[n]>=0||(blocked&&blocked[n]))continue;
      owner[n]=id;
      if(depth)depth[n]=depth[c]<255?depth[c]+1:255;
      q[t++]=n;
    }
  }
  return t;
}

function buildRegions(){
  var tmp=document.createElement('canvas');tmp.width=SZ;tmp.height=SZ;
  var tc=tmp.getContext('2d');
  tc.fillStyle='#fff';tc.fillRect(0,0,SZ,SZ);
  tc.drawImage(lines,0,0,SZ,SZ);
  var px=tc.getImageData(0,0,SZ,SZ).data;
  var wall=new Uint8Array(N),p,i,start;
  for(p=0;p<N;p++)wall[p]=px[p*4]<WALL_LEVEL?1:0;
  for(i=0;i<BARRIERS.length;i++)stamp(wall,BARRIERS[i]);
  var closed=wall;
  for(i=0;i<GAP_CLOSE;i++)closed=grow(closed);

  owner=new Int32Array(N);for(p=0;p<N;p++)owner[p]=-1;
  var q=new Int32Array(N),t=0,next=0;
  /* 1. each open area of the gap-closed drawing is a region */
  for(p=0;p<N;p++){
    if(closed[p]||owner[p]>=0)continue;
    owner[p]=next++;start=t;q[t++]=p;
    t=spread(q,start,t,closed,null);
  }
  /* 2. corners, the band beside each line and narrow breaks join whichever
        region they open into, nearest first, so a corner is never left white */
  t=spread(q,0,t,wall,null);
  /* 3. specks of open space no region reached become regions of their own */
  for(p=0;p<N;p++){
    if(wall[p]||owner[p]>=0)continue;
    owner[p]=next++;start=t;q[t++]=p;
    t=spread(q,start,t,wall,null);
  }
  /* 4. line pixels belong to the nearest region, so colour runs under the
        lines and leaves no white fringe beside them */
  wallDepth=new Uint8Array(N);t=0;
  for(p=0;p<N;p++)if(owner[p]>=0)q[t++]=p;
  spread(q,0,t,null,wallDepth);
}

/* ── loading: ready once the regions are built and any saved colour is on ── */
var ready=false,linesReady=false,paintReady=${art.paint ? 'false' : 'true'},cleared=false;
function maybeReady(){
  if(ready||!linesReady||!paintReady)return;
  ready=true;
  post('ready');
}
lines.onload=function(){
  try{buildRegions();}catch(err){post('loadfail');return;}
  linesReady=true;maybeReady();
};
lines.onerror=function(){post('loadfail');};
${art.paint ? `var saved=new Image();
saved.onload=function(){
  if(!cleared){ctx.globalAlpha=1;ctx.drawImage(saved,0,0,SZ,SZ);}
  paintReady=true;maybeReady();
};
/* An unreadable saved copy must not lock the page: start it fresh. */
saved.onerror=function(){paintReady=true;maybeReady();};
saved.src='${art.paint}';` : ''}
lines.src='${art.lines}';

/* ── helpers ── */
function hexToRgb(h){
  return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
}

/* Touch-based coordinate mapping — most reliable on iOS WKWebView.
   Uses touches[0].clientX/Y relative to canvas bounding rect (CSS px). */
function canvasPos(touch){
  var r=canvas.getBoundingClientRect();
  return[(touch.clientX-r.left)*(SZ/r.width),(touch.clientY-r.top)*(SZ/r.height)];
}

/* Recolour the whole region under (px,py). False if nothing changed, so a
   tap that changes nothing adds no undo step. */
function fillAt(px,py){
  var x=Math.max(0,Math.min(SZ-1,Math.floor(px)));
  var y=Math.max(0,Math.min(SZ-1,Math.floor(py)));
  var p=y*SZ+x;
  if(wallDepth[p]>TAP_SLOP)return false;
  var id=owner[p],c=hexToRgb(color),r=c[0],g=c[1],b=c[2];
  var before=ctx.getImageData(0,0,SZ,SZ),d=before.data,q,i,changed=false;
  for(q=0;q<N;q++){
    if(owner[q]!==id)continue;
    i=q*4;
    if(d[i]!==r||d[i+1]!==g||d[i+2]!==b){changed=true;break;}
  }
  if(!changed)return false;
  var after=ctx.getImageData(0,0,SZ,SZ),e=after.data;
  for(q=0;q<N;q++){
    if(owner[q]!==id)continue;
    i=q*4;e[i]=r;e[i+1]=g;e[i+2]=b;e[i+3]=255;
  }
  ctx.putImageData(after,0,0);
  remember(before);
  return true;
}

/* ── touch events (iOS WKWebView — most reliable coordinate source) ── */
canvas.addEventListener('touchstart',function(e){
  e.preventDefault();
  /* One finger only: a second finger or a resting palm must not start
     another fill or stroke. */
  if(!ready||e.touches.length!==1)return;
  var p=canvasPos(e.touches[0]);
  if(mode==='fill'){
    if(fillAt(p[0],p[1]))post('haptic');
    return;
  }
  remember(ctx.getImageData(0,0,SZ,SZ));
  painting=true;
  ctx.globalAlpha=1;
  ctx.fillStyle=color;
  ctx.strokeStyle=color;
  ctx.lineWidth=brushSize;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  /* a tap with the brush leaves a dot */
  ctx.beginPath();ctx.arc(p[0],p[1],brushSize/2,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(p[0],p[1]);
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
  if(e.touches.length===0)painting=false;
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
  post('canUndo:'+(hist.length>0?'1':'0'));
}
/* Start the page over: white colour layer, lines untouched. Clearing is
   itself undoable, so a stray tap on Clear costs nothing. */
function clearCanvas(){
  cleared=true;
  remember(ctx.getImageData(0,0,SZ,SZ));
  ctx.globalAlpha=1;
  ctx.fillStyle='#fff';
  ctx.fillRect(0,0,SZ,SZ);
}
/* The finished picture: colour layer with the lines multiplied over it,
   exactly what is on screen. */
function composite(){
  var t=document.createElement('canvas');t.width=SZ;t.height=SZ;
  var c=t.getContext('2d');
  c.drawImage(canvas,0,0);
  c.globalCompositeOperation='multiply';
  c.drawImage(lines,0,0,SZ,SZ);
  return t.toDataURL('image/png');
}
/* Hand the colour layer back to RN to keep; for Photos, also the picture. */
function requestSave(tag){
  if(!ready){post('skip:'+tag);return;}
  post('art:'+tag+':'+canvas.toDataURL('image/png'));
  if(tag==='photo')post('photo:'+composite());
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

  const [pageArt,      setPageArt]      = useState<PageArt | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [canUndo,      setCanUndo]      = useState(false);

  const webViewRef = useRef<WebView>(null);
  /* Page we should move to once the current canvas has been handed back. */
  const pendingPage = useRef<number | null>(null);
  const canvasReady = useRef(false);

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastMsg, setToastMsg] = useState<{ text: string; icon: ToastIcon }>({
    text: 'Saved to Photos!',
    icon: 'star-four-points',
  });
  /* `hold` is longer for the messages that actually have to be read, rather
     than the cheerful one that just confirms what the child expected. */
  const showToast = useCallback(
    (text: string, icon: ToastIcon = 'star-four-points', hold = 1200) => {
      setToastMsg({ text, icon });
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(hold),
        Animated.timing(toastOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]).start();
    },
    [toastOpacity]
  );

  /* ── Load the current page: its line art, plus the child's colours if saved ── */
  useEffect(() => {
    let cancelled = false;
    canvasReady.current = false;
    setLoading(true);
    setPageArt(null);
    setCanUndo(false);
    loadPage(pageIdx)
      .then((art) => { if (!cancelled) { setPageArt(art); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageIdx]);

  /* Only ever show a page's own art. Right after a page turn, pageArt still
     holds the previous page until the load above replaces it. The WebView sits
     inside a 1pt border, so its page is 2pt narrower than the frame. */
  const html = useMemo(
    () => (pageArt && pageArt.idx === pageIdx
      ? buildHtml(pageArt, PAGES[pageIdx].barriers, canvasSize - 2)
      : null),
    [pageArt, pageIdx, canvasSize]
  );

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

  /* Bank the drawing when the child navigates away from the tab entirely.
     Tab screens stay mounted when you switch away, so an unmount cleanup never
     ran — the blur callback is what actually fires. */
  useFocusEffect(
    useCallback(() => () => {
      if (canvasReady.current) {
        webViewRef.current?.injectJavaScript("requestSave('leave');true;");
      }
    }, [])
  );

  /* ── Undo ── */
  const handleUndo = () => {
    webViewRef.current?.injectJavaScript('undoCanvas();true;');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  /* ── Clear — back to the blank page, and the saved copy goes too ──
     This used to redraw the image the page had *opened* with, which was the
     saved artwork whenever there was any, so Clear put the old colouring right
     back. Now it whitens the colour layer, which never contains the lines.
     It stays undoable until the page is left. */
  const handleClear = () => {
    webViewRef.current?.injectJavaScript('clearCanvas();true;');
    try { deleteArt(pageIdx); } catch { /* the next autosave overwrites it */ }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  /* ── Save to Photos ──
     The export sits behind a parental gate. Writing to the photo library needs
     a system permission, and Apple requires Kids Category apps to put a gate in
     front of a permission request. The gate guards only the export: the drawing
     is kept inside the app either way, by the autosave above. */
  const [gateOpen, setGateOpen] = useState(false);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setGateOpen(true);
  }, []);

  const handleGatePass = useCallback(() => {
    setGateOpen(false);
    if (!canvasReady.current) {
      showToast('Nothing to save yet', 'information', 2200);
      return;
    }
    webViewRef.current?.injectJavaScript("requestSave('photo');true;");
  }, [showToast]);

  /* Hand the finished picture (colours with the lines over them) to Photos. */
  const exportToPhotos = useCallback(async (idx: number, dataUrl: string) => {
    const out = exportFile(idx);
    try {
      /* writeOnly — the app adds a picture and never reads the library back. */
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) {
        showToast('Photos is turned off — the picture is still here', 'information', 2800);
        return;
      }
      writePng(out, dataUrl);
      await MediaLibrary.saveToLibraryAsync(out.uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showToast('Saved to Photos!');
    } catch {
      showToast("Couldn't save to Photos — the picture is still here", 'information', 2800);
    } finally {
      try { if (out.exists) out.delete(); } catch { /* cache; the OS clears it */ }
    }
  }, [showToast]);

  /* Move to the page the child asked for, once the old one has been banked. */
  const advancePending = useCallback(() => {
    if (pendingPage.current === null) return;
    const next = pendingPage.current;
    pendingPage.current = null;
    setPageIdx(next);
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

    /* The canvas only counts as ready once the line art is actually on it. */
    if (msg === 'ready')    { canvasReady.current = true;  return; }
    if (msg === 'loadfail') { canvasReady.current = false; return; }

    /* Asked to save before the page had drawn. Write nothing — a blank canvas
       saved over the line art would wipe the page permanently — but still let
       a page turn through so the arrows never feel stuck. */
    if (msg.startsWith('skip:')) {
      if (msg === 'skip:photo') showToast('Nothing to save yet', 'information', 2200);
      advancePending();
      return;
    }

    /* The colour layer, to keep. Saving is best-effort; never interrupt a
       child mid-drawing. */
    if (msg.startsWith('art:')) {
      const sep = msg.indexOf(':', 4);
      try { writeArt(pageIdx, msg.slice(sep + 1)); } catch {}
      advancePending();
      return;
    }

    /* The finished picture, sent only after Save passed the parental gate. */
    if (msg.startsWith('photo:')) {
      void exportToPhotos(pageIdx, msg.slice('photo:'.length));
    }
  }, [advancePending, exportToPhotos, pageIdx, showToast]);

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
            accessibilityLabel="Save your artwork to Photos"
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
        {loading || !html ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.midPurple} />
            <Text style={[styles.loaderTxt, { color: colors.textMuted }]}>Loading page…</Text>
          </View>
        ) : (
          <WebView
            key={`page-${pageIdx}`}
            ref={webViewRef}
            source={{ html }}
            style={styles.webView}
            scrollEnabled={false}
            bounces={false}
            onLoad={() => {
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
        <MaterialCommunityIcons name={toastMsg.icon} size={15} color="#fff" />
        <Text style={styles.toastText}>{toastMsg.text}</Text>
      </Animated.View>

      <ParentalGate
        visible={gateOpen}
        onPass={handleGatePass}
        onCancel={() => setGateOpen(false)}
      />
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
    maxWidth: '92%',
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
    color: '#fff', fontSize: 15, flexShrink: 1, textAlign: 'center',
    fontWeight: '700', fontFamily: 'Inter_700Bold',
  },
});
