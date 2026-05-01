import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

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

// Lisa Frank rainbow palette — drawn back-to-front on mane and tail
const MANE_RAINBOW  = ['#ff9de2', '#ff6eb4', '#c77dff', '#74b5ff', '#4dd9ac', '#ffda5c'];
const TAIL_RAINBOW  = ['#c77dff', '#74b5ff', '#4dd9ac', '#8bdd4e', '#ffda5c'];

export default function UnicornSVG({
  colors,
  mode,
  sparkles,
  onZonePress,
  showWings,
}: UnicornSVGProps) {
  const isPaint = mode === 'paint';

  const bodyFill = isPaint ? '#f2eeff' : colors.body;
  const maneFill = isPaint ? '#e8dfff' : colors.mane;
  const hornFill = isPaint ? '#fff9dd' : colors.horn;
  const tailFill = isPaint ? '#e8dfff' : colors.tail;
  const stroke   = isPaint ? '#CECBF6' : 'none';
  const sw       = isPaint ? 1.5 : 0;

  // In dress mode → rainbow stripe; in paint mode → flat zone color
  const mC = (i: number) => isPaint ? maneFill : MANE_RAINBOW[i % MANE_RAINBOW.length];
  const tC = (i: number) => isPaint ? tailFill  : TAIL_RAINBOW[i  % TAIL_RAINBOW.length];

  const B = { stroke, strokeWidth: sw, onPress: () => onZonePress('body') };
  const M = { stroke, strokeWidth: sw, onPress: () => onZonePress('mane') };
  const H = { stroke, strokeWidth: sw, onPress: () => onZonePress('horn') };
  const T = { stroke, strokeWidth: sw, onPress: () => onZonePress('tail') };

  return (
    <View style={styles.container}>
      {/*
        ViewBox 0 0 360 305  |  rendered 295 × 250
        Unicorn faces RIGHT.
        Draw order: tail → back-legs → body → front-legs → hooves
                  → neck → [mane-back] → head → ear → horn
                  → [mane-front] → eye → details
      */}
      <Svg viewBox="0 0 360 305" width={295} height={250}>

        {/* ═══════════════  TAIL  ═══════════════════════════════════════ */}
        {/* 5 rainbow layers, outermost (purple) to innermost (yellow)    */}
        <Path
          d="M 68,175 C 16,164 -2,220 14,258 C 25,288 53,297 69,274
             C 81,254 79,222 68,184 Z"
          fill={tC(0)} {...T}
        />
        <Path
          d="M 62,177 C 28,180 14,222 24,252 C 32,270 54,272 64,258
             C 52,268 36,260 32,245 C 24,224 36,185 62,182 Z"
          fill={tC(1)} {...T}
        />
        <Path
          d="M 54,179 C 30,194 22,222 28,248 C 34,262 48,262 58,250
             C 46,258 36,250 34,236 C 30,215 40,190 54,184 Z"
          fill={tC(2)} {...T}
        />
        <Path
          d="M 46,181 C 30,198 26,222 30,245 C 34,257 46,257 54,247
             C 44,255 37,247 36,234 C 32,214 38,196 46,186 Z"
          fill={tC(3)} {...T}
        />
        <Path
          d="M 38,183 C 28,200 26,222 30,242 C 34,252 44,252 48,244
             C 40,250 34,243 33,232 C 30,214 33,198 38,188 Z"
          fill={tC(4)} {...T}
        />
        {/* Tint overlay (dress mode) so zone-colour affects the tail    */}
        {!isPaint && (
          <Path
            d="M 68,175 C 16,164 -2,220 14,258 C 25,288 53,297 69,274
               C 81,254 79,222 68,184 Z"
            fill={tailFill} fillOpacity={0.28}
            onPress={() => onZonePress('tail')}
          />
        )}
        {/* Sheen */}
        {!isPaint && (
          <Path
            d="M 64,182 C 38,194 26,228 36,256"
            stroke="white" strokeWidth={5} strokeOpacity={0.3}
            strokeLinecap="round" fill="none"
          />
        )}

        {/* ═══════════════  BACK LEGS  ══════════════════════════════════ */}
        <Path
          d="M 122,257 C 118,270 116,287 118,298 C 120,304 134,304 136,298
             C 138,287 136,270 129,257 Z"
          fill={bodyFill} {...B}
        />
        <Path
          d="M 93,257 C 89,270 87,287 89,298 C 91,304 106,304 108,298
             C 110,287 108,270 101,257 Z"
          fill={bodyFill} {...B}
        />
        {!isPaint && (
          <>
            <Path d="M 97,260 C 94,272 93,288 96,297" stroke="white" strokeWidth={4} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
            <Path d="M 126,260 C 123,272 122,288 125,297" stroke="white" strokeWidth={4} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
          </>
        )}

        {/* ═══════════════  BODY  ═══════════════════════════════════════ */}
        {/* Soft ground shadow */}
        {!isPaint && (
          <Ellipse cx={182} cy={272} rx={114} ry={9} fill="#534AB7" fillOpacity={0.07} />
        )}
        {/* Main body */}
        <Ellipse cx={182} cy={202} rx={120} ry={76} fill={bodyFill} {...B} />
        {/* Top highlight */}
        {!isPaint && (
          <>
            <Path
              d="M 138,150 C 162,132 210,131 246,144 C 214,127 160,129 138,150 Z"
              fill="white" fillOpacity={0.5}
              onPress={() => onZonePress('body')}
            />
            <Ellipse cx={180} cy={164} rx={42} ry={22}
              fill="white" fillOpacity={0.2}
              onPress={() => onZonePress('body')}
            />
          </>
        )}
        {/* Belly shading */}
        {!isPaint && (
          <Path
            d="M 80,248 C 110,264 272,264 292,248 C 272,260 110,260 80,248 Z"
            fill="#534AB7" fillOpacity={0.05}
            onPress={() => onZonePress('body')}
          />
        )}

        {/* ═══════════════  FRONT LEGS  ═════════════════════════════════ */}
        <Path
          d="M 217,254 C 213,267 211,284 213,295 C 215,301 229,301 231,295
             C 233,284 231,267 224,254 Z"
          fill={bodyFill} {...B}
        />
        <Path
          d="M 245,252 C 241,265 239,282 241,293 C 243,299 258,299 260,293
             C 262,282 260,265 252,252 Z"
          fill={bodyFill} {...B}
        />
        {!isPaint && (
          <>
            <Path d="M 221,257 C 218,269 217,285 220,294" stroke="white" strokeWidth={4} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
            <Path d="M 249,255 C 246,267 245,283 248,292" stroke="white" strokeWidth={4} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
          </>
        )}

        {/* ═══════════════  HOOVES  ═════════════════════════════════════ */}
        <Ellipse cx={99}  cy={301} rx={11} ry={5} fill="#AFA9EC" onPress={() => onZonePress('body')} />
        <Ellipse cx={128} cy={301} rx={11} ry={5} fill="#AFA9EC" onPress={() => onZonePress('body')} />
        <Ellipse cx={222} cy={298} rx={11} ry={5} fill="#AFA9EC" onPress={() => onZonePress('body')} />
        <Ellipse cx={250} cy={296} rx={11} ry={5} fill="#AFA9EC" onPress={() => onZonePress('body')} />

        {/* ═══════════════  NECK  ═══════════════════════════════════════ */}
        <Path
          d="M 270,153 Q 292,112 312,104 L 334,114 Q 320,152 298,166 Z"
          fill={bodyFill} {...B}
        />
        {!isPaint && (
          <Path
            d="M 280,151 Q 298,115 316,107"
            stroke="white" strokeWidth={5} strokeOpacity={0.28}
            strokeLinecap="round" fill="none"
          />
        )}

        {/* ═══════════════  WINGS (alicorn)  ═══════════════════════════ */}
        {showWings && (
          <>
            <Path
              d="M 112,165 C 74,142 42,160 54,188 C 60,200 82,193 99,177
                 C 80,191 70,208 82,221 C 89,227 108,216 112,200 Z"
              fill={mC(0)} fillOpacity={0.92} {...M}
            />
            <Path
              d="M 48,174 C 32,186 30,204 40,216 C 34,202 36,186 48,176 Z"
              fill={mC(1)} fillOpacity={0.7} {...M}
            />
            <Path
              d="M 42,194 C 26,206 24,224 34,234 C 28,222 30,206 42,196 Z"
              fill={mC(2)} fillOpacity={0.6} {...M}
            />
          </>
        )}

        {/* ═══════════════  MANE — BACK LAYERS (behind head)  ══════════ */}
        {/* Layer 0 — hot pink, outermost — sweeps far left for visibility */}
        <Path
          d="M 286,82 C 246,90 206,122 202,164
             C 198,198 234,206 264,188
             C 240,196 214,190 216,165
             C 220,124 250,98 286,86 Z"
          fill={mC(0)} {...M}
        />
        {/* Layer 1 — purple */}
        <Path
          d="M 291,80 C 256,90 221,122 217,163
             C 213,193 247,200 272,183
             C 250,191 226,185 228,163
             C 232,124 260,98 291,84 Z"
          fill={mC(1)} {...M}
        />
        {/* Layer 2 — sky blue */}
        <Path
          d="M 296,80 C 266,91 236,122 232,162
             C 228,188 259,194 280,178
             C 261,186 240,181 242,161
             C 246,123 268,98 296,84 Z"
          fill={mC(2)} {...M}
        />
        {/* Layer 3 — teal (innermost back strand) */}
        <Path
          d="M 302,80 C 278,92 254,122 250,160
             C 246,184 272,190 290,175
             C 274,183 256,178 258,158
             C 262,122 280,98 302,84 Z"
          fill={mC(3)} {...M}
        />
        {/* Back-mane sheen */}
        {!isPaint && (
          <Path
            d="M 282,89 C 244,106 222,138 224,168"
            stroke="white" strokeWidth={5} strokeOpacity={0.3}
            strokeLinecap="round" fill="none"
          />
        )}

        {/* ═══════════════  HEAD  ═══════════════════════════════════════ */}
        {/* Main head — rounder, bigger than before */}
        <Ellipse cx={302} cy={114} rx={62} ry={58} fill={bodyFill} {...B} />
        {/* Snout */}
        <Ellipse cx={352} cy={136} rx={17} ry={15} fill={bodyFill} {...B} />
        {!isPaint && (
          <Ellipse cx={352} cy={143} rx={15} ry={9}
            fill="#534AB7" fillOpacity={0.04}
            onPress={() => onZonePress('body')}
          />
        )}
        {/* Head highlight */}
        {!isPaint && (
          <>
            <Path
              d="M 264,94 C 276,79 300,73 326,81 C 300,69 274,77 264,94 Z"
              fill="white" fillOpacity={0.45}
              onPress={() => onZonePress('body')}
            />
            <Ellipse cx={292} cy={102} rx={25} ry={17}
              fill="white" fillOpacity={0.22}
              onPress={() => onZonePress('body')}
            />
          </>
        )}

        {/* ═══════════════  EAR  ════════════════════════════════════════ */}
        <Path d="M 280,82 L 292,56 L 315,80 Z" fill={bodyFill} {...B} />
        {/* Pink inner ear */}
        <Path d="M 284,80 L 292,62 L 309,79 Z" fill="#ffb6c1" fillOpacity={0.88}
          onPress={() => onZonePress('mane')}
        />

        {/* ═══════════════  HORN  ═══════════════════════════════════════ */}
        {/* Main horn shape */}
        <Path d="M 287,88 L 340,10 L 314,84 Z" fill={hornFill} {...H} />
        {/* Shaded right face */}
        {!isPaint && (
          <Path
            d="M 302,85 L 340,10 L 314,84 Z"
            fill="#8b6000" fillOpacity={0.14}
            onPress={() => onZonePress('horn')}
          />
        )}
        {/* Highlight left face */}
        {!isPaint && (
          <Path
            d="M 287,88 L 340,10 L 306,58 Z"
            fill="white" fillOpacity={0.32}
            onPress={() => onZonePress('horn')}
          />
        )}
        {/* Bright tip glow */}
        {!isPaint && (
          <Circle cx={340} cy={12} r={5} fill="white" fillOpacity={0.45} />
        )}
        {/* Spiral grooves */}
        <Path d="M 293,82 L 336,16" stroke="white" strokeWidth={1.6} strokeOpacity={0.62} strokeLinecap="round" fill="none" />
        <Path d="M 299,83 L 337,27" stroke="white" strokeWidth={1.6} strokeOpacity={0.62} strokeLinecap="round" fill="none" />
        <Path d="M 305,84 L 338,40" stroke="white" strokeWidth={1.6} strokeOpacity={0.62} strokeLinecap="round" fill="none" />
        <Path d="M 311,84 L 339,52" stroke="white" strokeWidth={1.6} strokeOpacity={0.62} strokeLinecap="round" fill="none" />
        <Path d="M 317,84 L 339,64" stroke="white" strokeWidth={1.6} strokeOpacity={0.62} strokeLinecap="round" fill="none" />

        {/* ═══════════════  MANE — FRONT LAYERS (over head)  ═══════════ */}
        {/* Front bulk — teal */}
        <Path
          d="M 313,82 C 296,102 290,128 296,147 C 304,162 322,157 328,142
             C 333,128 326,107 316,95
             C 328,110 330,132 325,147 C 319,159 305,154 298,142
             C 292,126 298,103 313,85 Z"
          fill={mC(3)} {...M}
        />
        {/* Purple forelock wisp */}
        <Path
          d="M 317,82 C 334,101 337,126 328,141 C 338,124 336,101 318,85 Z"
          fill={mC(1)} fillOpacity={isPaint ? 1 : 0.9} {...M}
        />
        {/* Yellow forelock tip */}
        <Path
          d="M 322,83 C 341,104 345,130 334,147 C 346,128 343,104 323,85 Z"
          fill={isPaint ? maneFill : MANE_RAINBOW[5]}
          fillOpacity={isPaint ? 1 : 0.88} {...M}
        />
        {/* Front-mane sheen */}
        {!isPaint && (
          <Path
            d="M 306,88 C 291,110 290,134 296,150"
            stroke="white" strokeWidth={4} strokeOpacity={0.28}
            strokeLinecap="round" fill="none"
          />
        )}
        {/* Mane tint overlay — user zone-colour tints the rainbow */}
        {!isPaint && (
          <>
            <Path
              d="M 286,82 C 246,90 206,122 202,164
                 C 198,198 234,206 264,188
                 C 240,196 214,190 216,165
                 C 220,124 250,98 286,86 Z"
              fill={maneFill} fillOpacity={0.27}
              onPress={() => onZonePress('mane')}
            />
            <Path
              d="M 313,82 C 296,102 290,128 296,147 C 304,162 322,157 328,142
                 C 333,128 326,107 316,95
                 C 328,110 330,132 325,147 C 319,159 305,154 298,142
                 C 292,126 298,103 313,85 Z"
              fill={maneFill} fillOpacity={0.27}
              onPress={() => onZonePress('mane')}
            />
          </>
        )}

        {/* ═══════════════  EYE  ════════════════════════════════════════ */}
        {/* White sclera — big and round */}
        <Ellipse cx={324} cy={109} rx={22} ry={21} fill="white" />
        {/* Iris outer (deep indigo) */}
        <Circle cx={324} cy={109} r={16} fill="#1e1060" />
        {/* Iris mid (violet) */}
        <Circle cx={324} cy={109} r={12} fill="#6b3fb5" />
        {/* Iris inner shimmer */}
        <Circle cx={324} cy={109} r={9}  fill="#9462d8" />
        {/* Pupil */}
        <Circle cx={324} cy={111} r={6}  fill="#080418" />
        {/* ── Highlights ── */}
        {/* Large main sparkle (upper-right) */}
        <Circle cx={331} cy={102} r={8}  fill="white" />
        {/* Medium secondary (lower-left) */}
        <Circle cx={314} cy={117} r={4}  fill="white" fillOpacity={0.78} />
        {/* Small glint */}
        <Circle cx={330} cy={116} r={2.2} fill="white" fillOpacity={0.62} />
        {/* Tiny glint */}
        <Circle cx={316} cy={104} r={1.6} fill="white" fillOpacity={0.45} />
        {/* ── Lashes & Lid ── */}
        {/* Upper eyelid arc */}
        <Path
          d="M 302,104 C 309,94 335,94 344,104"
          stroke="#1e1060" strokeWidth={2.8} strokeLinecap="round" fill="none"
        />
        {/* Eyelashes */}
        <Path d="M 305,103 L 300,94"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M 312,98  L 310,89"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M 320,96  L 320,87"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M 328,97  L 331,88"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <Path d="M 336,102 L 340,93"  stroke="#1e1060" strokeWidth={2.2} strokeLinecap="round" fill="none" />
        {/* Lower lash line */}
        <Path
          d="M 303,115 C 314,126 334,126 344,118"
          stroke="#1e1060" strokeWidth={1.1} strokeLinecap="round"
          fill="none" strokeOpacity={0.35}
        />
        {/* Rosy cheek blush */}
        <Ellipse cx={320} cy={136} rx={16} ry={8} fill="#ff9de2" fillOpacity={0.4} />

        {/* ═══════════════  NOSE & SMILE  ═══════════════════════════════ */}
        {/* Nostril */}
        <Ellipse
          cx={360} cy={133} rx={4.5} ry={5.5}
          fill="#ff9de2" fillOpacity={0.4}
          onPress={() => onZonePress('body')}
        />
        {/* Smile */}
        <Path
          d="M 344,142 C 350,149 359,150 364,146"
          stroke="#c77dff" strokeWidth={2.4} strokeLinecap="round" fill="none"
        />

        {/* Sparkles handled by animated overlay in DressScreen */}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
