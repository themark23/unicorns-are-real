import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Circle, ClipPath, Defs, Path, Rect, Svg } from 'react-native-svg';

import { MAGIC_POTIONS, MagicPotion } from '@/constants/potions';
import { useColors } from '@/hooks/useColors';

const AnimatedRect   = Animated.createAnimatedComponent(Rect   as any);
const AnimatedCircle = Animated.createAnimatedComponent(Circle as any);

/* ── helpers ─────────────────────────────────────────────────── */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const PARTICLE_COLORS = ['#FFD700','#FF69B4','#87CEEB','#FF8C00','#98FB98','#DDA0DD','#F0E68C','#FF69B4'];
const BURST_ANGLES    = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
const BURST_RADIUS    = 88;
const BOTTLE_PATH     = 'M 34,22 L 34,46 Q 12,58 12,78 L 12,140 Q 12,158 50,158 Q 88,158 88,140 L 88,78 Q 88,58 66,46 L 66,22 Z';

/* ── BrewingCard ──────────────────────────────────────────────── */
function BrewingCard({ potion }: { potion: MagicPotion }) {
  const colors = useColors();

  const [brewed,       setBrewed]       = useState<Set<number>>(new Set());
  const [showComplete, setShowComplete] = useState(false);

  const fillAnim  = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const total      = potion.ingredients.length;
  const isComplete = brewed.size === total;

  const bubbleAnims = useRef([
    new Animated.Value(0.0),
    new Animated.Value(0.4),
    new Animated.Value(0.72),
  ]).current;
  const sparkleAnims = useRef([0, 0, 0, 0].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const DURATIONS = [2400, 3100, 2750];
    bubbleAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.timing(anim, { toValue: 1, duration: DURATIONS[i], easing: Easing.linear, useNativeDriver: false })
      ).start();
    });
    sparkleAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 450),
          Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0, duration: 380, useNativeDriver: false }),
          Animated.delay(900 + i * 250),
        ])
      ).start();
    });
  }, []);

  /* Fill Y: liquid rises from 158 (empty) → 28 (full) */
  const fillY  = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [158, 28] });
  const rotate = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-9deg', '0deg', '9deg'] });

  /* Fill COLOR: each ingredient step shifts the liquid toward the final accent */
  const colorInputRange  = Array.from({ length: total + 1 }, (_, i) => i / total);
  const colorOutputRange = [
    hexToRgba(potion.ingredientColors[0], 0.0),       // invisible when empty
    ...potion.ingredientColors.map((c, i) =>
      hexToRgba(c, 0.72 + (i / (total - 1)) * 0.2)   // ramps from 0.72 → 0.92 opacity
    ),
  ];
  const fillColor = fillAnim.interpolate({
    inputRange:  colorInputRange,
    outputRange: colorOutputRange,
  });

  const handleIngredientTap = (index: number) => {
    if (brewed.has(index)) return;

    const next = new Set(brewed);
    next.add(index);
    setBrewed(next);

    Animated.spring(fillAnim, {
      toValue:   next.size / total,
      useNativeDriver: false,
      bounciness: 12,
      speed: 7,
    }).start();

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (next.size === total) {
      setTimeout(() => {
        setShowComplete(true);
        Animated.timing(burstAnim, {
          toValue: 1, duration: 750,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 380);
    }
  };

  return (
    <View style={[styles.brewBody, { borderTopColor: colors.border }]}>

      {/* ── Bottle + burst ──────────────────────────────────── */}
      <View style={styles.bottleZone}>

        {/* Burst particles */}
        {showComplete && BURST_ANGLES.map((angle, i) => {
          const tx = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * BURST_RADIUS] });
          const ty = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * BURST_RADIUS] });
          const sc = burstAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 1.8, 1.0] });
          const op = burstAnim.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] });
          return (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[styles.particle, { backgroundColor: PARTICLE_COLORS[i] },
                { opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }] }]}
            />
          );
        })}

        {showComplete && BURST_ANGLES.map((angle, i) => {
          const offset = angle + Math.PI / 8;
          const tx = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(offset) * (BURST_RADIUS * 0.6)] });
          const ty = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(offset) * (BURST_RADIUS * 0.6)] });
          const sc = burstAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.4, 0.7] });
          const op = burstAnim.interpolate({ inputRange: [0, 0.2, 0.9, 1], outputRange: [0, 1, 1, 0] });
          return (
            <Animated.View key={`s${i}`} pointerEvents="none"
              style={[styles.starParticle, { borderColor: PARTICLE_COLORS[(i + 3) % 8] },
                { opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }, { rotate: '45deg' }] }]}
            />
          );
        })}

        {/* SVG Bottle */}
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Svg width={110} height={175} viewBox="0 0 100 165">
            <Defs>
              <ClipPath id={`brew-${potion.id}`}>
                <Path d={BOTTLE_PATH} />
              </ClipPath>
            </Defs>

            {/* Glass background */}
            <Path d={BOTTLE_PATH} fill="rgba(255,255,255,0.55)" />

            {/* Animated liquid — color AND level both change */}
            <AnimatedRect
              x="0"
              y={fillY as any}
              width="100"
              height="165"
              fill={fillColor as any}
              clipPath={`url(#brew-${potion.id})`}
            />

            {/* Bubbles: 3 rising circles */}
            {brewed.size > 0 && (() => {
              const CX = [32, 54, 70];
              const R  = [4,  5,  3.5];
              return bubbleAnims.map((anim, i) => {
                const cy = anim.interpolate({ inputRange: [0, 1], outputRange: [152, 30] });
                const cx = anim.interpolate({
                  inputRange: [0, 0.2, 0.5, 0.8, 1],
                  outputRange: [CX[i], CX[i] + 5, CX[i] - 4, CX[i] + 3, CX[i]],
                });
                const op = anim.interpolate({ inputRange: [0, 0.08, 0.85, 1], outputRange: [0, 0.75, 0.75, 0] });
                return (
                  <AnimatedCircle key={`b${i}`}
                    cx={cx as any} cy={cy as any} r={R[i]}
                    fill="white" opacity={op as any}
                    clipPath={`url(#brew-${potion.id})`}
                  />
                );
              });
            })()}

            {/* Sparkles: blinking dots inside liquid */}
            {brewed.size > 0 && (() => {
              const POSITIONS = [[38, 120], [64, 100], [44, 138], [68, 115]];
              return sparkleAnims.map((anim, i) => (
                <AnimatedCircle key={`sp${i}`}
                  cx={POSITIONS[i][0]} cy={POSITIONS[i][1]}
                  r="2.5" fill="white" opacity={anim as any}
                  clipPath={`url(#brew-${potion.id})`}
                />
              ));
            })()}

            {/* Glass shine */}
            <Path d="M 23,82 Q 19,110 23,134"
              stroke="rgba(255,255,255,0.65)" strokeWidth="7"
              strokeLinecap="round" fill="none"
            />

            {/* Bottle outline */}
            <Path d={BOTTLE_PATH}
              stroke={potion.accentColor} strokeWidth="3.5" fill="none"
            />

            {/* Neck line */}
            <Path d="M 34,22 L 66,22" stroke={potion.accentColor} strokeWidth="2" fill="none" />

            {/* Cork */}
            <Rect x="29" y="2" width="42" height="22" rx="8" fill={potion.accentColor} />
            <Rect x="34" y="7" width="32" height="9"  rx="4" fill="rgba(255,255,255,0.32)" />
          </Svg>
        </Animated.View>

        <Text style={[
          styles.brewProgress,
          { color: isComplete ? potion.accentColor : colors.textMuted },
          isComplete && styles.brewProgressComplete,
        ]}>
          {isComplete
            ? '✨ Potion Complete!'
            : `${brewed.size} / ${total} ingredients added`}
        </Text>
      </View>

      {/* ── Ingredient tap list ──────────────────────────────── */}
      <Text style={[styles.recipeSection, { color: colors.deepPurple, marginBottom: 12 }]}>
        Tap each ingredient to add it:
      </Text>

      {potion.ingredients.map((ing, i) => {
        const done  = brewed.has(i);
        const emoji = potion.ingredientEmojis[i] ?? '✨';
        const stepColor = potion.ingredientColors[i] ?? potion.accentColor;
        return (
          <Pressable
            key={i}
            onPress={() => handleIngredientTap(i)}
            disabled={done}
            style={({ pressed }) => [
              styles.ingChip,
              {
                backgroundColor: done ? stepColor + '1A' : colors.card,
                borderColor:     done ? stepColor        : colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            {/* Emoji badge */}
            <View style={[
              styles.ingEmojiWrap,
              { backgroundColor: done ? stepColor + '30' : colors.muted },
            ]}>
              <Text style={styles.ingEmoji}>{emoji}</Text>
            </View>

            {/* Ingredient text */}
            <Text style={[
              styles.ingChipText,
              {
                color:              done ? stepColor : colors.textDark,
                textDecorationLine: done ? 'line-through' : 'none',
                fontWeight:         done ? '600' : '400',
              },
            ]}>
              {ing}
            </Text>

            {/* Status icon */}
            <Ionicons
              name={done ? 'checkmark-circle' : 'add-circle-outline'}
              size={24}
              color={done ? stepColor : colors.textMuted}
            />
          </Pressable>
        );
      })}

      {/* Footer */}
      <View style={[styles.magicFooter, { backgroundColor: potion.cardColor, marginTop: 14 }]}>
        <MaterialCommunityIcons name="shimmer" size={16} color={potion.accentColor} />
        <Text style={[styles.magicFooterText, { color: potion.accentColor }]}>
          Always brew with a grown-up's help!
        </Text>
      </View>
    </View>
  );
}

/* ── PotionsScreen ────────────────────────────────────────────── */
export default function PotionsScreen() {
  const colors    = useColors();
  const [expandedId, setExpandedId] = useState<string | null>('p1');
  const topPad    = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={['#FFD6EC', '#EDD6FF', '#D6EEFF', '#D6FFE8']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.deepPurple }]}>Magic Potions</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {MAGIC_POTIONS.length} recipes to brew at home
          </Text>
        </View>

        {MAGIC_POTIONS.map((potion) => {
          const isExpanded = expandedId === potion.id;
          return (
            <Pressable
              key={potion.id}
              onPress={() => {
                setExpandedId((prev) => (prev === potion.id ? null : potion.id));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                styles.potionCard,
                { borderColor: isExpanded ? potion.accentColor : colors.border, opacity: pressed ? 0.95 : 1 },
              ]}
            >
              {/* ── Card top ── */}
              <View style={styles.cardTop}>
                {potion.image ? (
                  <Image source={potion.image} style={styles.potionImage} contentFit="cover" />
                ) : (
                  <LinearGradient
                    colors={[potion.cardColor, potion.accentColor + '40']}
                    style={styles.potionImagePlaceholder}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name="flask" size={52} color={potion.accentColor} />
                  </LinearGradient>
                )}
                <View style={styles.cardInfo}>
                  <View style={[styles.effectBadge, { backgroundColor: potion.accentColor + '22' }]}>
                    <MaterialCommunityIcons name="star-four-points" size={12} color={potion.accentColor} />
                    <Text style={[styles.effectText, { color: potion.accentColor }]} numberOfLines={2}>
                      {potion.effect}
                    </Text>
                  </View>
                  <Text style={[styles.potionName, { color: colors.deepPurple }]}>{potion.name}</Text>

                  {/* Ingredient emoji preview row */}
                  <View style={styles.emojiPreviewRow}>
                    {potion.ingredientEmojis.slice(0, 5).map((em, i) => (
                      <Text key={i} style={styles.emojiPreview}>{em}</Text>
                    ))}
                    {potion.ingredientEmojis.length > 5 && (
                      <Text style={[styles.emojiPreviewMore, { color: colors.textMuted }]}>
                        +{potion.ingredientEmojis.length - 5}
                      </Text>
                    )}
                  </View>

                  <View style={styles.expandRow}>
                    <Text style={[styles.expandLabel, { color: colors.textMuted }]}>
                      {isExpanded ? 'Tap to collapse' : 'Tap to start brewing!'}
                    </Text>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                  </View>
                </View>
              </View>

              {isExpanded && <BrewingCard potion={potion} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ── Styles ───────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { paddingHorizontal: 16 },
  header:    { paddingTop: 16, paddingBottom: 16 },
  title:     { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle:  { fontSize: 13, fontFamily: 'Inter_400Regular' },

  potionCard: {
    borderRadius: 20, borderWidth: 1.5,
    marginBottom: 14, overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  cardTop:              { flexDirection: 'row' },
  potionImage:          { width: 110, height: 130 },
  potionImagePlaceholder: { width: 110, height: 130, alignItems: 'center', justifyContent: 'center' },
  cardInfo:             { flex: 1, padding: 12, justifyContent: 'space-between' },
  effectBadge:    { flexDirection: 'row', alignItems: 'flex-start', gap: 5, borderRadius: 8, padding: 6, marginBottom: 6 },
  effectText:     { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1, lineHeight: 15 },
  potionName:     { fontSize: 17, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 4 },
  emojiPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 6 },
  emojiPreview:    { fontSize: 16 },
  emojiPreviewMore: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold', marginLeft: 2 },
  expandRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expandLabel:    { fontSize: 12, fontFamily: 'Inter_400Regular' },

  /* BrewingCard */
  brewBody: { paddingHorizontal: 16, paddingVertical: 18, borderTopWidth: 1 },
  bottleZone: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, height: 220, position: 'relative',
  },
  particle:     { position: 'absolute', width: 14, height: 14, borderRadius: 7 },
  starParticle: { position: 'absolute', width: 10, height: 10, borderWidth: 2, borderRadius: 2 },
  brewProgress: {
    marginTop: 10, fontSize: 14,
    fontWeight: '600', fontFamily: 'Inter_600SemiBold', textAlign: 'center',
  },
  brewProgressComplete: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },

  recipeSection: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  magicFooter:   { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12 },
  magicFooterText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  /* Ingredient chips */
  ingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 16, borderWidth: 1.5, marginBottom: 8,
  },
  ingEmojiWrap: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  ingEmoji:     { fontSize: 28 },
  ingChipText:  { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 19 },
});
