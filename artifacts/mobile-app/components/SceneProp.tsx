import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { SparkleParticles } from "@/components/SparkleParticles";
import { SceneItemConfig } from "@/constants/sceneItems";
import { WornItemDef, useAppContext } from "@/context/AppContext";
import { useManagedTimeout } from "@/hooks/useManagedTimeout";
import { playSfx } from "@/utils/sfx";

const HUD_HEIGHT = 200;
const EDGE_ZONE  = 80;
const MAX_SCROLL_PER_FRAME = 4;
const DRAG_THRESHOLD       = 6;
const PROXIMITY_PX         = 130; // scene-space px to trigger character interaction

const LIFT_SPRING  = { damping: 14, stiffness: 250, mass: 0.8 };
const DROP_SPRING  = { damping: 9,  stiffness: 110, mass: 1.0 };
const SCALE_SPRING = { damping: 12, stiffness: 220 };

interface ScenePropProps {
  item: SceneItemConfig;
  sceneWidth: number;
  screenWidth: number;
  screenHeight: number;
}

export function SceneProp({ item, sceneWidth, screenWidth, screenHeight }: ScenePropProps) {
  const {
    sceneOffsetX, activeDrags, resetKey,
    charRects, attachWornItem, triggerReaction,
  } = useAppContext();

  const initX = item.xFraction * sceneWidth;
  const initY = item.yFraction * (screenHeight - HUD_HEIGHT);

  // ── Shared values ──────────────────────────────────────────────────────────
  const posX       = useSharedValue(initX);
  const posY       = useSharedValue(initY);
  const savedX     = useSharedValue(initX);
  const savedY     = useSharedValue(initY);
  const scale      = useSharedValue(1);
  const rot        = useSharedValue(0);
  const opacity    = useSharedValue(1);
  const floatY     = useSharedValue(0);
  const hasMoved   = useSharedValue(false);
  const isDragging = useSharedValue(false);

  // Stable layout refs accessible from worklets
  const sceneWSV = useSharedValue(sceneWidth);
  const swSV     = useSharedValue(screenWidth);
  const shSV     = useSharedValue(screenHeight);
  const sizeSV   = useSharedValue(item.size);

  useEffect(() => {
    sceneWSV.value = sceneWidth;
    swSV.value     = screenWidth;
    shSV.value     = screenHeight;
  }, [sceneWidth, screenWidth, screenHeight, sceneWSV, swSV, shSV]);

  const [sparkle,   setSparkle]   = useState(false);
  const [tapCount,  setTapCount]  = useState(0);
  const [consumed,  setConsumed]  = useState(false); // true → remove from scene
  // While lifted, render above every character so the item sits ON TOP of them
  // (characters elevate their own zIndex up to ~15 when picked up).
  const [elevated,  setElevated]  = useState(false);

  // setTimeout that auto-clears on unmount (scene switches / consumed items)
  const schedule = useManagedTimeout();

  // ── Continuous edge-scroll ─────────────────────────────────────────────────
  useFrameCallback(() => {
    if (!isDragging.value) return;
    const screenX = posX.value - sceneOffsetX.value;
    const maxOff  = sceneWSV.value - swSV.value;
    if (screenX + sizeSV.value > swSV.value - EDGE_ZONE) {
      const depth  = Math.min(1, (screenX + sizeSV.value - (swSV.value - EDGE_ZONE)) / EDGE_ZONE);
      const actual = Math.min(depth * MAX_SCROLL_PER_FRAME, maxOff - sceneOffsetX.value);
      if (actual > 0) { sceneOffsetX.value += actual; posX.value += actual; savedX.value += actual; }
    } else if (screenX < EDGE_ZONE) {
      const depth = Math.min(1, (EDGE_ZONE - screenX) / EDGE_ZONE);
      const d2    = Math.min(depth * MAX_SCROLL_PER_FRAME, sceneOffsetX.value);
      if (d2 > 0) { sceneOffsetX.value -= d2; posX.value -= d2; savedX.value -= d2; }
    }
  });

  // ── JS callbacks ───────────────────────────────────────────────────────────
  const onLift = useCallback(() => {
    setElevated(true);
  }, []);

  const onTap = useCallback(() => {
    setElevated(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTapCount((c) => c + 1);
    setSparkle(true);
    schedule(() => setSparkle(false), 700);
    playSfx("sparkle");
  }, [schedule]);

  const onDrop = useCallback(() => {
    setElevated(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSparkle(true);
    schedule(() => setSparkle(false), 500);
    playSfx("drop");
  }, [schedule]);

  // ── Character interaction — called on JS thread via runOnJS ────────────────
  const onNearCharacter = useCallback((charId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    playSfx("sparkle");
    const cat = item.category;

    switch (cat) {
      case "drink":
        // Tip the container back as if drinking, then drain
        rot.value     = withSpring(-95, { damping: 10, stiffness: 200 });
        opacity.value = withDelay(650, withTiming(0, { duration: 380 }));
        scale.value   = withDelay(650, withSpring(0, { damping: 8, stiffness: 150 }));
        schedule(() => setConsumed(true), 1100);
        break;

      case "eat":
        // Chomp animation — two "bites" then gone
        scale.value = withSequence(
          withSpring(1.35, { damping: 6, stiffness: 280 }),
          withSpring(0.75, { damping: 8, stiffness: 220 }),
          withSpring(1.2,  { damping: 6, stiffness: 260 }),
          withTiming(0,    { duration: 210 })
        );
        rot.value = withSequence(
          withTiming(-18, { duration: 80 }), withTiming(18, { duration: 80 }),
          withTiming(-10, { duration: 70 }), withTiming(0,  { duration: 60 })
        );
        schedule(() => setConsumed(true), 960);
        break;

      case "wand":
        // Spin + sparkle burst then vanish
        rot.value     = withTiming(720, { duration: 580 });
        opacity.value = withDelay(420, withTiming(0, { duration: 280 }));
        scale.value   = withDelay(380, withSpring(0, { damping: 7 }));
        setSparkle(true);
        schedule(() => { setSparkle(false); setConsumed(true); }, 850);
        break;

      case "gem":
        // Float upward and shimmer away
        floatY.value  = withTiming(-95, { duration: 720 });
        scale.value   = withSequence(
          withSpring(1.25, { damping: 6 }),
          withDelay(280, withTiming(0, { duration: 370 }))
        );
        opacity.value = withDelay(380, withTiming(0, { duration: 420 }));
        setSparkle(true);
        schedule(() => { setSparkle(false); setConsumed(true); }, 900);
        break;

      case "love":
        // Pulse up like a floating heart then dissolve
        floatY.value  = withTiming(-65, { duration: 620 });
        scale.value   = withSequence(
          withSpring(1.45, { damping: 5, stiffness: 300 }),
          withSpring(1.1,  { damping: 9 }),
          withSpring(1.45, { damping: 5 }),
          withTiming(0,    { duration: 260 })
        );
        opacity.value = withDelay(380, withTiming(0, { duration: 340 }));
        schedule(() => setConsumed(true), 920);
        break;

      case "toy":
        // Bounce toward character then pop away
        floatY.value = withSequence(
          withSpring(-38, { damping: 5, stiffness: 200 }),
          withSpring(0,   { damping: 7, stiffness: 180 }),
          withSpring(-22, { damping: 6, stiffness: 200 }),
          withSpring(0,   { damping: 8, stiffness: 200 })
        );
        rot.value = withSequence(
          withTiming(25, { duration: 120 }), withTiming(-25, { duration: 120 }),
          withTiming(12, { duration: 100 }), withTiming(0,   { duration: 90 })
        );
        opacity.value = withDelay(580, withTiming(0, { duration: 300 }));
        schedule(() => setConsumed(true), 980);
        break;

      case "crown":
      case "accessory":
        // Shrink + fade, then mount as a worn overlay on the character
        scale.value   = withSpring(0.62, { damping: 10, stiffness: 200 });
        opacity.value = withDelay(320, withTiming(0, { duration: 220 }));
        schedule(() => {
          setConsumed(true);
          const worn: WornItemDef = {
            id: item.id,
            image: item.image,
            size: Math.round(item.size * 0.72),
            category: cat,
          };
          attachWornItem(charId, worn);
        }, 600);
        break;
    }

    triggerReaction(charId, cat);
  }, [item, rot, scale, opacity, floatY, attachWornItem, triggerReaction, schedule]);

  // ── Pan gesture ───────────────────────────────────────────────────────────
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin(() => {
          hasMoved.value   = false;
          isDragging.value = true;
          activeDrags.value += 1;
          savedX.value = posX.value;
          savedY.value = posY.value;
          scale.value = withSpring(1.08, LIFT_SPRING);
          runOnJS(onLift)();
        })
        .onUpdate((e) => {
          if (Math.abs(e.translationX) + Math.abs(e.translationY) > DRAG_THRESHOLD) {
            hasMoved.value = true;
          }
          if (!hasMoved.value) return;
          posX.value = savedX.value + e.translationX;
          posY.value = savedY.value + e.translationY;
        })
        .onFinalize(() => {
          isDragging.value  = false;
          activeDrags.value = Math.max(0, activeDrags.value - 1);

          if (!hasMoved.value) {
            // ── Tap: bounce + wiggle ─────────────────────────────────────
            scale.value = withSequence(
              withSpring(1.45, { damping: 7, stiffness: 280 }),
              withSpring(0.88, { damping: 10, stiffness: 200 }),
              withSpring(1.0,  { damping: 12, stiffness: 180 })
            );
            rot.value = withSequence(
              withTiming(-14, { duration: 70 }), withTiming(14, { duration: 70 }),
              withTiming(-6,  { duration: 60 }), withTiming(0,  { duration: 60 })
            );
            runOnJS(onTap)();
          } else {
            // ── Proximity check — interact with nearby character ──────────
            const propCX = posX.value + sizeSV.value / 2;
            const propCY = posY.value + sizeSV.value / 2;
            let closestId   = "";
            let closestDist = PROXIMITY_PX;
            const rects = charRects.value;
            for (const cid in rects) {
              const r  = rects[cid];
              const dx = propCX - (r.x + r.w / 2);
              const dy = propCY - (r.y + r.h / 2);
              const d  = Math.sqrt(dx * dx + dy * dy);
              if (d < closestDist) { closestDist = d; closestId = cid; }
            }

            if (closestId) {
              runOnJS(onNearCharacter)(closestId);
            } else {
              // Normal drop — snap back into scene bounds
              const maxX = sceneWSV.value - sizeSV.value;
              const maxY = shSV.value - sizeSV.value - HUD_HEIGHT;
              posX.value  = withSpring(Math.max(0, Math.min(maxX, posX.value)), DROP_SPRING);
              posY.value  = withSpring(Math.max(0, Math.min(maxY, posY.value)), DROP_SPRING);
              scale.value = withSpring(1, SCALE_SPRING);
              runOnJS(onDrop)();
            }
          }
        }),
    [
      posX, posY, savedX, savedY, scale, rot,
      hasMoved, isDragging,
      sceneWSV, swSV, shSV, sizeSV,
      activeDrags, sceneOffsetX,
      charRects,
      onLift, onTap, onDrop, onNearCharacter,
    ]
  );

  // ── Reset on home press ────────────────────────────────────────────────────
  useEffect(() => {
    if (resetKey === 0) return;
    posX.value    = withSpring(initX, { damping: 14, stiffness: 80 });
    posY.value    = withSpring(initY, { damping: 14, stiffness: 80 });
    opacity.value = 1;
    floatY.value  = 0;
  }, [resetKey, initX, initY, posX, posY, opacity, floatY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: posX.value - sceneOffsetX.value },
      { translateY: posY.value + floatY.value },
      { scale: scale.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  // Consumed items vanish (scene-change key causes unmount + fresh remount)
  if (consumed) return null;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.wrapper,
          { width: item.size, height: item.size, zIndex: elevated ? 999 : 1 },
          animStyle,
        ]}
      >
        <Image
          source={item.image}
          style={{ width: item.size, height: item.size }}
          resizeMode="contain"
          accessibilityLabel={item.id.replace(/_/g, " ")}
        />
        <SparkleParticles active={sparkle} count={tapCount > 3 ? 14 : 8} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
