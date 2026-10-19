import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Character } from "@/components/Character";
import { HUD } from "@/components/HUD";
import { SceneProp } from "@/components/SceneProp";
import { useSceneAudio } from "@/hooks/useSceneAudio";
import { SceneId, getBackground } from "@/constants/backgrounds";
import { CHARACTERS } from "@/constants/characters";
import { SCENE_ITEMS } from "@/constants/sceneItems";
import { useAppContext } from "@/context/AppContext";

const SCENE_MULTIPLIER = 2.5;

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { sceneOffsetX, activeDrags, resetKey, currentScene, activeCharacters } =
    useAppContext();

  const sceneWidth = width * SCENE_MULTIPLIER;
  const maxOffset = sceneWidth - width;
  const bg = getBackground(currentScene as SceneId);
  const sceneItems = SCENE_ITEMS[currentScene as SceneId] ?? [];
  useSceneAudio();

  // Randomise item positions on the ground each time the scene changes.
  // Items are spread evenly across the full panorama width with random Y
  // in the lower 60-82% of the screen so they sit on the ground.
  const randomizedItems = useMemo(() => {
    const n = sceneItems.length;
    return sceneItems.map((item, i) => {
      void resetKey; // re-roll the layout when the valley is tidied up
      const baseX  = ((i + 0.5) / n) * 1.18;                     // even spread
      const jitter = (Math.random() - 0.5) * (1.0 / n);           // per-slot jitter
      const xFraction = Math.max(0.02, Math.min(1.28, baseX + jitter));
      const yFraction = 0.60 + Math.random() * 0.22;              // ground band
      return { ...item, xFraction, yFraction };
    });
  }, [sceneItems, resetKey]); // new layout on scene change or tidy-up

  const savedOffset = useSharedValue(0);
  const maxOffsetSV = useSharedValue(maxOffset);

  useEffect(() => {
    maxOffsetSV.value = maxOffset;
  }, [maxOffset, maxOffsetSV]);

  useEffect(() => {
    if (resetKey === 0) return;
    sceneOffsetX.value = withSpring(0, { damping: 26, stiffness: 90 });
  }, [resetKey, sceneOffsetX]);

  const scenePan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => { savedOffset.value = sceneOffsetX.value; })
        .onUpdate((e) => {
          if (activeDrags.value > 0) return;
          const next = savedOffset.value - e.translationX;
          sceneOffsetX.value = Math.max(0, Math.min(maxOffsetSV.value, next));
        })
        .onEnd((e) => {
          if (activeDrags.value > 0) return;
          const momentum = -e.velocityX * 0.2;
          const target = Math.max(0, Math.min(maxOffsetSV.value, sceneOffsetX.value + momentum));
          sceneOffsetX.value = withSpring(target, { damping: 30, stiffness: 80, mass: 1 });
        }),
    [sceneOffsetX, activeDrags, savedOffset, maxOffsetSV]
  );

  const sceneAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -sceneOffsetX.value }],
  }));

  return (
    <GestureDetector gesture={scenePan}>
      <View style={styles.container}>
        <StatusBar hidden />

        {/* Panoramic background */}
        <Animated.View
          style={[styles.sceneLayer, { width: sceneWidth, height, pointerEvents: "box-none" }, sceneAnimStyle]}
        >
          <Image
            source={bg.image}
            style={{ width: sceneWidth, height }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Discoverable scene items — randomly placed on the ground */}
        {randomizedItems.map((item) => (
          <SceneProp
            /* resetKey is part of the key so "Tidy up" remounts every prop,
               which is what brings consumed items back into the scene. */
            key={`${currentScene}-${resetKey}-${item.id}`}
            item={item}
            sceneWidth={sceneWidth}
            screenWidth={width}
            screenHeight={height}
          />
        ))}

        {/* Edge hint */}
        <ScrollEdgeHint side="right" />

        {/* Characters — only render active ones (filter = toggle on/off) */}
        {CHARACTERS.filter((c) => activeCharacters.includes(c.id)).map((config) => (
          <Character
            key={config.id}
            config={config}
            screenWidth={width}
            screenHeight={height}
            sceneWidth={sceneWidth}
          />
        ))}

        <HUD bottomInset={insets.bottom} />
      </View>
    </GestureDetector>
  );
}

function ScrollEdgeHint({ side }: { side: "left" | "right" }) {
  return (
    <View
      style={[styles.edgeHint, side === "right" ? styles.edgeRight : styles.edgeLeft, { pointerEvents: "none" }]}
    >
      <Text style={styles.edgeArrow}>{side === "right" ? "›" : "‹"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#C8A8E8", overflow: "hidden" },
  sceneLayer: { position: "absolute", top: 0, left: 0 },
  edgeHint: {
    position: "absolute",
    top: "40%",
    width: 28,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.35)",
    zIndex: 150,
  },
  edgeRight: { right: 4 },
  edgeLeft: { left: 4 },
  edgeArrow: { fontSize: 26, color: "rgba(255,255,255,0.9)", fontWeight: "700", lineHeight: 30 },
});
