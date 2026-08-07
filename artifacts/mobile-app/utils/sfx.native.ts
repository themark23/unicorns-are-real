import { createAudioPlayer } from "expo-audio";

type SfxName = "sparkle" | "pickup" | "drop";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SOURCES: Record<SfxName, any> = {
  sparkle: require("../assets/audio/sfx_sparkle.mp3"),
  pickup:  require("../assets/audio/sfx_pickup.mp3"),
  drop:    require("../assets/audio/sfx_drop.mp3"),
};

const VOLUME: Record<SfxName, number> = {
  sparkle: 0.8,
  pickup:  0.7,
  drop:    0.6,
};

// One active player slot per SFX type — removes the previous before creating the next.
// createAudioPlayer always starts from position 0, so no seekTo needed.
const active: Partial<Record<SfxName, ReturnType<typeof createAudioPlayer>>> = {};

// Mirrors the soundEnabled flag in AppContext. Module-level because playSfx is
// called from plain callbacks, not from inside a component.
let enabled = true;
export function setSfxEnabled(next: boolean) {
  enabled = next;
  if (!next) {
    for (const k of Object.keys(active) as SfxName[]) {
      try { active[k]?.remove(); } catch {}
      delete active[k];
    }
  }
}

export function playSfx(name: SfxName) {
  if (!enabled) return;
  try {
    // Clean up previous instance of this sfx to avoid player accumulation
    try { active[name]?.remove(); } catch {}

    const player = createAudioPlayer(SOURCES[name]);
    player.volume = VOLUME[name];
    active[name] = player;
    player.play();
  } catch {
    // expo-audio unavailable or audio session not ready — silent fallback
  }
}
