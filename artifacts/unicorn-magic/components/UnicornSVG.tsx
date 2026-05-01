import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

type Zone = 'body' | 'mane' | 'horn' | 'tail';
interface UnicornColors { body: string; mane: string; horn: string; tail: string }
interface UnicornSVGProps {
  colors: UnicornColors; mode: 'dress' | 'paint';
  sparkles?: boolean; onZonePress: (zone: Zone) => void; showWings?: boolean;
}

const MANE = ['#ff9de2', '#ff6eb4', '#c77dff', '#74b5ff', '#4dd9ac', '#ffda5c'];
const TAIL = ['#c77dff', '#74b5ff', '#4dd9ac', '#8bdd4e', '#ffda5c'];

export default function UnicornSVG({ colors, mode, onZonePress, showWings }: UnicornSVGProps) {
  const isPaint = mode === 'paint';
  const body  = isPaint ? '#f0ecff' : colors.body;
  const mane  = isPaint ? '#ddd6ff' : colors.mane;
  const horn  = isPaint ? '#fff8d6' : colors.horn;
  const tail  = isPaint ? '#ddd6ff' : colors.tail;
  const str   = isPaint ? '#CECBF6' : 'none';
  const sw    = isPaint ? 1.5 : 0;

  // Helpers — stroke-based flowing hair strands
  const mc = (i: number) => isPaint ? mane : MANE[i % MANE.length];
  const tc = (i: number) => isPaint ? tail : TAIL[i % TAIL.length];

  // Pressed zone handlers
  const B = { stroke: str, strokeWidth: sw, onPress: () => onZonePress('body') };
  const M = { stroke: str, strokeWidth: sw, onPress: () => onZonePress('mane') };
  const H = { stroke: str, strokeWidth: sw, onPress: () => onZonePress('horn') };
  const T = { stroke: str, strokeWidth: sw, onPress: () => onZonePress('tail') };

  // Thick wavy strand helper (strokeLinecap round = natural tapered ends)
  const strand = (
    d: string, color: string, width: number,
    op = 1, onP = () => {}
  ) => (
    <Path d={d} stroke={color} strokeWidth={width} strokeLinecap="round"
      strokeLinejoin="round" fill="none" strokeOpacity={op} onPress={onP} />
  );

  return (
    <View style={styles.container}>
      {/*
        ViewBox 0 0 380 310  →  rendered 295 × 241
        Unicorn faces RIGHT.  Ground ≈ y=295.
        Prancing pose: near front leg is raised.

        Draw order:
          tail strands → far back leg → far front leg →
          body → neck → mane back strands →
          head → ear → horn → near back leg →
          near front leg (raised) → mane forelock strands →
          eye + details
      */}
      <Svg viewBox="0 0 380 310" width={295} height={241}>
        <Defs>
          <LinearGradient id="hornG" x1="0.3" y1="1" x2="0.7" y2="0">
            <Stop offset="0"   stopColor="#c8960a" />
            <Stop offset="0.5" stopColor="#ffd700" />
            <Stop offset="1"   stopColor="#fffce0" />
          </LinearGradient>
          <LinearGradient id="bodyG" x1="0" y1="0" x2="0.2" y2="1">
            <Stop offset="0"   stopColor="#ffffff" />
            <Stop offset="0.6" stopColor="#f5f0ff" />
            <Stop offset="1"   stopColor="#ede8ff" />
          </LinearGradient>
        </Defs>

        {/* ══════════════  TAIL — thick wavy strands  ══════════════════════
            Rump at ≈ (68, 202).  Each strand sweeps left then back in a wave. */}

        {strand("M 70,200 C 36,210 8,244 15,277 C 22,305 54,313 84,298 C 106,286 118,264 112,248",
          tc(0), 17, 1, () => onZonePress('tail'))}
        {strand("M 70,203 C 40,216 14,248 20,276 C 27,298 56,306 82,293",
          tc(1), 14, 1, () => onZonePress('tail'))}
        {strand("M 70,207 C 44,222 22,252 28,276 C 35,296 58,302 80,290 C 96,281 104,264 100,250",
          tc(2), 13, 1, () => onZonePress('tail'))}
        {strand("M 70,211 C 48,226 30,254 35,274 C 42,292 62,297 78,285",
          tc(3), 11, 1, () => onZonePress('tail'))}
        {strand("M 70,214 C 52,228 38,254 42,272 C 48,287 64,290 76,279",
          tc(4), 9,  1, () => onZonePress('tail'))}

        {/* Tail tint overlay (dress mode) */}
        {!isPaint && strand(
          "M 70,200 C 36,210 8,244 15,277 C 22,305 54,313 84,298",
          tail, 20, 0.24, () => onZonePress('tail')
        )}
        {/* Tail sheen */}
        {!isPaint && strand("M 60,208 C 28,228 12,262 22,290", "white", 5, 0.3)}

        {/* ══════════════  FAR (background) LEGS  ══════════════════════════ */}
        {/* Far hind */}
        <Path d="M 92,221 C 90,250 88,273 90,294 C 92,302 104,302 106,294
                  C 108,273 107,250 100,221 Z"
          fill={body} fillOpacity={0.78} {...B} />
        {/* Far front — slightly bent, stepping pose */}
        <Path d="M 220,208 C 218,235 216,260 218,282 C 220,292 232,292 234,282
                  C 236,260 235,235 228,208 Z"
          fill={body} fillOpacity={0.78} {...B} />

        {/* ══════════════  BODY — elegant horse torso  ══════════════════════
            Back has a subtle arch (peak at mid-back ≈ y=108).            */}
        <Path
          d="M 256,130
             C 220,112 170,106 124,112
             C 98,116 80,130 72,150
             C 63,172 62,198 68,212
             C 100,236 170,244 240,232
             C 258,228 272,215 274,194
             C 278,168 272,140 256,130 Z"
          fill={isPaint ? body : "url(#bodyG)"} {...B}
        />
        {/* Chest muscle highlight */}
        {!isPaint && <Path d="M 258,150 C 264,168 270,188 268,208 C 262,196 258,176 254,152 Z"
          fill="white" fillOpacity={0.22} onPress={() => onZonePress('body')} />}
        {/* Back top highlight */}
        {!isPaint && <Path d="M 140,142 C 175,120 225,116 262,134 C 225,112 170,118 140,142 Z"
          fill="white" fillOpacity={0.45} onPress={() => onZonePress('body')} />}
        {/* Ground shadow */}
        {!isPaint && <Ellipse cx={178} cy={298} rx={118} ry={7} fill="#534AB7" fillOpacity={0.06} />}

        {/* ── Constellation stars on coat ─────────────── */}
        {!isPaint && <>
          <Circle cx={152} cy={170} r={2.8} fill="#c77dff" fillOpacity={0.55} />
          <Circle cx={172} cy={155} r={2}   fill="#c77dff" fillOpacity={0.45} />
          <Circle cx={194} cy={174} r={2.5} fill="#c77dff" fillOpacity={0.50} />
          <Circle cx={164} cy={186} r={2.2} fill="#74b5ff" fillOpacity={0.48} />
          <Circle cx={144} cy={188} r={1.8} fill="#74b5ff" fillOpacity={0.42} />
          <Circle cx={186} cy={159} r={1.6} fill="#c77dff" fillOpacity={0.40} />
          <Circle cx={210} cy={172} r={2}   fill="#74b5ff" fillOpacity={0.45} />
          <Path d="M 152,170 L 172,155 L 194,174 L 164,186 L 144,188"
            stroke="#c77dff" strokeWidth={0.7} strokeOpacity={0.28} fill="none" />
          <Path d="M 186,159 L 194,174 L 210,172"
            stroke="#74b5ff" strokeWidth={0.7} strokeOpacity={0.25} fill="none" />
        </>}

        {/* ══════════════  NECK — long, arching  ═══════════════════════════
            Crest sweeps from withers (256,130) up to poll (283,46).     */}
        <Path
          d="M 256,130
             C 248,102 264,62 283,46
             C 288,46 296,63 300,108
             C 292,126 278,138 270,150
             C 263,142 260,136 256,130 Z"
          fill={isPaint ? body : "url(#bodyG)"} {...B}
        />
        {!isPaint && <Path d="M 260,132 C 253,105 266,68 283,50"
          stroke="white" strokeWidth={7} strokeOpacity={0.22} strokeLinecap="round" fill="none" />}

        {/* ══════════════  MANE — BACK STRANDS  ════════════════════════════
            6 thick wavy strands flowing from poll (283,46) down and left,
            continuing past shoulder for a dramatic cascade.
            S-curves give the wavy, flowing-hair look.                   */}

        {/* S0 — hot pink, outermost, longest arc */}
        {strand("M 283,50 C 255,62 224,88 214,122 C 203,158 215,186 230,202 C 240,214 252,218 258,224",
          mc(0), 17, 1, () => onZonePress('mane'))}
        {/* S1 — magenta */}
        {strand("M 285,48 C 260,62 234,88 228,120 C 220,154 228,180 245,196 C 255,207 266,212 272,218",
          mc(1), 15, 1, () => onZonePress('mane'))}
        {/* S2 — purple */}
        {strand("M 288,47 C 267,61 244,86 242,118 C 238,150 244,174 259,190 C 268,200 278,204 283,210",
          mc(2), 14, 1, () => onZonePress('mane'))}
        {/* S3 — sky blue */}
        {strand("M 292,47 C 274,61 256,86 256,117 C 254,148 258,170 272,186 C 280,196 290,200 295,205",
          mc(3), 13, 1, () => onZonePress('mane'))}
        {/* S4 — teal, shorter */}
        {strand("M 296,47 C 281,61 268,86 270,115 C 272,144 272,164 284,180 C 291,189 300,193 305,198",
          mc(4), 12, 1, () => onZonePress('mane'))}
        {/* S5 — wispy pink extension (very long, creates flowing-below-chest effect) */}
        {strand("M 282,52 C 250,70 218,112 205,158 C 192,204 202,232 225,244",
          mc(0), 8, 0.65, () => onZonePress('mane'))}
        {/* S6 — yellow accent wisp */}
        {strand("M 297,48 C 281,63 264,90 266,120 C 268,148 270,166 281,182 C 288,192 297,196 301,202",
          mc(5), 7, 0.75, () => onZonePress('mane'))}

        {/* Mane sheen */}
        {!isPaint && strand("M 280,56 C 252,75 225,112 220,155 C 213,196 222,222 238,236",
          "white", 4, 0.28)}

        {/* Mane tint overlay — dress mode zone colour */}
        {!isPaint && strand(
          "M 283,50 C 255,62 224,88 214,122 C 203,158 215,186 230,202 C 240,214 252,218 258,224",
          mane, 22, 0.25, () => onZonePress('mane')
        )}

        {/* ══════════════  HEAD  ═══════════════════════════════════════════
            Slightly elongated — horse-like. cx=306, cy=88.              */}
        <Ellipse cx={306} cy={88} rx={58} ry={52} fill={body} {...B} />
        {/* Muzzle / longer nose for horse proportions */}
        <Path d="M 340,100 C 352,100 368,110 370,125 C 370,138 358,148 346,146
                  C 336,144 330,134 330,120 C 330,108 334,100 340,100 Z"
          fill={body} {...B} />
        {/* Nostril */}
        <Ellipse cx={364} cy={133} rx={5} ry={6} fill="#ffb6d0" fillOpacity={0.6}
          onPress={() => onZonePress('body')} />
        {/* Upper lip / smile */}
        <Path d="M 350,142 C 357,150 366,151 371,146"
          stroke="#c77dff" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        {/* Head top highlight */}
        {!isPaint && <>
          <Path d="M 265,70 C 280,53 310,47 338,58 C 310,44 278,52 265,70 Z"
            fill="white" fillOpacity={0.42} onPress={() => onZonePress('body')} />
          <Ellipse cx={295} cy={78} rx={26} ry={15} fill="white" fillOpacity={0.18}
            onPress={() => onZonePress('body')} />
        </>}

        {/* ══════════════  EAR  ════════════════════════════════════════════ */}
        <Path d="M 280,60 L 292,32 L 318,56 Z" fill={body} {...B} />
        <Path d="M 284,58 L 292,38 L 313,56 Z" fill="#ffb6c1" fillOpacity={0.88}
          onPress={() => onZonePress('mane')} />

        {/* ══════════════  HORN — tall, spiraling  ═════════════════════════
            Base ≈ (283,66)–(302,62). Tip at (348,2).                    */}
        <Path d="M 283,66 L 348,2 L 306,62 Z" fill="url(#hornG)" {...H} />
        {/* Shaded right face */}
        {!isPaint && <Path d="M 304,64 L 348,2 L 318,60 Z"
          fill="#8b6500" fillOpacity={0.13} onPress={() => onZonePress('horn')} />}
        {/* Highlight left face */}
        {!isPaint && <Path d="M 283,66 L 348,2 L 306,34 Z"
          fill="white" fillOpacity={0.28} onPress={() => onZonePress('horn')} />}
        {/* Glowing tip */}
        {!isPaint && <Circle cx={348} cy={4} r={6} fill="white" fillOpacity={0.55} />}
        {/* Spiral groove lines — diagonal across horn for wrapped-spiral look */}
        <Path d="M 289,63 L 306,57" stroke="white" strokeWidth={1.6} strokeOpacity={0.65} strokeLinecap="round" fill="none" />
        <Path d="M 296,57 L 314,50" stroke="white" strokeWidth={1.6} strokeOpacity={0.65} strokeLinecap="round" fill="none" />
        <Path d="M 304,49 L 322,41" stroke="white" strokeWidth={1.6} strokeOpacity={0.65} strokeLinecap="round" fill="none" />
        <Path d="M 312,40 L 330,31" stroke="white" strokeWidth={1.6} strokeOpacity={0.65} strokeLinecap="round" fill="none" />
        <Path d="M 320,30 L 337,21" stroke="white" strokeWidth={1.6} strokeOpacity={0.65} strokeLinecap="round" fill="none" />
        <Path d="M 328,20 L 343,12" stroke="white" strokeWidth={1.6} strokeOpacity={0.65} strokeLinecap="round" fill="none" />
        <Path d="M 337,10 L 347,5"  stroke="white" strokeWidth={1.6} strokeOpacity={0.65} strokeLinecap="round" fill="none" />

        {/* ══════════════  NEAR HIND LEG — standing  ═══════════════════════ */}
        <Path d="M 108,223 C 106,252 104,275 106,295 C 108,304 122,304 124,295
                  C 126,275 125,252 118,223 Z"
          fill={body} {...B} />
        {!isPaint && <>
          <Path d="M 112,228 C 110,255 110,278 113,293"
            stroke="white" strokeWidth={4} strokeOpacity={0.28} strokeLinecap="round" fill="none" />
          <Path d="M 96,224 C 94,252 94,275 97,292"
            stroke="white" strokeWidth={3.5} strokeOpacity={0.20} strokeLinecap="round" fill="none" />
          <Path d="M 224,210 C 222,238 222,262 225,280"
            stroke="white" strokeWidth={3.5} strokeOpacity={0.20} strokeLinecap="round" fill="none" />
        </>}

        {/* ══════════════  NEAR FRONT LEG — RAISED (prancing)  ════════════
            Upper leg: shoulder → knee (forward + slightly up).
            Lower leg: knee → hanging hoof.                               */}
        {/* Upper leg (shoulder to raised knee) */}
        <Path
          d="M 255,208
             C 264,200 276,192 290,188
             C 292,196 288,200 280,204
             C 273,206 265,208 260,210 Z"
          fill={body} {...B}
        />
        {/* Lower leg + hoof (hanging from raised knee) */}
        <Path
          d="M 290,188
             C 290,206 288,228 285,254
             L 281,266
             C 281,272 287,276 293,275
             C 299,274 302,268 301,262
             L 298,250
             C 297,226 297,206 290,188 Z"
          fill={body} {...B}
        />
        {!isPaint && <Path d="M 291,192 C 291,214 290,238 288,260"
          stroke="white" strokeWidth={4} strokeOpacity={0.28} strokeLinecap="round" fill="none" />}

        {/* ══════════════  HOOVES  ═════════════════════════════════════════ */}
        {/* Hind far */}
        <Path d="M 89,294 C 88,300 90,306 94,306 L 106,306 C 110,306 112,300 111,294 Z"
          fill="#AFA9EC" onPress={() => onZonePress('body')} />
        {/* Hind near */}
        <Path d="M 105,295 C 104,301 106,307 110,307 L 122,307 C 126,307 128,301 127,295 Z"
          fill="#AFA9EC" onPress={() => onZonePress('body')} />
        {/* Front far */}
        <Path d="M 217,282 C 216,289 218,294 222,294 L 233,294 C 237,294 239,289 238,282 Z"
          fill="#AFA9EC" onPress={() => onZonePress('body')} />
        {/* Front near (raised — hoof at bottom of hanging lower leg) */}
        <Path d="M 280,266 C 280,272 283,277 288,276 L 298,275 C 302,274 304,269 303,263 Z"
          fill="#AFA9EC" onPress={() => onZonePress('body')} />

        {/* ══════════════  MANE FORELOCK — over face  ══════════════════════
            4 thick wavy strands flowing forward from horn base over face. */}

        {/* F0 — teal (behind) */}
        {strand("M 300,56 C 318,74 326,104 319,128", mc(4), 10, 0.92, () => onZonePress('mane'))}
        {/* F1 — purple */}
        {strand("M 307,53 C 328,73 337,106 332,132", mc(2), 11, 0.90, () => onZonePress('mane'))}
        {/* F2 — hot pink (widest forelock) */}
        {strand("M 315,51 C 338,72 348,108 344,136", mc(1), 12, 0.88, () => onZonePress('mane'))}
        {/* F3 — yellow */}
        {strand("M 323,50 C 348,74 359,112 355,142", mc(5), 8, 0.80, () => onZonePress('mane'))}
        {/* Forelock sheen */}
        {!isPaint && strand("M 308,58 C 326,78 334,108 328,132", "white", 4, 0.22)}
        {/* Forelock tint overlay */}
        {!isPaint && strand("M 307,53 C 328,73 337,106 332,132 M 315,51 C 338,72 348,108 344,136",
          mane, 15, 0.24, () => onZonePress('mane'))}

        {/* ══════════════  EYE  ════════════════════════════════════════════
            Head cx=306, cy=88.  Eye at (326, 76).
            Large, glassy, intelligent — almond shaped.                  */}
        {/* Sclera */}
        <Ellipse cx={326} cy={79} rx={23} ry={21} fill="#fffef8" />
        {/* Iris layers */}
        <Circle cx={326} cy={79} r={16} fill="#1a0d55" />
        <Circle cx={326} cy={79} r={12} fill="#6b3fb5" />
        <Circle cx={326} cy={79} r={9}  fill="#9462d8" />
        {/* Pupil */}
        <Circle cx={326} cy={81} r={6}  fill="#07031a" />
        {/* Highlights */}
        <Circle cx={333} cy={71} r={8.5} fill="white" />
        <Circle cx={314} cy={88} r={4.2} fill="white" fillOpacity={0.78} />
        <Circle cx={332} cy={88} r={2.4} fill="white" fillOpacity={0.60} />
        <Circle cx={316} cy={72} r={1.8} fill="white" fillOpacity={0.45} />
        {/* Upper eyelid — almond shape */}
        <Path d="M 303,74 C 312,62 340,62 348,74"
          stroke="#1a0d55" strokeWidth={3} strokeLinecap="round" fill="none" />
        {/* Eyelashes */}
        <Path d="M 306,73 L 300,62"  stroke="#1a0d55" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <Path d="M 313,67 L 311,56"  stroke="#1a0d55" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <Path d="M 322,64 L 322,53"  stroke="#1a0d55" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <Path d="M 331,65 L 334,54"  stroke="#1a0d55" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <Path d="M 340,70 L 345,60"  stroke="#1a0d55" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        {/* Lower lash line */}
        <Path d="M 304,85 C 316,98 338,98 348,90"
          stroke="#1a0d55" strokeWidth={1.1} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
        {/* Rosy cheek blush */}
        <Ellipse cx={320} cy={108} rx={16} ry={9} fill="#ff9de2" fillOpacity={0.36} />

        {/* ══════════════  WINGS (alicorn mode)  ═══════════════════════════ */}
        {showWings && <>
          <Path
            d="M 110,165 C 68,140 36,160 48,190 C 55,204 80,196 98,178
               C 78,192 68,212 80,226 C 87,232 109,220 113,202 Z"
            fill={mc(0)} fillOpacity={0.90} {...M}
          />
          <Path d="M 42,172 C 26,186 24,206 36,218 C 30,204 32,186 42,174 Z"
            fill={mc(2)} fillOpacity={0.65} {...M} />
        </>}

      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
