import { useEffect, useMemo, useRef, useState } from "react";
import { Image as RNImage, ImageSourcePropType } from "react-native";

import { AnimationFrame, getAnimationManifest } from "@/constants/animationManifest";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function totalMs(frames: AnimationFrame[]): number {
  return frames.reduce((sum, f) => sum + f.durationMs, 0);
}

export interface CharacterFrames {
  /** Every unique frame source for this character, rendered stacked. */
  sources: ImageSourcePropType[];
  /** Index into `sources` of the frame that should be visible right now. */
  activeIndex: number;
  /** See CharacterAnimationManifest.lockedSilhouette — drives the cross-fade
   *  strategy (opaque base vs. plain fade) in the renderer. */
  lockedSilhouette: boolean;
}

/**
 * Drives frame-by-frame character animation.
 *
 * IMPORTANT: this hook does NOT swap a single Image's `source` prop — doing so
 * makes React Native Web tear down and repaint the underlying <img>, which
 * shows as a flash/blank on every frame change. Instead it returns the full
 * list of frame sources plus the active index. The component renders ALL frames
 * stacked and toggles opacity, so switching frames is instantaneous with zero
 * repaint.
 *
 * When hasFallbackFrames is true: returns a single static frame, no timers.
 * Otherwise: runs the idle cycle + random blink/smile + delight-on-tick.
 */
export function useCharacterFrames(
  characterId: string,
  delightTick: number,
): CharacterFrames {
  const manifest = getAnimationManifest(characterId);
  const reduced  = useReducedMotion();

  const { idle, blink, smile, delight } = manifest.sequences;

  // Flat, de-duplicated list of every frame this character can show.
  const allFrames = useMemo(() => {
    const seen = new Set<ImageSourcePropType>();
    const list: AnimationFrame[] = [];
    for (const fr of [...idle, ...blink, ...smile, ...delight]) {
      if (!seen.has(fr.src)) {
        seen.add(fr.src);
        list.push(fr);
      }
    }
    return list;
  }, [idle, blink, smile, delight]);

  const sources = useMemo(() => allFrames.map((f) => f.src), [allFrames]);

  // Pre-fetch every frame URI on mount (helps first paint on Expo web where
  // require() modules resolve to HTTP URLs).
  useEffect(() => {
    if (manifest.hasFallbackFrames) return;
    for (const fr of allFrames) {
      try {
        const resolved = RNImage.resolveAssetSource(fr.src as number);
        if (resolved?.uri) void RNImage.prefetch(resolved.uri);
      } catch {
        // resolveAssetSource can throw for non-network sources; safe to ignore
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single atomic state so frame-array + index changes land in one render.
  const [active, setActive] = useState<{ frames: AnimationFrame[]; index: number }>(
    { frames: idle, index: 0 },
  );
  const [seqPlaying, setSeqPlaying] = useState(false);

  const frameTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqStartRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqResetRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDelightRef = useRef(delightTick);

  useEffect(() => () => {
    if (frameTimerRef.current) clearTimeout(frameTimerRef.current);
    if (seqStartRef.current)   clearTimeout(seqStartRef.current);
    if (seqResetRef.current)   clearTimeout(seqResetRef.current);
  }, []);

  // If Reduce Motion turns on mid-sequence, snap back to the idle frame so the
  // character never freezes on a blink/smile/delight frame.
  useEffect(() => {
    if (!reduced) return;
    if (seqStartRef.current) clearTimeout(seqStartRef.current);
    if (seqResetRef.current) clearTimeout(seqResetRef.current);
    if (frameTimerRef.current) clearTimeout(frameTimerRef.current);
    setActive({ frames: idle, index: 0 });
    setSeqPlaying(false);
  }, [reduced, idle]);

  // Frame advancer
  useEffect(() => {
    if (manifest.hasFallbackFrames || reduced) return;

    const frame = active.frames[active.index] ?? active.frames[0];
    frameTimerRef.current = setTimeout(() => {
      setActive((prev) => ({
        frames: prev.frames,
        index:  (prev.index + 1) % prev.frames.length,
      }));
    }, frame.durationMs);

    return () => { if (frameTimerRef.current) clearTimeout(frameTimerRef.current); };
  }, [active, reduced, manifest.hasFallbackFrames]);

  // Random blink / smile scheduler
  useEffect(() => {
    if (manifest.hasFallbackFrames || reduced || seqPlaying) return;

    const delayMs = 4800 + Math.random() * 4200;
    seqStartRef.current = setTimeout(() => {
      const seq   = Math.random() > 0.35 ? blink : smile;
      const durMs = totalMs(seq);

      setSeqPlaying(true);
      setActive({ frames: seq, index: 0 });

      seqResetRef.current = setTimeout(() => {
        setActive({ frames: idle, index: 0 });
        setSeqPlaying(false);
      }, durMs);
    }, delayMs);

    return () => { if (seqStartRef.current) clearTimeout(seqStartRef.current); };
  }, [manifest.hasFallbackFrames, reduced, seqPlaying, blink, smile, idle]);

  // Delight: fires whenever delightTick is incremented
  useEffect(() => {
    if (
      manifest.hasFallbackFrames ||
      reduced ||
      delightTick === 0 ||
      delightTick === prevDelightRef.current
    ) return;
    prevDelightRef.current = delightTick;

    const durMs = totalMs(delight);
    if (seqStartRef.current) clearTimeout(seqStartRef.current);
    if (seqResetRef.current) clearTimeout(seqResetRef.current);

    setSeqPlaying(true);
    setActive({ frames: delight, index: 0 });

    seqResetRef.current = setTimeout(() => {
      setActive({ frames: idle, index: 0 });
      setSeqPlaying(false);
    }, durMs);

    return () => { if (seqResetRef.current) clearTimeout(seqResetRef.current); };
  }, [manifest.hasFallbackFrames, delightTick, reduced, delight, idle]);

  if (manifest.hasFallbackFrames) {
    return {
      sources: [idle[0].src],
      activeIndex: 0,
      lockedSilhouette: manifest.lockedSilhouette,
    };
  }

  const activeFrame = active.frames[active.index] ?? idle[0];
  const activeIndex = Math.max(0, allFrames.findIndex((f) => f.src === activeFrame.src));

  return { sources, activeIndex, lockedSilhouette: manifest.lockedSilhouette };
}
