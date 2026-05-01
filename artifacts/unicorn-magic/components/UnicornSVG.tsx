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


export default function UnicornSVG({ colors, mode, sparkles, onZonePress, showWings }: UnicornSVGProps) {
  const isPaint = mode === 'paint';

  const bodyFill  = isPaint ? '#f4f0ff' : colors.body;
  const maneFill  = isPaint ? '#ede8ff' : colors.mane;
  const hornFill  = isPaint ? '#fffbdd' : colors.horn;
  const tailFill  = isPaint ? '#ede8ff' : colors.tail;
  const stroke    = isPaint ? '#CECBF6' : 'none';
  const sw        = isPaint ? 1.5 : 0;

  const B = { stroke, strokeWidth: sw, onPress: () => onZonePress('body') };
  const M = { stroke, strokeWidth: sw, onPress: () => onZonePress('mane') };
  const H = { stroke, strokeWidth: sw, onPress: () => onZonePress('horn') };
  const T = { stroke, strokeWidth: sw, onPress: () => onZonePress('tail') };

  return (
    <View style={styles.container}>
      {/*
        ViewBox 360 × 305
        Unicorn faces RIGHT.  Drawing order = back → front.
        Zones:
          body  – body, neck, head, legs, hooves, snout
          mane  – mane wisps, ear inner, wing feathers
          horn  – horn
          tail  – tail wisps
      */}
      <Svg viewBox="0 0 360 305" width={295} height={250}>

        {/* ─── TAIL ─────────────────────────────────────────── */}
        {/* Main tail blob – big, round, fluffy */}
        <Path
          d="M 67,174
             C 18,165 -2,218 14,258
             C 25,288 52,297 68,274
             C 80,255 80,224 67,186 Z"
          fill={tailFill} {...T}
        />
        {/* Inner depth wisp */}
        <Path
          d="M 60,183
             C 36,190 21,222 32,250
             C 38,263 53,260 61,248
             C 53,241 44,225 46,210
             C 47,196 54,185 60,185 Z"
          fill={tailFill}
          fillOpacity={isPaint ? 1 : 0.78}
          {...T}
        />
        {/* Forward curl wisp */}
        <Path
          d="M 64,191 C 87,208 89,243 69,256 C 85,244 89,216 73,202 Z"
          fill={tailFill} fillOpacity={isPaint ? 1 : 0.9} {...T}
        />
        {/* Second curl wisp */}
        <Path
          d="M 70,200 C 95,218 95,248 75,260 C 90,250 95,228 82,213 Z"
          fill={tailFill} fillOpacity={isPaint ? 1 : 0.75} {...T}
        />
        {/* Tail highlight sheen */}
        {!isPaint && (
          <Path
            d="M 62,185 C 36,195 24,227 34,254"
            stroke="white" strokeWidth={5} strokeOpacity={0.28} strokeLinecap="round" fill="none"
          />
        )}

        {/* ─── BACK LEGS ────────────────────────────────────── */}
        {/* Further back leg */}
        <Path
          d="M 121,254 C 117,265 115,282 117,295
             C 119,302 134,302 136,295
             C 138,282 136,265 130,254 Z"
          fill={bodyFill} {...B}
        />
        {/* Closer back leg */}
        <Path
          d="M 93,254 C 89,265 87,282 89,295
             C 91,302 107,302 109,295
             C 111,282 109,265 102,254 Z"
          fill={bodyFill} {...B}
        />
        {/* Back leg highlight sheen */}
        {!isPaint && (
          <>
            <Path d="M 97,257 C 94,270 93,287 96,295" stroke="white" strokeWidth={4} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
            <Path d="M 125,257 C 122,270 121,287 124,295" stroke="white" strokeWidth={4} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
          </>
        )}

        {/* ─── BODY ─────────────────────────────────────────── */}
        {/* Soft cast shadow */}
        {!isPaint && (
          <Ellipse cx={183} cy={270} rx={112} ry={10} fill="#26215C" fillOpacity={0.07} />
        )}
        {/* Main body ellipse */}
        <Ellipse cx={183} cy={196} rx={122} ry={80} fill={bodyFill} {...B} />
        {/* Belly shadow */}
        {!isPaint && (
          <Path
            d="M 80,244 C 108,262 272,262 292,244 C 272,257 108,257 80,244 Z"
            fill="#26215C" fillOpacity={0.07}
            onPress={() => onZonePress('body')}
          />
        )}
        {/* Body highlight / sheen */}
        {!isPaint && (
          <>
            <Path
              d="M 140,148 C 162,131 208,130 242,142 C 214,126 162,128 140,148 Z"
              fill="white" fillOpacity={0.45}
              onPress={() => onZonePress('body')}
            />
            <Ellipse cx={178} cy={162} rx={40} ry={22} fill="white" fillOpacity={0.16}
              onPress={() => onZonePress('body')} />
          </>
        )}

        {/* ─── FRONT LEGS ───────────────────────────────────── */}
        {/* Further front leg */}
        <Path
          d="M 215,252 C 211,263 209,280 211,293
             C 213,300 228,300 230,293
             C 232,280 230,263 224,252 Z"
          fill={bodyFill} {...B}
        />
        {/* Closer front leg */}
        <Path
          d="M 243,250 C 239,261 237,278 239,291
             C 241,298 256,298 258,291
             C 260,278 258,261 251,250 Z"
          fill={bodyFill} {...B}
        />
        {/* Front leg highlight sheen */}
        {!isPaint && (
          <>
            <Path d="M 219,255 C 216,268 215,284 218,292" stroke="white" strokeWidth={4} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
            <Path d="M 247,253 C 244,266 243,282 246,290" stroke="white" strokeWidth={4} strokeOpacity={0.32} strokeLinecap="round" fill="none" />
          </>
        )}

        {/* ─── HOOVES ───────────────────────────────────────── */}
        <Ellipse cx={100} cy={298} rx={11} ry={5} fill="#AFA9EC" onPress={() => onZonePress('body')} />
        <Ellipse cx={127} cy={298} rx={11} ry={5} fill="#AFA9EC" onPress={() => onZonePress('body')} />
        <Ellipse cx={220} cy={296} rx={11} ry={5} fill="#AFA9EC" onPress={() => onZonePress('body')} />
        <Ellipse cx={248} cy={294} rx={11} ry={5} fill="#AFA9EC" onPress={() => onZonePress('body')} />

        {/* ─── NECK ─────────────────────────────────────────── */}
        <Path
          d="M 268,150 Q 289,115 307,107
             L 328,115 Q 316,148 296,161 Z"
          fill={bodyFill} {...B}
        />
        {!isPaint && (
          <Path
            d="M 278,148 Q 294,118 310,110"
            stroke="white" strokeWidth={5} strokeOpacity={0.28} strokeLinecap="round" fill="none"
          />
        )}

        {/* ─── WINGS (alicorn) ──────────────────────────────── */}
        {showWings && (
          <>
            {/* Wing back feathers */}
            <Path
              d="M 110,162 C 72,140 40,157 52,184
                 C 58,196 80,190 97,174
                 C 78,188 68,205 80,218
                 C 87,224 106,213 110,198 Z"
              fill={maneFill} fillOpacity={0.92} {...M}
            />
            {/* Wing highlight */}
            {!isPaint && (
              <Path
                d="M 108,162 C 80,148 56,167 67,190"
                stroke="white" strokeWidth={3} strokeOpacity={0.35} strokeLinecap="round" fill="none"
              />
            )}
            {/* Wing tip feathers */}
            <Path
              d="M 46,170 C 30,182 28,200 38,212 C 32,198 34,183 46,172 Z"
              fill={maneFill} fillOpacity={0.7} {...M}
            />
            <Path
              d="M 40,190 C 24,202 22,220 32,230 C 26,218 28,202 40,192 Z"
              fill={maneFill} fillOpacity={0.6} {...M}
            />
          </>
        )}

        {/* ─── MANE — BACK LAYERS (behind head) ────────────── */}
        {/* Layer 1: widest, furthest back */}
        <Path
          d="M 300,80
             C 270,90 250,115 252,148
             C 254,173 275,178 288,170
             C 274,176 258,163 259,141
             C 259,116 276,93 300,84 Z"
          fill={maneFill} fillOpacity={isPaint ? 1 : 0.82} {...M}
        />
        {/* Layer 2: mid-depth */}
        <Path
          d="M 307,78
             C 280,90 263,117 267,150
             C 271,170 292,173 302,162
             C 288,168 277,154 279,132
             C 281,111 292,91 307,82 Z"
          fill={maneFill} fillOpacity={isPaint ? 1 : 0.93} {...M}
        />
        {/* Back mane sheen */}
        {!isPaint && (
          <Path
            d="M 298,86 C 274,100 260,122 263,150"
            stroke="white" strokeWidth={4.5} strokeOpacity={0.28} strokeLinecap="round" fill="none"
          />
        )}

        {/* ─── HEAD ─────────────────────────────────────────── */}
        {/* Main head ellipse */}
        <Ellipse cx={307} cy={122} rx={51} ry={46} fill={bodyFill} {...B} />
        {/* Snout protrusion */}
        <Ellipse cx={349} cy={138} rx={17} ry={15} fill={bodyFill} {...B} />
        {/* Snout underside */}
        {!isPaint && (
          <Ellipse cx={349} cy={143} rx={15} ry={10} fill="#26215C" fillOpacity={0.05}
            onPress={() => onZonePress('body')} />
        )}
        {/* Head highlight */}
        {!isPaint && (
          <>
            <Path
              d="M 276,100 C 286,88 306,84 325,90 C 308,80 286,86 276,100 Z"
              fill="white" fillOpacity={0.38} onPress={() => onZonePress('body')}
            />
            <Ellipse cx={296} cy={106} rx={22} ry={14} fill="white" fillOpacity={0.2}
              onPress={() => onZonePress('body')} />
          </>
        )}

        {/* ─── EAR ──────────────────────────────────────────── */}
        <Path d="M 288,83 L 298,60 L 316,81 Z" fill={bodyFill} {...B} />
        <Path d="M 291,81 L 298,64 L 312,80 Z" fill={maneFill} fillOpacity={0.88} {...M} />

        {/* ─── HORN ─────────────────────────────────────────── */}
        {/* Main horn triangle */}
        <Path
          d="M 298,85 L 346,18 L 318,82 Z"
          fill={hornFill} {...H}
        />
        {/* Horn shaded side (darker half) */}
        {!isPaint && (
          <Path
            d="M 308,83 L 346,18 L 318,82 Z"
            fill="#26215C" fillOpacity={0.1}
            onPress={() => onZonePress('horn')}
          />
        )}
        {/* Horn highlight (light side) */}
        {!isPaint && (
          <Path
            d="M 298,85 L 346,18 L 310,68 Z"
            fill="white" fillOpacity={0.3}
            onPress={() => onZonePress('horn')}
          />
        )}
        {/* Horn spiral grooves */}
        <Path d="M 302,78 L 341,24" stroke="white" strokeWidth={1.5} strokeOpacity={0.55} strokeLinecap="round" fill="none" />
        <Path d="M 308,80 L 342,33" stroke="white" strokeWidth={1.5} strokeOpacity={0.55} strokeLinecap="round" fill="none" />
        <Path d="M 314,81 L 343,44" stroke="white" strokeWidth={1.5} strokeOpacity={0.55} strokeLinecap="round" fill="none" />
        <Path d="M 319,82 L 343,56" stroke="white" strokeWidth={1.5} strokeOpacity={0.55} strokeLinecap="round" fill="none" />

        {/* ─── MANE — FRONT LAYERS (over head/neck) ─────────── */}
        {/* Front layer 1 – big wavy strand */}
        <Path
          d="M 312,80
             C 296,98 292,122 298,140
             C 306,154 322,150 326,138
             C 330,126 326,108 320,96
             C 330,110 332,132 326,144
             C 320,156 305,152 298,138
             C 291,120 296,97 312,83 Z"
          fill={maneFill} {...M}
        />
        {/* Front layer 2 – forelock wisp */}
        <Path
          d="M 318,82 C 331,100 334,122 327,136 C 336,121 335,100 320,85 Z"
          fill={maneFill} fillOpacity={isPaint ? 1 : 0.85} {...M}
        />
        {/* Front mane sheen */}
        {!isPaint && (
          <Path
            d="M 313,87 C 300,107 298,130 304,144"
            stroke="white" strokeWidth={4} strokeOpacity={0.28} strokeLinecap="round" fill="none"
          />
        )}

        {/* ─── EYE ──────────────────────────────────────────── */}
        {/* White sclera */}
        <Ellipse cx={323} cy={118} rx={15} ry={14} fill="white" />
        {/* Iris — deep, expressive */}
        <Circle cx={323} cy={118} r={10.5} fill="#26215C" />
        {/* Iris inner — purple shimmer */}
        <Circle cx={323} cy={118} r={7.5} fill="#534AB7" />
        {/* Pupil */}
        <Circle cx={323} cy={119} r={5} fill="#0a0820" />
        {/* Main sparkle highlight */}
        <Circle cx={328} cy={113} r={5} fill="white" />
        {/* Secondary highlight */}
        <Circle cx={317} cy={124} r={2.2} fill="white" fillOpacity={0.72} />
        {/* Tiny tertiary highlight */}
        <Circle cx={329} cy={122} r={1.2} fill="white" fillOpacity={0.5} />
        {/* Upper eyelid arc */}
        <Path d="M 309,113 C 313,107 330,107 337,113" stroke="#26215C" strokeWidth={2} strokeLinecap="round" fill="none" />
        {/* Eyelashes */}
        <Path d="M 311,112 L 307,105" stroke="#26215C" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <Path d="M 318,109 L 316,102" stroke="#26215C" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <Path d="M 325,108 L 325,101" stroke="#26215C" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        <Path d="M 332,110 L 334,104" stroke="#26215C" strokeWidth={1.8} strokeLinecap="round" fill="none" />
        {/* Soft lower lash */}
        <Path d="M 310,122 C 316,128 330,128 336,122" stroke="#26215C" strokeWidth={1} strokeLinecap="round" fill="none" strokeOpacity={0.4} />
        {/* Rosy cheek blush */}
        <Ellipse cx={320} cy={142} rx={13} ry={7} fill="#ff9de2" fillOpacity={0.32} />
        {/* Nostril */}
        <Ellipse cx={358} cy={137} rx={4.5} ry={5.5} fill="#26215C" fillOpacity={0.17}
          onPress={() => onZonePress('body')} />

        {/* Sparkles are rendered as an animated overlay in DressScreen */}
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
