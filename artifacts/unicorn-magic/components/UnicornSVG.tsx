import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';

type Zone = 'body' | 'mane' | 'horn' | 'tail';

interface UnicornColors {
  body: string;
  mane: string;
  horn: string;
  tail: string;
}

interface UnicornSVGProps {
  colors: UnicornColors;
  mode: 'dress' | 'paint';
  sparkles?: boolean;
  onZonePress: (zone: Zone) => void;
  showWings?: boolean;
}

// Lisa Frank rainbow palette — drawn back-to-front
const MANE_RAINBOW = ['#ff9de2', '#ff6eb4', '#c77dff', '#74b5ff', '#4dd9ac', '#ffda5c'];
const TAIL_RAINBOW = ['#c77dff', '#74b5ff', '#4dd9ac', '#8bdd4e', '#ffda5c'];

export default function UnicornSVG({ colors, mode, sparkles, onZonePress, showWings }: UnicornSVGProps) {
  const isPaint = mode === 'paint';

  const bodyFill = isPaint ? '#f2eeff' : colors.body;
  const maneFill = isPaint ? '#e8dfff' : colors.mane;
  const hornFill = isPaint ? '#fff9dd' : colors.horn;
  const tailFill = isPaint ? '#e8dfff' : colors.tail;
  const stroke   = isPaint ? '#CECBF6' : 'none';
  const sw       = isPaint ? 1.5 : 0;

  const mC = (i: number) => isPaint ? maneFill : MANE_RAINBOW[i % MANE_RAINBOW.length];
  const tC = (i: number) => isPaint ? tailFill  : TAIL_RAINBOW[i  % TAIL_RAINBOW.length];

  const B = { stroke, strokeWidth: sw, onPress: () => onZonePress('body') };
  const M = { stroke, strokeWidth: sw, onPress: () => onZonePress('mane') };
  const H = { stroke, strokeWidth: sw, onPress: () => onZonePress('horn') };
  const T = { stroke, strokeWidth: sw, onPress: () => onZonePress('tail') };

  return (
    <View style={styles.container}>
      {/*
        ViewBox 0 0 370 310  |  rendered 295 × 248
        Unicorn faces RIGHT.  Ground ≈ y=295.
        Anatomy: elegant horse silhouette — long neck, proper torso path, slender legs.

        Draw order:
          tail strands → far (back) legs → body torso → neck →
          mane back layers → head → ear → horn →
          near front legs → mane forelock → eye + details
      */}
      <Svg viewBox="0 0 370 310" width={295} height={248}>
        <Defs>
          <LinearGradient id="hornGrad" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor="#d4a800" />
            <Stop offset="1" stopColor="#fff9a0" />
          </LinearGradient>
        </Defs>

        {/* ════════════════════  TAIL  ════════════════════════════════════
            Long flowing strands from rump (≈68, 205).
            Outermost layer first (widest arc), innermost last.          */}

        {/* Layer 0 — deepest purple, widest sweep */}
        <Path
          d="M 68,200 C 28,200 -4,234 3,266 C 10,294 46,302 76,284
             C 54,292 24,282 20,262 C 14,234 45,208 68,205 Z"
          fill={tC(0)} {...T}
        />
        {/* Layer 1 — blue */}
        <Path
          d="M 68,203 C 34,208 7,238 12,266 C 18,288 48,296 74,279
             C 54,286 30,276 26,258 C 21,236 48,215 68,207 Z"
          fill={tC(1)} {...T}
        />
        {/* Layer 2 — teal */}
        <Path
          d="M 67,206 C 38,215 14,242 19,266 C 25,284 50,290 72,275
             C 54,282 36,272 32,256 C 28,238 50,220 67,210 Z"
          fill={tC(2)} {...T}
        />
        {/* Layer 3 — green */}
        <Path
          d="M 66,209 C 42,220 22,246 26,266 C 31,282 52,286 70,272
             C 54,278 40,268 37,254 C 34,238 50,224 66,213 Z"
          fill={tC(3)} {...T}
        />
        {/* Layer 4 — yellow, innermost */}
        <Path
          d="M 65,212 C 46,223 30,247 34,265 C 38,279 54,282 68,270
             C 54,276 43,267 41,254 C 38,240 50,226 65,215 Z"
          fill={tC(4)} {...T}
        />
        {/* Tail tint overlay (dress mode) */}
        {!isPaint && (
          <Path
            d="M 68,200 C 28,200 -4,234 3,266 C 10,294 46,302 76,284
               C 54,292 24,282 20,262 C 14,234 45,208 68,205 Z"
            fill={tailFill} fillOpacity={0.26} onPress={() => onZonePress('tail')}
          />
        )}
        {/* Tail sheen */}
        {!isPaint && (
          <Path d="M 58,208 C 26,228 12,260 22,282"
            stroke="white" strokeWidth={5} strokeOpacity={0.28} strokeLinecap="round" fill="none" />
        )}

        {/* ════════════════════  FAR (back) LEGS  ════════════════════════
            Drawn before body so body overlaps their tops — creates depth. */}

        {/* Far hind leg */}
        <Path
          d="M 90,218 C 87,245 85,268 87,288 C 89,296 101,296 103,288
             C 105,268 104,245 100,218 Z"
          fill={bodyFill} fillOpacity={0.82} {...B}
        />
        {/* Far front leg */}
        <Path
          d="M 214,205 C 211,232 209,258 211,280 C 213,289 225,289 227,280
             C 229,258 228,232 222,205 Z"
          fill={bodyFill} fillOpacity={0.82} {...B}
        />

        {/* ════════════════════  BODY  ════════════════════════════════════
            Proper horse torso — elongated, tapered at both ends.
            Withers (top-front) → back line → rump → belly → chest      */}
        <Path
          d="M 254,130
             C 215,114 166,110 122,114
             C 96,118 78,132 70,150
             C 61,170 60,194 65,210
             C 96,232 164,238 232,228
             C 250,224 264,212 266,192
             C 268,166 264,142 254,130 Z"
          fill={bodyFill} {...B}
        />
        {/* Body top highlight */}
        {!isPaint && (
          <Path
            d="M 138,142 C 168,124 218,120 256,136 C 220,118 166,122 138,142 Z"
            fill="white" fillOpacity={0.48} onPress={() => onZonePress('body')}
          />
        )}
        {/* Subtle belly shading */}
        {!isPaint && (
          <Path
            d="M 80,240 C 120,254 210,254 256,240 C 210,250 120,250 80,240 Z"
            fill="#534AB7" fillOpacity={0.05} onPress={() => onZonePress('body')}
          />
        )}
        {/* Ground shadow */}
        {!isPaint && (
          <Ellipse cx={175} cy={296} rx={112} ry={8} fill="#534AB7" fillOpacity={0.06} />
        )}

        {/* ════════════════════  NEAR HIND LEG  ══════════════════════════ */}
        <Path
          d="M 107,220 C 104,247 102,270 104,290 C 106,298 120,298 122,290
             C 124,270 122,247 116,220 Z"
          fill={bodyFill} {...B}
        />

        {/* ════════════════════  WINGS (optional alicorn)  ════════════════ */}
        {showWings && (
          <>
            <Path
              d="M 108,162 C 68,138 36,158 48,188 C 54,200 78,192 96,176
                 C 76,190 66,208 78,222 C 85,228 106,218 110,200 Z"
              fill={mC(0)} fillOpacity={0.9} {...M}
            />
            <Path
              d="M 42,170 C 26,183 24,202 35,214 C 29,200 31,184 42,172 Z"
              fill={mC(1)} fillOpacity={0.65} {...M}
            />
          </>
        )}

        {/* ════════════════════  NECK  ════════════════════════════════════
            Long elegant arching neck.
            Crest (back edge): withers → poll at (280, 48).
            Throat (front edge): chest area → throatlatch.               */}
        <Path
          d="M 254,130
             C 246,102 262,65 280,48
             C 285,48 293,65 298,110
             C 290,126 276,138 268,148
             C 262,140 258,134 254,130 Z"
          fill={bodyFill} {...B}
        />
        {/* Neck highlight — follows the crest curve */}
        {!isPaint && (
          <Path d="M 258,132 C 252,106 264,72 280,52"
            stroke="white" strokeWidth={6} strokeOpacity={0.26} strokeLinecap="round" fill="none" />
        )}

        {/* ════════════════════  MANE — BACK LAYERS  ══════════════════════
            4 rainbow bands flowing from poll (280,48) down and to the left,
            continuing well past the neck for a dramatic cascade.
            Drawn BEFORE head so head hides the roots.                   */}

        {/* Layer 0 — hot pink, outermost/widest — sweeps to ≈x=182 */}
        <Path
          d="M 278,48 C 234,64 192,114 182,160
             C 175,194 206,210 238,198
             C 214,204 188,196 190,163
             C 196,118 232,72 278,52 Z"
          fill={mC(0)} {...M}
        />
        {/* Layer 1 — purple */}
        <Path
          d="M 283,47 C 245,65 208,114 200,160
             C 193,190 222,204 252,192
             C 230,198 206,190 208,162
             C 213,118 247,70 283,51 Z"
          fill={mC(1)} {...M}
        />
        {/* Layer 2 — sky blue */}
        <Path
          d="M 289,47 C 257,65 226,112 218,158
             C 212,186 238,199 265,188
             C 245,194 224,186 225,160
             C 230,116 260,70 289,51 Z"
          fill={mC(2)} {...M}
        />
        {/* Layer 3 — teal, innermost */}
        <Path
          d="M 295,47 C 268,66 244,112 237,157
             C 231,183 254,196 278,185
             C 260,190 241,183 243,158
             C 247,114 270,70 295,51 Z"
          fill={mC(3)} {...M}
        />
        {/* Mane back sheen */}
        {!isPaint && (
          <Path d="M 278,54 C 240,78 218,122 220,164"
            stroke="white" strokeWidth={5} strokeOpacity={0.28} strokeLinecap="round" fill="none" />
        )}

        {/* ════════════════════  HEAD  ════════════════════════════════════
            Slightly elongated — wider than tall, horse-like.
            cx=302, cy=88 — sits atop the neck.                         */}
        <Ellipse cx={302} cy={88} rx={58} ry={50} fill={bodyFill} {...B} />
        {/* Muzzle / snout protrusion */}
        <Ellipse cx={352} cy={112} rx={17} ry={15} fill={bodyFill} {...B} />
        {!isPaint && (
          <Ellipse cx={352} cy={118} rx={15} ry={9}
            fill="#534AB7" fillOpacity={0.04} onPress={() => onZonePress('body')} />
        )}
        {/* Head highlights */}
        {!isPaint && (
          <>
            <Path
              d="M 262,72 C 276,56 305,50 332,60 C 305,46 274,54 262,72 Z"
              fill="white" fillOpacity={0.44} onPress={() => onZonePress('body')}
            />
            <Ellipse cx={292} cy={80} rx={26} ry={16}
              fill="white" fillOpacity={0.2} onPress={() => onZonePress('body')} />
          </>
        )}

        {/* ════════════════════  EAR  ═════════════════════════════════════ */}
        <Path d="M 278,60 L 290,34 L 314,58 Z" fill={bodyFill} {...B} />
        <Path d="M 282,60 L 290,40 L 311,58 Z" fill="#ffb6c1" fillOpacity={0.9}
          onPress={() => onZonePress('mane')} />

        {/* ════════════════════  HORN  ════════════════════════════════════
            Tall, prominent, spiraling gold horn.                        */}
        {/* Main horn body */}
        <Path d="M 285,66 L 338,8 L 313,64 Z" fill="url(#hornGrad)" {...H} />
        {/* Shaded right face */}
        {!isPaint && (
          <Path d="M 303,65 L 338,8 L 313,64 Z"
            fill="#8b6000" fillOpacity={0.12} onPress={() => onZonePress('horn')} />
        )}
        {/* Highlight left face */}
        {!isPaint && (
          <Path d="M 285,66 L 338,8 L 304,42 Z"
            fill="white" fillOpacity={0.30} onPress={() => onZonePress('horn')} />
        )}
        {/* Horn tip glow */}
        {!isPaint && (
          <Circle cx={338} cy={10} r={5} fill="white" fillOpacity={0.5} />
        )}
        {/* Spiral groove lines */}
        <Path d="M 291,63 L 334,16" stroke="white" strokeWidth={1.5} strokeOpacity={0.6} strokeLinecap="round" fill="none" />
        <Path d="M 297,64 L 335,28" stroke="white" strokeWidth={1.5} strokeOpacity={0.6} strokeLinecap="round" fill="none" />
        <Path d="M 303,65 L 336,40" stroke="white" strokeWidth={1.5} strokeOpacity={0.6} strokeLinecap="round" fill="none" />
        <Path d="M 309,65 L 337,52" stroke="white" strokeWidth={1.5} strokeOpacity={0.6} strokeLinecap="round" fill="none" />

        {/* ════════════════════  NEAR FRONT LEGS  ═════════════════════════
            Drawn AFTER head/neck so they appear in front.               */}
        <Path
          d="M 235,202 C 232,230 230,256 232,278 C 234,288 248,288 250,278
             C 252,256 250,230 243,202 Z"
          fill={bodyFill} {...B}
        />
        {/* Leg sheen */}
        {!isPaint && (
          <>
            <Path d="M 238,206 C 235,232 235,258 238,276"
              stroke="white" strokeWidth={4} strokeOpacity={0.3} strokeLinecap="round" fill="none" />
            <Path d="M 110,224 C 107,250 107,272 110,288"
              stroke="white" strokeWidth={4} strokeOpacity={0.3} strokeLinecap="round" fill="none" />
            <Path d="M 95,220 C 92,246 92,268 95,286"
              stroke="white" strokeWidth={3.5} strokeOpacity={0.22} strokeLinecap="round" fill="none" />
            <Path d="M 218,208 C 215,234 215,260 218,278"
              stroke="white" strokeWidth={3.5} strokeOpacity={0.22} strokeLinecap="round" fill="none" />
          </>
        )}

        {/* ════════════════════  HOOVES  ══════════════════════════════════ */}
        {/* Hind far */}
        <Path d="M 86,288 C 85,294 87,299 90,299 L 103,299 C 106,299 108,294 107,288 Z"
          fill="#AFA9EC" onPress={() => onZonePress('body')} />
        {/* Hind near */}
        <Path d="M 103,290 C 102,296 104,301 107,301 L 120,301 C 123,301 125,296 124,290 Z"
          fill="#AFA9EC" onPress={() => onZonePress('body')} />
        {/* Front far */}
        <Path d="M 210,280 C 209,286 211,291 214,291 L 226,291 C 229,291 231,286 230,280 Z"
          fill="#AFA9EC" onPress={() => onZonePress('body')} />
        {/* Front near */}
        <Path d="M 231,278 C 230,285 232,290 235,290 L 249,290 C 252,290 254,285 253,278 Z"
          fill="#AFA9EC" onPress={() => onZonePress('body')} />

        {/* ════════════════════  MANE — FORELOCK  ═════════════════════════
            Wisps flowing from horn base FORWARD over the face.          */}
        {/* Wisp 0 — teal (behind) */}
        <Path
          d="M 296,52 C 314,70 320,98 313,118 C 323,96 319,70 296,55 Z"
          fill={mC(3)} fillOpacity={isPaint ? 1 : 0.92} {...M}
        />
        {/* Wisp 1 — purple */}
        <Path
          d="M 302,50 C 323,70 330,100 322,122 C 334,98 328,70 302,53 Z"
          fill={mC(1)} fillOpacity={isPaint ? 1 : 0.90} {...M}
        />
        {/* Wisp 2 — hot pink (front) */}
        <Path
          d="M 308,49 C 332,72 340,104 330,128 C 344,102 336,72 308,52 Z"
          fill={mC(0)} fillOpacity={isPaint ? 1 : 0.88} {...M}
        />
        {/* Yellow tip */}
        <Path
          d="M 315,49 C 340,74 348,108 336,132 C 351,106 343,74 315,52 Z"
          fill={isPaint ? maneFill : MANE_RAINBOW[5]} fillOpacity={isPaint ? 1 : 0.85} {...M}
        />
        {/* Forelock sheen */}
        {!isPaint && (
          <Path d="M 305,56 C 320,78 324,106 316,124"
            stroke="white" strokeWidth={4} strokeOpacity={0.25} strokeLinecap="round" fill="none" />
        )}
        {/* Mane tint overlays (dress mode zone-colour tints the rainbow) */}
        {!isPaint && (
          <>
            <Path
              d="M 278,48 C 234,64 192,114 182,160
                 C 175,194 206,210 238,198
                 C 214,204 188,196 190,163
                 C 196,118 232,72 278,52 Z"
              fill={maneFill} fillOpacity={0.26} onPress={() => onZonePress('mane')}
            />
            <Path
              d="M 296,52 C 314,70 320,98 313,118 C 323,96 319,70 296,55 Z
                 M 308,49 C 332,72 340,104 330,128 C 344,102 336,72 308,52 Z"
              fill={maneFill} fillOpacity={0.26} onPress={() => onZonePress('mane')}
            />
          </>
        )}

        {/* ════════════════════  EYE  ═════════════════════════════════════
            Large, glassy, expressive — classic Lisa Frank look.
            Head center ≈ (302,88). Eye at (320, 76).                   */}
        {/* Sclera */}
        <Ellipse cx={322} cy={82} rx={22} ry={21} fill="white" />
        {/* Iris outer (deep indigo) */}
        <Circle cx={322} cy={82} r={16} fill="#1e1060" />
        {/* Iris mid (violet shimmer) */}
        <Circle cx={322} cy={82} r={12} fill="#6b3fb5" />
        {/* Iris inner glow */}
        <Circle cx={322} cy={82} r={9}  fill="#9462d8" />
        {/* Pupil */}
        <Circle cx={322} cy={84} r={6}  fill="#080418" />
        {/* Large main sparkle highlight (upper-right quadrant) */}
        <Circle cx={329} cy={75} r={8}  fill="white" />
        {/* Secondary highlight */}
        <Circle cx={312} cy={90} r={4}  fill="white" fillOpacity={0.78} />
        {/* Small glints */}
        <Circle cx={328} cy={90} r={2.2} fill="white" fillOpacity={0.62} />
        <Circle cx={314} cy={76} r={1.6} fill="white" fillOpacity={0.45} />
        {/* Upper eyelid arc */}
        <Path d="M 300,77 C 307,67 333,67 342,77"
          stroke="#1e1060" strokeWidth={2.8} strokeLinecap="round" fill="none" />
        {/* Eyelashes */}
        <Path d="M 303,76 L 298,66"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M 310,71 L 308,61"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M 318,68 L 318,58"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M 326,69 L 329,59"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M 334,74 L 339,65"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        {/* Lower lash line */}
        <Path d="M 301,88 C 312,100 332,100 342,92"
          stroke="#1e1060" strokeWidth={1.1} strokeLinecap="round" fill="none" strokeOpacity={0.35} />
        {/* Rosy cheek blush */}
        <Ellipse cx={316} cy={108} rx={15} ry={8} fill="#ff9de2" fillOpacity={0.38} />

        {/* ════════════════════  NOSTRIL & SMILE  ═════════════════════════ */}
        <Ellipse cx={360} cy={107} rx={4.5} ry={5.5}
          fill="#ff9de2" fillOpacity={0.40} onPress={() => onZonePress('body')} />
        <Path d="M 343,117 C 350,125 360,125 365,120"
          stroke="#c77dff" strokeWidth={2.4} strokeLinecap="round" fill="none" />

      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
