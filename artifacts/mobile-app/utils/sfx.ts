// Web SFX — Metro resolves sfx.native.ts on iOS/Android instead.
// Uses expo-asset to resolve bundled URIs once at startup, then HTML5 Audio.
import { Asset } from "expo-asset";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SFX_MODULES: Record<string, any> = {
  sparkle: require("../assets/audio/sfx_sparkle.mp3"),
  pickup:  require("../assets/audio/sfx_pickup.mp3"),
  drop:    require("../assets/audio/sfx_drop.mp3"),
};

const VOLUME: Record<string, number> = {
  sparkle: 0.7,
  pickup:  0.6,
  drop:    0.55,
};

// Resolve all asset URIs once at module load — avoids per-call overhead
const SFX_URIS: Partial<Record<string, string>> = {};
for (const [name, mod] of Object.entries(SFX_MODULES)) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const asset = Asset.fromModule(mod as any);
    if (asset.uri) SFX_URIS[name] = asset.uri;
  } catch {}
}

// Mirrors the soundEnabled flag in AppContext.
let enabled = true;
export function setSfxEnabled(next: boolean) {
  enabled = next;
}

export function playSfx(name: "sparkle" | "pickup" | "drop") {
  if (!enabled) return;
  try {
    const url = SFX_URIS[name];
    if (!url) return;
    const a = new Audio(url);
    a.volume = VOLUME[name] ?? 0.7;
    void a.play().catch(() => {});
  } catch {}
}
