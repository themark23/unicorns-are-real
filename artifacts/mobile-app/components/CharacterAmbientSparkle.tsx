/**
 * CharacterAmbientSparkle
 *
 * Three tiny sparkle stars that subtly pulse around each unicorn character.
 * These use Reanimated transforms only (opacity + scale) — no layout properties
 * are animated, and the container is fully pointer-events-transparent so it
 * never interferes with drag or tap.
 *
 * Ported from the CSS unicorn-character-animations spec to React Native / Reanimated.
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const CYCLE_MS     = 3600;
const QUIET_MS     = 2410;  // time before sparkle appears
const APPEAR_MS    = 220;
const SUSTAIN_MS   = 550;
const FADE_MS      = 420;

interface SparklePointProps {
  leftFraction: number;  // 0–1 fraction of containerW
  topFraction:  number;  // 0–1 fraction of containerH
  sizePx:       number;
  delayMs:      number;
  color:        string;
  containerW:   number;
  containerH:   number;
}

function SparklePoint({
  leftFraction, topFraction, sizePx, delayMs, color, containerW, containerH,
}: SparklePointProps) {
  const opacity = useSharedValue(0);
  const scale   = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withDelay(
        delayMs,
        withSequence(
          withTiming(0,    { duration: QUIET_MS }),
          withTiming(0.85, { duration: APPEAR_MS }),
          withTiming(0.25, { duration: SUSTAIN_MS }),
          withTiming(0,    { duration: FADE_MS })
        )
      ),
      -1,
      false
    );

    scale.value = withRepeat(
      withDelay(
        delayMs,
        withSequence(
          withTiming(0.3, { duration: QUIET_MS }),
          withTiming(1.0, { duration: APPEAR_MS }),
          withTiming(0.7, { duration: SUSTAIN_MS }),
          withTiming(0.3, { duration: FADE_MS })
        )
      ),
      -1,
      false
    );
  }, [delayMs, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text
      accessible={false}
      style={[
        styles.sparkle,
        {
          color,
          fontSize: sizePx,
          left:     leftFraction * containerW,
          top:      topFraction  * containerH,
        },
        animStyle,
      ]}
    >
      ✦
    </Animated.Text>
  );
}

interface CharacterAmbientSparkleProps {
  sparkleColor: string;
  glowColor:    string;
  width:        number;   // character rendered width (dp)
  height:       number;   // character rendered height (dp)
}

export function CharacterAmbientSparkle({
  sparkleColor, glowColor, width, height,
}: CharacterAmbientSparkleProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <SparklePoint
        leftFraction={0.52} topFraction={0.10}
        sizePx={10} delayMs={0}
        color={sparkleColor}
        containerW={width} containerH={height}
      />
      <SparklePoint
        leftFraction={0.78} topFraction={0.34}
        sizePx={7} delayMs={850}
        color={glowColor}
        containerW={width} containerH={height}
      />
      <SparklePoint
        leftFraction={0.20} topFraction={0.38}
        sizePx={6} delayMs={1600}
        color={sparkleColor}
        containerW={width} containerH={height}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: "absolute",
  },
});
