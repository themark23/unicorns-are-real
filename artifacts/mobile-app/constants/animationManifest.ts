/**
 * Unicorn Valley — Character Animation Manifest (React Native)
 *
 * PRODUCTION RULE:
 * Blinks, smiles, and delight expressions MUST use baked full-character PNG
 * frames. Do not use CSS/View overlays for eyelids or mouths. Ambient
 * sparkle/glow is the only allowed decorative code animation.
 *
 * FRAME WIRING:
 *   - All 5 characters use 4 baked frames each in
 *     assets/characters/animations/{character-id}/: idle-01 (from the pristine
 *     base art) plus blink-02 / smile-02 / delight-02. Expression sequences are
 *     [idle -> expression -> idle] arcs; the renderer cross-fades between them.
 *   - Baby Twinkle's expression frames are built on idle-01's exact body (only
 *     the face region is swapped) so it shares one locked silhouette like the
 *     rest; its original swaying sprite frames were retired for smoothness.
 *   - All frames must share locked registration (same size, scale, anchor,
 *     colors) — see .agents/memory/character-animation-pipeline.md for how the
 *     frames are authored (Gemini image-edit + bg removal + bbox normalization).
 *   - Set hasFallbackFrames: false once real frames exist, then run
 *     `pnpm --filter @workspace/mobile-app run typecheck`.
 */

import { ImageSourcePropType } from "react-native";

export type UnicornCharacterId =
  | "mama-celestia"
  | "papa-orion"
  | "daughter-lumi"
  | "son-comet"
  | "baby-twinkle";

export interface AnimationFrame {
  src:        ImageSourcePropType;
  durationMs: number;
}

export interface AnimationSequences {
  idle:    AnimationFrame[];
  blink:   AnimationFrame[];
  smile:   AnimationFrame[];
  delight: AnimationFrame[];
}

export interface CharacterAnimationManifest {
  id:                UnicornCharacterId;
  displayName:       string;
  /** true while real multi-frame PNGs have not been supplied for this character */
  hasFallbackFrames: boolean;
  /**
   * true when every frame shares ONE locked body silhouette (idle art reused,
   * only eyes/mouth differ). The renderer then keeps inactive frames opaque
   * underneath the incoming one, which avoids the mid-cross-fade transparency
   * dip. Set false for characters with genuine per-frame body motion (their
   * distinct poses must NOT be held opaque, or they ghost into a double image).
   */
  lockedSilhouette:  boolean;
  sequences:         AnimationSequences;
}

const f = (src: ImageSourcePropType, ms: number): AnimationFrame => ({
  src,
  durationMs: ms,
});

// ── Mama Celestia — real baked frame PNGs ────────────────────────────────────
const CE = {
  idle:    require("../assets/characters/animations/mama-celestia/idle-01.png"),
  blink:   require("../assets/characters/animations/mama-celestia/blink-02.png"),
  smile:   require("../assets/characters/animations/mama-celestia/smile-02.png"),
  delight: require("../assets/characters/animations/mama-celestia/delight-02.png"),
} as const;

// ── Papa Orion — real baked frame PNGs ───────────────────────────────────────
const OR = {
  idle:    require("../assets/characters/animations/papa-orion/idle-01.png"),
  blink:   require("../assets/characters/animations/papa-orion/blink-02.png"),
  smile:   require("../assets/characters/animations/papa-orion/smile-02.png"),
  delight: require("../assets/characters/animations/papa-orion/delight-02.png"),
} as const;

// ── Daughter Lumi — real baked frame PNGs ────────────────────────────────────
const LU = {
  idle:    require("../assets/characters/animations/daughter-lumi/idle-01.png"),
  blink:   require("../assets/characters/animations/daughter-lumi/blink-02.png"),
  smile:   require("../assets/characters/animations/daughter-lumi/smile-02.png"),
  delight: require("../assets/characters/animations/daughter-lumi/delight-02.png"),
} as const;

// ── Son Comet — real baked frame PNGs ────────────────────────────────────────
const CO = {
  idle:    require("../assets/characters/animations/son-comet/idle-01.png"),
  blink:   require("../assets/characters/animations/son-comet/blink-02.png"),
  smile:   require("../assets/characters/animations/son-comet/smile-02.png"),
  delight: require("../assets/characters/animations/son-comet/delight-02.png"),
} as const;

// ── Baby Twinkle — real baked frame PNGs (locked silhouette, built on idle) ───
const TW = {
  idle:    require("../assets/characters/animations/baby-twinkle/idle-01.png"),
  blink:   require("../assets/characters/animations/baby-twinkle/blink-02.png"),
  smile:   require("../assets/characters/animations/baby-twinkle/smile-02.png"),
  delight: require("../assets/characters/animations/baby-twinkle/delight-02.png"),
} as const;

const MANIFEST: Record<UnicornCharacterId, CharacterAnimationManifest> = {

  // ── Mama Celestia — rose-gold, lavender mane ──────────────────────────────
  "mama-celestia": {
    id: "mama-celestia",
    displayName: "Mama Celestia",
    hasFallbackFrames: false,
    lockedSilhouette: true,
    sequences: {
      idle:    [ f(CE.idle, 1700) ],
      blink:   [ f(CE.idle, 200), f(CE.blink, 300), f(CE.idle, 200) ],
      smile:   [ f(CE.idle, 420), f(CE.smile, 820), f(CE.idle, 420) ],
      delight: [ f(CE.idle, 360), f(CE.delight, 640), f(CE.idle, 360) ],
    },
  },

  // ── Papa Orion — deep purple, midnight-blue/silver mane ───────────────────
  "papa-orion": {
    id: "papa-orion",
    displayName: "Papa Orion",
    hasFallbackFrames: false,
    lockedSilhouette: true,
    sequences: {
      idle:    [ f(OR.idle, 1700) ],
      blink:   [ f(OR.idle, 200), f(OR.blink, 300), f(OR.idle, 200) ],
      smile:   [ f(OR.idle, 420), f(OR.smile, 820), f(OR.idle, 420) ],
      delight: [ f(OR.idle, 360), f(OR.delight, 640), f(OR.idle, 360) ],
    },
  },

  // ── Daughter Lumi — candy-pink body, pastel rainbow mane ──────────────────
  "daughter-lumi": {
    id: "daughter-lumi",
    displayName: "Daughter Lumi",
    hasFallbackFrames: false,
    lockedSilhouette: true,
    sequences: {
      idle:    [ f(LU.idle, 1700) ],
      blink:   [ f(LU.idle, 200), f(LU.blink, 300), f(LU.idle, 200) ],
      smile:   [ f(LU.idle, 420), f(LU.smile, 820), f(LU.idle, 420) ],
      delight: [ f(LU.idle, 360), f(LU.delight, 640), f(LU.idle, 360) ],
    },
  },

  // ── Son Comet — mint-green body, yellow-orange mane ───────────────────────
  "son-comet": {
    id: "son-comet",
    displayName: "Son Comet",
    hasFallbackFrames: false,
    lockedSilhouette: true,
    sequences: {
      idle:    [ f(CO.idle, 1700) ],
      blink:   [ f(CO.idle, 200), f(CO.blink, 300), f(CO.idle, 200) ],
      smile:   [ f(CO.idle, 420), f(CO.smile, 820), f(CO.idle, 420) ],
      delight: [ f(CO.idle, 360), f(CO.delight, 640), f(CO.idle, 360) ],
    },
  },

  // ── Baby Twinkle — soft-yellow body, tiny peach mane ──────────────────────
  "baby-twinkle": {
    id: "baby-twinkle",
    displayName: "Baby Twinkle",
    hasFallbackFrames: false,
    lockedSilhouette: true,
    sequences: {
      idle:    [ f(TW.idle, 1700) ],
      blink:   [ f(TW.idle, 200), f(TW.blink, 300), f(TW.idle, 200) ],
      smile:   [ f(TW.idle, 420), f(TW.smile, 820), f(TW.idle, 420) ],
      delight: [ f(TW.idle, 360), f(TW.delight, 640), f(TW.idle, 360) ],
    },
  },
};

export function getAnimationManifest(id: string): CharacterAnimationManifest {
  return MANIFEST[id as UnicornCharacterId] ?? MANIFEST["mama-celestia"];
}
