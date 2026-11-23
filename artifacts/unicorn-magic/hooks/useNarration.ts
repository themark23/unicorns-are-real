import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Plays the recorded voiceovers on the Read tab — one clip at a time.
 *
 * Unlike background music, this is always user-initiated: a child taps Listen
 * and expects to hear it, so playsInSilentMode is on. Otherwise the button
 * would silently do nothing whenever the ringer switch happened to be off.
 */
export function useNarration() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const subRef = useRef<{ remove: () => void } | null>(null);

  const teardown = useCallback(() => {
    try { subRef.current?.remove(); } catch {}
    subRef.current = null;
    const p = playerRef.current;
    playerRef.current = null;
    // Pause before releasing: remove() alone lets the outgoing clip run on, so
    // tapping a second Listen used to leave two voices reading over each other.
    if (p) {
      try { p.pause(); } catch {}
      try { p.remove(); } catch {}
    }
  }, []);

  const stop = useCallback(() => {
    teardown();
    setPlayingId(null);
  }, [teardown]);

  /** Tap the clip that is already playing to stop it; tap another to switch. */
  const toggle = useCallback((id: string, source: number | null) => {
    if (!source) return;
    if (playerRef.current && playingId === id) { stop(); return; }

    teardown();
    try {
      void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {});
      const player = createAudioPlayer(source);
      playerRef.current = player;
      subRef.current = player.addListener('playbackStatusUpdate', (status) => {
        // Reset the button once the clip ends on its own.
        if (status.didJustFinish) { teardown(); setPlayingId(null); }
      });
      player.play();
      setPlayingId(id);
    } catch {
      // Audio unavailable — leave the UI in a resting state rather than stuck.
      teardown();
      setPlayingId(null);
    }
  }, [playingId, stop, teardown]);

  // Never let a story keep reading after the child has left the tab. Tab
  // screens stay mounted when you switch away, so unmount cleanup alone never
  // fired — the blur callback is what actually stops it.
  useFocusEffect(
    useCallback(() => () => {
      teardown();
      setPlayingId(null);
    }, [teardown])
  );

  useEffect(() => () => { teardown(); }, [teardown]);

  return { playingId, toggle, stop };
}
