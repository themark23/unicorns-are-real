import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useEffect, useRef } from "react";

import { Scene, useAppContext } from "@/context/AppContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MUSIC: Record<Scene, any> = {
  beach:  require("../assets/audio/music_beach.mp3"),
  garden: require("../assets/audio/music_garden.mp3"),
  space:  require("../assets/audio/music_space.mp3"),
  forest: require("../assets/audio/music_forest.mp3"),
  park:   require("../assets/audio/music_park.mp3"),
  castle: require("../assets/audio/music_castle.mp3"),
};

const MUSIC_VOLUME = 0.5;

type Player = ReturnType<typeof createAudioPlayer>;

export function useSceneAudio() {
  const { currentScene, soundEnabled } = useAppContext();
  const playerRef = useRef<Player | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const prevPlayer = playerRef.current;
    playerRef.current = null;

    // Sound off: tear down the current track and start nothing new.
    if (!soundEnabled) {
      if (prevPlayer) { try { prevPlayer.remove(); } catch {} }
      return () => { cancelled = true; };
    }

    (async () => {
      // Configure iOS audio session — must run before any playback.
      // playsInSilentMode: true allows audio even when the ringer switch is off.
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });
      } catch {
        // Non-iOS platforms ignore unknown keys silently
      }

      if (cancelled) return;

      let player: Player | null = null;
      try {
        player = createAudioPlayer(MUSIC[currentScene]);
        player.loop   = true;
        player.volume = MUSIC_VOLUME;
        player.play();
        if (!cancelled) {
          playerRef.current = player;
        } else {
          player.remove();
        }
      } catch {
        // Audio unavailable in this environment
      }

      // Fade out previous track after short overlap
      if (prevPlayer) {
        fadeTimerRef.current = setTimeout(() => {
          fadeTimerRef.current = null;
          try { prevPlayer.remove(); } catch {}
        }, 400);
      }
    })();

    return () => {
      cancelled = true;
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      const p = playerRef.current;
      if (p) {
        try { p.remove(); } catch {}
        playerRef.current = null;
      }
    };
  }, [currentScene, soundEnabled]);
}
