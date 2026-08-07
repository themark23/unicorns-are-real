import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { BACKGROUNDS, SceneId } from "@/constants/backgrounds";
import { CHARACTERS } from "@/constants/characters";
import { getCharacterImage } from "@/constants/characterImages";
import { useAppContext } from "@/context/AppContext";

const CIRCLE   = 46;
const HANDLE_H = 28;
const SNAP     = { damping: 24, stiffness: 220 };

// ── Spring-press wrapper ───────────────────────────────────────────────────
function SpringPress({
  onPress, children, style, accessibilityLabel,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: object;
  accessibilityLabel?: string;
}) {
  const scale     = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPressIn={() => { scale.value = withSpring(0.86, { damping: 12, stiffness: 300 }); }}
      onPressOut={() => {
        scale.value = withSpring(1.06, { damping: 8, stiffness: 250 }, () => {
          scale.value = withSpring(1.0, { damping: 14, stiffness: 220 });
        });
      }}
      hitSlop={6}
    >
      <Animated.View style={[style, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

// ── Character portrait ─────────────────────────────────────────────────────
function CharThumb({ characterId, displayName, isActive, onPress, bodyColor }: {
  characterId: string; displayName: string; isActive: boolean; onPress: () => void; bodyColor: string;
}) {
  const label = isActive
    ? `Remove ${displayName} from scene`
    : `Add ${displayName} to scene`;
  return (
    <SpringPress onPress={onPress} accessibilityLabel={label}>
      <View style={[
        styles.circle,
        isActive
          ? { borderColor: bodyColor, borderWidth: 3 }
          : { borderColor: "rgba(200,200,255,0.35)", opacity: 0.45 },
      ]}>
        <View style={styles.portraitClip}>
          <Image
            source={getCharacterImage(characterId)}
            style={styles.portraitImg}
            resizeMode="cover"
            accessible={false}
          />
        </View>
      </View>
    </SpringPress>
  );
}

// ── Scene thumbnail ────────────────────────────────────────────────────────
function SceneThumb({ scene, isActive, onPress }: {
  scene: (typeof BACKGROUNDS)[number]; isActive: boolean; onPress: () => void;
}) {
  return (
    <SpringPress
      onPress={onPress}
      accessibilityLabel={isActive ? `${scene.label}, current scene` : `Switch to ${scene.label}`}
    >
      <View style={[
        styles.circle,
        isActive
          ? { borderColor: scene.accent, borderWidth: 3 }
          : { borderColor: "rgba(255,255,255,0.45)" },
      ]}>
        <Image source={scene.image} style={styles.sceneImg} resizeMode="cover" accessible={false} />
      </View>
    </SpringPress>
  );
}

// ── HUD ────────────────────────────────────────────────────────────────────
export function HUD({ bottomInset = 0 }: { bottomInset?: number }) {
  const {
    currentScene, setScene,
    toggleCharacter, isCharacterActive,
    soundEnabled, toggleSound, triggerReset,
  } = useAppContext();

  const isIOS = Platform.OS === "ios";

  // Slide: 0 = expanded, maxSlide = only handle visible
  const slideY   = useSharedValue(0);
  const savedY   = useSharedValue(0);
  const maxSlide = useSharedValue(0);
  const expanded = useSharedValue(true);
  const measured = useRef(false);

  // Pan gesture for dragging the handle up/down
  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => { savedY.value = slideY.value; })
        .onUpdate((e) => {
          const next = savedY.value + e.translationY;
          slideY.value = Math.max(0, Math.min(maxSlide.value, next));
        })
        .onEnd((e) => {
          const collapse = e.velocityY > 300 || slideY.value > maxSlide.value * 0.35;
          if (collapse) {
            slideY.value   = withSpring(maxSlide.value, SNAP);
            expanded.value = false;
          } else {
            slideY.value   = withSpring(0, SNAP);
            expanded.value = true;
          }
        }),
    [slideY, savedY, maxSlide, expanded]
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  const onLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    if (measured.current) return;
    measured.current = true;
    maxSlide.value = e.nativeEvent.layout.height - HANDLE_H;
  }, [maxSlide]);

  // Tap on handle bar toggles expand/collapse
  const onHandleTap = useCallback(() => {
    if (expanded.value) {
      slideY.value   = withSpring(maxSlide.value, SNAP);
      expanded.value = false;
    } else {
      slideY.value   = withSpring(0, SNAP);
      expanded.value = true;
    }
  }, [slideY, maxSlide, expanded]);

  // ── Panel content ──────────────────────────────────────────────────────
  const panelContent = (
    <>
      {/* Handle: Pressable tap-toggle + Pan drag */}
      <GestureDetector gesture={dragGesture}>
        <Pressable onPress={onHandleTap} style={styles.handleArea}>
          <View style={styles.handlePill} />
        </Pressable>
      </GestureDetector>

      <View style={{ paddingBottom: bottomInset + 4 }}>
        <View style={styles.row}>
          {CHARACTERS.map((char) => (
            <CharThumb
              key={char.id}
              characterId={char.id}
              displayName={char.displayName}
              isActive={isCharacterActive(char.id)}
              onPress={() => toggleCharacter(char.id)}
              bodyColor={char.bodyColor}
            />
          ))}
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          {BACKGROUNDS.map((scene) => (
            <SceneThumb
              key={scene.id}
              scene={scene}
              isActive={currentScene === scene.id}
              onPress={() => setScene(scene.id as SceneId)}
            />
          ))}
        </View>
        <View style={styles.divider} />
        <View style={styles.utilityRow}>
          <SpringPress
            onPress={toggleSound}
            accessibilityLabel={soundEnabled ? "Turn sound off" : "Turn sound on"}
          >
            <View style={styles.utilityBtn}>
              <Ionicons
                name={soundEnabled ? "volume-high" : "volume-mute"}
                size={18}
                color={soundEnabled ? "#6B4E9E" : "#A99BC4"}
              />
              <Text style={styles.utilityLabel}>
                {soundEnabled ? "Sound on" : "Sound off"}
              </Text>
            </View>
          </SpringPress>

          <SpringPress
            onPress={triggerReset}
            accessibilityLabel="Tidy up the valley: bring back every item and take off hats and crowns"
          >
            <View style={styles.utilityBtn}>
              <Ionicons name="refresh" size={18} color="#6B4E9E" />
              <Text style={styles.utilityLabel}>Tidy up</Text>
            </View>
          </SpringPress>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.anchor}>
      <Animated.View style={animStyle} onLayout={onLayout}>
        {isIOS ? (
          <BlurView intensity={55} tint="light" style={styles.panel}>
            {panelContent}
          </BlurView>
        ) : (
          <View style={[styles.panel, styles.androidBg]}>
            {panelContent}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: "box-none",
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  androidBg: {
    backgroundColor: "rgba(255,255,255,0.93)",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(200,200,255,0.4)",
  },
  handleArea: {
    height: HANDLE_H,
    alignItems: "center",
    justifyContent: "center",
  },
  handlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(150,130,200,0.45)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    backgroundColor: "rgba(180,160,220,0.22)",
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
  },
  portraitClip: { width: CIRCLE, height: CIRCLE, overflow: "hidden" },
  portraitImg: {
    width: CIRCLE,
    height: Math.round(CIRCLE * 1.45),
    marginTop: -2,
  },
  sceneImg: { width: CIRCLE, height: CIRCLE },
  utilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    paddingVertical: 6,
  },
  utilityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(180,160,220,0.35)",
  },
  utilityLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B4E9E",
  },
});
