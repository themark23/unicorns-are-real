import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Image, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { CharacterAmbientSparkle } from "@/components/CharacterAmbientSparkle";
import { SparkleParticles } from "@/components/SparkleParticles";
import { CharacterConfig } from "@/constants/characters";
import { useAppContext } from "@/context/AppContext";
import { useCharacterFrames } from "@/hooks/useCharacterFrames";
import { useManagedTimeout } from "@/hooks/useManagedTimeout";
import { playSfx } from "@/utils/sfx";

const IMG_RATIO  = 4 / 3;
const HUD_HEIGHT = 200;
const EDGE_ZONE  = 80;
const MAX_SCROLL_PER_FRAME = 4;

const LIFT_SPRING  = { damping: 12, stiffness: 340, mass: 0.6 };
const DROP_SPRING  = { damping: 10, stiffness: 130, mass: 1.0 };
const SCALE_SPRING = { damping: 14, stiffness: 260 };

// Cross-fade duration between animation frames. Because every frame shares the
// same locked body registration, only the eyes/mouth blend — giving a smooth
// morph instead of a hard cut. Longer = gentler, slower expression changes.
const FRAME_FADE_MS = 340;

/**
 * A single stacked animation frame. Two rendering strategies, chosen per
 * character via `locked`:
 *
 * LOCKED SILHOUETTE (the 4 Gemini characters — idle art reused, only the
 * eyes/mouth differ, so every frame occupies the exact same body outline):
 * we never fade a frame OUT. Two identical semi-transparent layers do not sum to
 * full opacity, so a symmetric cross-fade dips the composite below 100% and the
 * scene bleeds through (the "disappearing" flicker). Instead the incoming
 * (active) frame sits on top and fades 0 → 1 while every other frame stays fully
 * OPAQUE underneath — the identical silhouette guarantees full coverage with no
 * transparent gap. `beneath` (the previously active frame) is raised just under
 * the active one so the fade reads as a clean previous → current morph.
 *
 * UNLOCKED (Baby Twinkle — 12 genuinely different frames with real body motion):
 * holding inactive frames opaque would stack every distinct pose on screen at
 * once (a ghosted double image). These must use a plain symmetric cross-fade so
 * only the active frame is ever visible.
 */
function AnimatedFrame({
  source, active, beneath, locked, width, height,
}: {
  source:  React.ComponentProps<typeof Image>["source"];
  active:  boolean;
  beneath: boolean;
  locked:  boolean;
  width:   number;
  height:  number;
}) {
  // Locked frames start opaque (solid base); unlocked frames start hidden unless
  // active, so only one pose is ever visible at a time.
  const opacity   = useSharedValue(active || locked ? 1 : 0);
  const wasActive = useRef(active);

  useEffect(() => {
    if (locked) {
      if (active && !wasActive.current) {
        // Newly activated: cross-fade in on top of the still-opaque prior frame.
        opacity.value = 0;
        opacity.value = withTiming(1, { duration: FRAME_FADE_MS });
      } else if (!active) {
        // Inactive frames remain a solid opaque base so coverage is never lost.
        opacity.value = withTiming(1, { duration: FRAME_FADE_MS });
      }
    } else {
      // Moving frames: only the active one is visible; the rest fade fully out.
      opacity.value = withTiming(active ? 1 : 0, { duration: FRAME_FADE_MS });
    }
    wasActive.current = active;
  }, [active, locked, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Image
      source={source}
      style={[
        styles.frame,
        { width, height, zIndex: active ? 3 : beneath ? 2 : 1 },
        style,
      ]}
      resizeMode="contain"
      accessible={false}
    />
  );
}

interface CharacterProps {
  config:       CharacterConfig;
  screenWidth:  number;
  screenHeight: number;
  sceneWidth:   number;
}

export function Character({ config, screenWidth, screenHeight, sceneWidth }: CharacterProps) {
  const { id, size, sparkleColor, glowColor, idleType } = config;
  const {
    bringToFront, getZIndex, resetKey, sceneOffsetX, activeDrags,
    charRects, wornItems, pendingReaction,
  } = useAppContext();

  const imageH   = size * IMG_RATIO;
  const initialX = config.initialXFraction * (screenWidth - size);
  const initialY = config.initialYFraction * (screenHeight - imageH - HUD_HEIGHT);

  // ── Shared values ──────────────────────────────────────────────────────────
  const posX     = useSharedValue(initialX);
  const posY     = useSharedValue(initialY);
  const savedX   = useSharedValue(initialX);
  const savedY   = useSharedValue(initialY);
  const scale    = useSharedValue(1);
  const facingX  = useSharedValue(1);
  const isLifted = useSharedValue(false);
  const idleTY   = useSharedValue(0);
  const idleRot  = useSharedValue(0);

  // Stable layout refs for worklets
  const shSV     = useSharedValue(screenHeight);
  const sceneWSV = useSharedValue(sceneWidth);
  const swSV     = useSharedValue(screenWidth);
  const sizeSV   = useSharedValue(size);
  const imageHSV = useSharedValue(imageH);

  const [zIndex, setZIndex]               = React.useState(1);
  const [sparkleActive, setSparkleActive] = React.useState(false);
  // Incremented on every tap/pickup to trigger one delight sequence
  const [delightTick, setDelightTick]     = React.useState(0);

  // setTimeout that auto-clears on unmount (scene switches / Home reset)
  const schedule = useManagedTimeout();

  // ── Animation frames (stacked; only opacity toggles — no source swaps) ────
  const { sources: frameSources, activeIndex, lockedSilhouette } =
    useCharacterFrames(id, delightTick);

  // Track the frame that was active on the *previous* render so the incoming
  // frame can cross-fade in directly on top of it (see AnimatedFrame).
  const prevIndexRef = useRef(activeIndex);
  const beneathIndex = prevIndexRef.current;
  useEffect(() => { prevIndexRef.current = activeIndex; }, [activeIndex]);

  // ── Layout sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    shSV.value = screenHeight; sceneWSV.value = sceneWidth; swSV.value = screenWidth;
  }, [screenHeight, sceneWidth, screenWidth, shSV, sceneWSV, swSV]);

  // ── Register bounding rect so SceneProps can detect proximity ──────────────
  useEffect(() => {
    charRects.value = {
      ...charRects.value,
      [id]: { x: initialX, y: initialY, w: size, h: imageH },
    };
    return () => {
      const next = { ...charRects.value };
      delete next[id];
      charRects.value = next;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Idle body animations (float, hop, stumble, etc.) ──────────────────────
  // These are Reanimated transform animations — completely separate from
  // the image-frame sequencer above. They move the whole character container.
  useEffect(() => {
    switch (idleType) {
      case "float":
        idleTY.value = withRepeat(withSequence(
          withTiming(-8, { duration: 1600 }), withTiming(0, { duration: 1600 })
        ), -1, true);
        break;
      case "stumble":
        idleRot.value = withRepeat(withSequence(
          withDelay(5200, withTiming(-15, { duration: 190 })),
          withTiming(9, { duration: 140 }), withTiming(-4, { duration: 120 }),
          withSpring(0, { damping: 9, stiffness: 200 })
        ), -1, false);
        break;
      case "hop":
        idleTY.value = withRepeat(withSequence(
          withDelay(2800, withTiming(-22, { duration: 175 })),
          withTiming(5, { duration: 155 }), withSpring(0, { damping: 6, stiffness: 320 })
        ), -1, false);
        break;
      case "trip":
        idleRot.value = withRepeat(withSequence(
          withDelay(4000, withTiming(19, { duration: 160 })),
          withTiming(-8, { duration: 120 }), withTiming(5, { duration: 110 }),
          withSpring(0, { damping: 7, stiffness: 210 })
        ), -1, false);
        break;
      case "sway":
        idleRot.value = withRepeat(withSequence(
          withTiming(8, { duration: 950 }), withTiming(-8, { duration: 950 })
        ), -1, true);
        idleTY.value = withRepeat(withSequence(
          withTiming(-5, { duration: 850 }), withTiming(0, { duration: 850 })
        ), -1, true);
        break;
    }
  }, [idleType, idleTY, idleRot]);

  // ── React to item interactions — scale pulse + sparkle ─────────────────────
  useEffect(() => {
    if (pendingReaction.charId !== id || pendingReaction.tick === 0) return;
    setSparkleActive(true);
    scale.value = withSequence(
      withSpring(1.32, { damping: 7, stiffness: 280 }),
      withDelay(220, withSpring(1.0, { damping: 12, stiffness: 220 }))
    );
    schedule(() => setSparkleActive(false), 1000);
  }, [pendingReaction.tick, pendingReaction.charId, id, scale, schedule]);

  // ── Continuous edge-scroll while dragging ──────────────────────────────────
  useFrameCallback(() => {
    if (!isLifted.value) return;
    const screenX = posX.value - sceneOffsetX.value;
    const maxOff  = sceneWSV.value - swSV.value;
    if (screenX + sizeSV.value > swSV.value - EDGE_ZONE) {
      const depth  = Math.min(1, (screenX + sizeSV.value - (swSV.value - EDGE_ZONE)) / EDGE_ZONE);
      const actual = Math.min(depth * MAX_SCROLL_PER_FRAME, maxOff - sceneOffsetX.value);
      if (actual > 0) { sceneOffsetX.value += actual; posX.value += actual; savedX.value += actual; }
    } else if (screenX < EDGE_ZONE) {
      const depth  = Math.min(1, (EDGE_ZONE - screenX) / EDGE_ZONE);
      const actual = Math.min(depth * MAX_SCROLL_PER_FRAME, sceneOffsetX.value);
      if (actual > 0) { sceneOffsetX.value -= actual; posX.value -= actual; savedX.value -= actual; }
    }
  });

  // ── Pickup / drop side-effects ─────────────────────────────────────────────
  const onPickup = useCallback(() => {
    bringToFront(id);
    setZIndex(getZIndex(id) + 10);
    setSparkleActive(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playSfx("pickup");
  }, [id, bringToFront, getZIndex]);

  const onDrop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSparkleActive(true);
    schedule(() => setSparkleActive(false), 700);
    playSfx("drop");
  }, [schedule]);

  // Trigger a delight sequence when the character is tapped/picked up
  const triggerDelight = useCallback(() => {
    setDelightTick((t) => t + 1);
  }, []);

  // ── Pan gesture ────────────────────────────────────────────────────────────
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .maxPointers(1)
        .onBegin(() => {
          activeDrags.value += 1;
          savedX.value = posX.value; savedY.value = posY.value;
          isLifted.value = true;
          scale.value = withSpring(1.2, LIFT_SPRING);
          runOnJS(onPickup)();
          runOnJS(triggerDelight)();
        })
        .onUpdate((e) => {
          posX.value = savedX.value + e.translationX;
          posY.value = savedY.value + e.translationY;
          if (Math.abs(e.velocityX) > 30) facingX.value = e.velocityX > 0 ? 1 : -1;
        })
        .onFinalize(() => {
          activeDrags.value = Math.max(0, activeDrags.value - 1);
          isLifted.value = false;
          const maxX     = sceneWSV.value - sizeSV.value;
          const maxY     = shSV.value - imageHSV.value - HUD_HEIGHT;
          const clampedX = Math.max(0, Math.min(maxX, posX.value));
          const clampedY = Math.max(0, Math.min(maxY, posY.value));
          posX.value   = withSpring(clampedX, DROP_SPRING);
          posY.value   = withSpring(clampedY, DROP_SPRING);
          scale.value  = withSpring(1, SCALE_SPRING);
          charRects.value = {
            ...charRects.value,
            [id]: { x: clampedX, y: clampedY, w: sizeSV.value, h: imageHSV.value },
          };
          runOnJS(onDrop)();
        }),
    [posX, posY, savedX, savedY, scale, facingX, isLifted,
     sceneWSV, shSV, swSV, sizeSV, imageHSV,
     activeDrags, sceneOffsetX, charRects,
     onPickup, onDrop, triggerDelight]
  );

  // ── Reset on home press ────────────────────────────────────────────────────
  useEffect(() => {
    if (resetKey === 0) return;
    posX.value = withSpring(initialX, { damping: 14, stiffness: 80 });
    posY.value = withSpring(initialY, { damping: 14, stiffness: 80 });
  }, [resetKey, initialX, initialY, posX, posY]);

  // ── Animated style ─────────────────────────────────────────────────────────
  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value - sceneOffsetX.value },
      { translateY: posY.value + (isLifted.value ? 0 : idleTY.value) },
      { scale: scale.value },
      { scaleX: facingX.value },
      { rotate: isLifted.value ? "0deg" : `${idleRot.value}deg` },
    ],
  }));

  const wornItem = wornItems[id] ?? null;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.wrapper, { width: size, height: imageH, zIndex }, wrapperStyle]}
        accessibilityLabel={`${config.displayName}, drag to move around the scene`}
        accessibilityRole="image"
      >
        {/* ── Character frames — all stacked and pre-mounted. Never swap a
             single Image's source (that flashes on web); instead cross-fade
             opacity between already-painted frames for a smooth morph. ── */}
        {frameSources.map((src, i) => (
          <AnimatedFrame
            key={i}
            source={src}
            active={i === activeIndex}
            beneath={i === beneathIndex && i !== activeIndex}
            locked={lockedSilhouette}
            width={size}
            height={imageH}
          />
        ))}

        {/* ── Worn item (crown / accessory snapped on by SceneProp) ── */}
        {wornItem !== null && (
          <Image
            source={wornItem.image}
            style={[
              styles.wornItem,
              {
                width:  wornItem.size,
                height: wornItem.size,
                top:  wornItem.category === "crown" ? -wornItem.size * 0.28 : imageH * 0.06,
                left: wornItem.category === "crown"
                  ? size * 0.5 - wornItem.size * 0.5
                  : size * 0.56,
              },
            ]}
            resizeMode="contain"
          />
        )}

        {/* ── Ambient sparkle stars (always-on, subtle, pointer-transparent) ── */}
        <CharacterAmbientSparkle
          sparkleColor={sparkleColor}
          glowColor={glowColor}
          width={size}
          height={imageH}
        />

        {/* ── Interaction sparkle burst (tap / drop / item collision) ── */}
        <SparkleParticles active={sparkleActive} count={10} color={sparkleColor} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position:   "absolute",
    alignItems: "center",
  },
  frame: {
    position: "absolute",
    top:      0,
    left:     0,
  },
  wornItem: {
    position: "absolute",
  },
});
