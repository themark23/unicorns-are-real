import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { SPARKLE_COLORS } from "@/constants/unicornColors";

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

interface SparkleParticlesProps {
  active: boolean;
  count?: number;
  /** Override color — when provided, all particles use this color (slightly varied). */
  color?: string;
}

function SingleParticle({
  angle,
  distance,
  color,
  size,
}: {
  angle: number;
  distance: number;
  color: string;
  size: number;
}) {
  const radians = (angle * Math.PI) / 180;
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const dur = 550;
    tx.value = withTiming(Math.cos(radians) * distance, { duration: dur });
    ty.value = withTiming(Math.sin(radians) * distance, { duration: dur });
    opacity.value = withTiming(0, { duration: dur });
    scale.value = withTiming(0.3, { duration: dur });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        animStyle,
      ]}
    />
  );
}

let particleIdCounter = 0;

export function SparkleParticles({ active, count = 8, color }: SparkleParticlesProps) {
  const [particles, setParticles] = React.useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const palette = color
      ? [color, "#FFFFFF", color, "#FFFFFF"]
      : (SPARKLE_COLORS as unknown as string[]);
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: particleIdCounter++,
      angle: (i / count) * 360 + Math.random() * 15,
      distance: 35 + Math.random() * 25,
      color: palette[i % palette.length],
      size: 6 + Math.random() * 5,
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 700);
    return () => clearTimeout(timer);
  }, [active, count, color]);

  if (particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <SingleParticle
          key={p.id}
          angle={p.angle}
          distance={p.distance}
          color={p.color}
          size={p.size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  particle: {
    position: "absolute",
  },
});
