import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
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
import { ClipPath, Defs, Path, Rect, Svg } from 'react-native-svg';

import { MAGIC_POTIONS, MagicPotion } from '@/constants/potions';
import { useColors } from '@/hooks/useColors';

// Allow Animated values as SVG props
const AnimatedRect = Animated.createAnimatedComponent(Rect as any);

// ── Brewing is only enabled for this one potion (for now) ────────────────────
const BREW_POTION_ID = 'p1';

// Burst particle colours + geometry
const PARTICLE_COLORS = ['#FFD700', '#FF69B4', '#87CEEB', '#FF8C00', '#98FB98', '#DDA0DD', '#F0E68C', '#FF69B4'];
const BURST_ANGLES    = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
const BURST_RADIUS    = 88;

// Bottle SVG path (shared between fill clip and outline)
const BOTTLE_PATH = 'M 34,22 L 34,46 Q 12,58 12,78 L 12,140 Q 12,158 50,158 Q 88,158 88,140 L 88,78 Q 88,58 66,46 L 66,22 Z';

// ── BrewingCard ──────────────────────────────────────────────────────────────
function BrewingCard({ potion }: { potion: MagicPotion }) {
  const colors = useColors();

  const [brewed,       setBrewed]       = useState<Set<number>>(new Set());
  const [showComplete, setShowComplete] = useState(false);

  const fillAnim  = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const total      = potion.ingredients.length;
  const isComplete = brewed.size === total;

  // Bottle fill: liquid rect top edge animated from 158 (empty) → 28 (full)
  const fillY  = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [158, 28] });
  // Bottle shake: rotates slightly on each ingredient tap
  const rotate = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-9deg', '0deg', '9deg'] });

  const handleIngredientTap = (index: number) => {
    if (brewed.has(index)) return;

    const next = new Set(brewed);
    next.add(index);
    setBrewed(next);

    // Animate fill level (spring for a satisfying bubble effect)
    Animated.spring(fillAnim, {
      toValue: next.size / total,
      useNativeDriver: false,
      bounciness: 12,
      speed: 7,
    }).start();

    // Shake the bottle
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Trigger burst when all ingredients are added
    if (next.size === total) {
      setTimeout(() => {
        setShowComplete(true);
        Animated.timing(burstAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 380);
    }
  };

  return (
    <View style={[styles.brewBody, { borderTopColor: colors.border }]}>

      {/* ── Bottle + burst ─────────────────────────────── */}
      <View style={styles.bottleZone}>

        {/* Burst particles — expand from bottle centre on completion */}
        {showComplete && BURST_ANGLES.map((angle, i) => {
          const tx = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * BURST_RADIUS] });
          const ty = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * BURST_RADIUS] });
          const sc = burstAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 1.8, 1.0] });
          const op = burstAnim.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] });
          return (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[
                styles.particle,
                { backgroundColor: PARTICLE_COLORS[i] },
                { opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }] },
              ]}
            />
          );
        })}

        {/* Extra star burst particles (offset angles) */}
        {showComplete && BURST_ANGLES.map((angle, i) => {
          const offset = angle + Math.PI / 8;
          const tx = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(offset) * (BURST_RADIUS * 0.6)] });
          const ty = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(offset) * (BURST_RADIUS * 0.6)] });
          const sc = burstAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.4, 0.7] });
          const op = burstAnim.interpolate({ inputRange: [0, 0.2, 0.9, 1], outputRange: [0, 1, 1, 0] });
          return (
            <Animated.View
              key={`s${i}`}
              pointerEvents="none"
              style={[
                styles.starParticle,
                { borderColor: PARTICLE_COLORS[(i + 3) % 8] },
                { opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }, { rotate: '45deg' }] },
              ]}
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

            {/* Interior glass background */}
            <Path d={BOTTLE_PATH} fill="rgba(255,255,255,0.55)" />

            {/* Liquid fill — animated y */}
            <AnimatedRect
              x="0"
              y={fillY as any}
              width="100"
              height="165"
              fill={potion.accentColor}
              opacity="0.78"
              clipPath={`url(#brew-${potion.id})`}
            />

            {/* Glass shine highlight */}
            <Path
              d="M 23,82 Q 19,110 23,134"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />

            {/* Bottle outline */}
            <Path
              d={BOTTLE_PATH}
              stroke={potion.accentColor}
              strokeWidth="3.5"
              fill="none"
            />

            {/* Neck top edge */}
            <Path d="M 34,22 L 66,22" stroke={potion.accentColor} strokeWidth="2" fill="none" />

            {/* Cork body */}
            <Rect x="29" y="2" width="42" height="22" rx="8" fill={potion.accentColor} />
            {/* Cork shine */}
            <Rect x="34" y="7" width="32" height="9" rx="4" fill="rgba(255,255,255,0.32)" />
          </Svg>
        </Animated.View>

        {/* Progress / complete label */}
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

      {/* ── Ingredient tap list ────────────────────────── */}
      <Text style={[styles.recipeSection, { color: colors.deepPurple, marginBottom: 10 }]}>
        Tap each ingredient to add it:
      </Text>

      {potion.ingredients.map((ing, i) => {
        const done = brewed.has(i);
        return (
          <Pressable
            key={i}
            onPress={() => handleIngredientTap(i)}
            disabled={done}
            style={({ pressed }) => [
              styles.ingChip,
              {
                backgroundColor: done ? potion.accentColor + '22' : colors.card,
                borderColor:     done ? potion.accentColor        : colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons
              name={done ? 'checkmark-circle' : 'add-circle-outline'}
              size={22}
              color={done ? potion.accentColor : colors.textMuted}
            />
            <Text style={[
              styles.ingChipText,
              {
                color:              done ? potion.accentColor : colors.textDark,
                fontWeight:         done ? '600' : '400',
                textDecorationLine: done ? 'line-through' : 'none',
              },
            ]}>
              {ing}
            </Text>
          </Pressable>
        );
      })}

      {/* Magic footer */}
      <View style={[styles.magicFooter, { backgroundColor: potion.cardColor, marginTop: 14 }]}>
        <MaterialCommunityIcons name="shimmer" size={16} color={potion.accentColor} />
        <Text style={[styles.magicFooterText, { color: potion.accentColor }]}>
          Always brew with a grown-up's help!
        </Text>
      </View>
    </View>
  );
}

// ── PotionsScreen ────────────────────────────────────────────────────────────
export default function PotionsScreen() {
  const colors = useColors();
  const [expandedId, setExpandedId] = useState<string | null>('p1');

  const topPad    = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={['#FFD6EC', '#EDD6FF', '#D6EEFF', '#D6FFE8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.deepPurple }]}>Magic Potions</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{MAGIC_POTIONS.length} recipes to brew at home</Text>
        </View>

        {MAGIC_POTIONS.map((potion) => {
          const isExpanded   = expandedId === potion.id;
          const isBrewing    = potion.id === BREW_POTION_ID;

          return (
            <Pressable
              key={potion.id}
              onPress={() => handleToggle(potion.id)}
              style={({ pressed }) => [
                styles.potionCard,
                { borderColor: isExpanded ? potion.accentColor : colors.border, opacity: pressed ? 0.95 : 1 },
              ]}
            >
              {/* ── Card top: image / gradient + info ── */}
              <View style={styles.cardTop}>
                {potion.image ? (
                  <Image source={potion.image} style={styles.potionImage} contentFit="cover" />
                ) : (
                  <LinearGradient
                    colors={[potion.cardColor, potion.accentColor + '40']}
                    style={styles.potionImagePlaceholder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name="flask-round-bottom" size={52} color={potion.accentColor} />
                  </LinearGradient>
                )}
                <View style={styles.cardInfo}>
                  {/* Brew badge for the interactive potion */}
                  {isBrewing && (
                    <View style={[styles.brewBadge, { backgroundColor: potion.accentColor + '22', borderColor: potion.accentColor + '55' }]}>
                      <MaterialCommunityIcons name="flask-round-bottom" size={12} color={potion.accentColor} />
                      <Text style={[styles.brewBadgeText, { color: potion.accentColor }]}>Interactive Brew!</Text>
                    </View>
                  )}
                  <View style={[styles.effectBadge, { backgroundColor: potion.accentColor + '22' }]}>
                    <MaterialCommunityIcons name="star-four-points" size={12} color={potion.accentColor} />
                    <Text style={[styles.effectText, { color: potion.accentColor }]} numberOfLines={2}>
                      {potion.effect}
                    </Text>
                  </View>
                  <Text style={[styles.potionName, { color: colors.deepPurple }]}>{potion.name}</Text>
                  <View style={styles.expandRow}>
                    <Text style={[styles.expandLabel, { color: colors.textMuted }]}>
                      {isExpanded
                        ? 'Tap to collapse'
                        : isBrewing
                          ? 'Tap to start brewing!'
                          : `${potion.ingredients.length} ingredients`}
                    </Text>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                  </View>
                </View>
              </View>

              {/* ── Expanded content ── */}
              {isExpanded && (
                isBrewing
                  ? <BrewingCard potion={potion} />
                  : (
                    <View style={[styles.recipeBody, { borderTopColor: colors.border }]}>
                      <Text style={[styles.recipeSection, { color: colors.deepPurple }]}>Ingredients</Text>
                      {potion.ingredients.map((ing, i) => (
                        <View key={i} style={styles.ingredientRow}>
                          <View style={[styles.ingredientDot, { backgroundColor: potion.accentColor }]} />
                          <Text style={[styles.ingredientText, { color: colors.textDark }]}>{ing}</Text>
                        </View>
                      ))}
                      <Text style={[styles.recipeSection, { color: colors.deepPurple, marginTop: 14 }]}>Instructions</Text>
                      <Text style={[styles.instructionsText, { color: colors.textDark }]}>{potion.instructions}</Text>
                      <View style={[styles.magicFooter, { backgroundColor: potion.cardColor }]}>
                        <MaterialCommunityIcons name="shimmer" size={16} color={potion.accentColor} />
                        <Text style={[styles.magicFooterText, { color: potion.accentColor }]}>Always brew with a grown-up's help!</Text>
                      </View>
                    </View>
                  )
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

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
  cardTop:              { flexDirection: 'row', gap: 0 },
  potionImage:          { width: 110, height: 120 },
  potionImagePlaceholder: { width: 110, height: 120, alignItems: 'center', justifyContent: 'center' },
  cardInfo:             { flex: 1, padding: 12, justifyContent: 'space-between' },
  brewBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, marginBottom: 6, alignSelf: 'flex-start',
  },
  brewBadgeText:  { fontSize: 10, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  effectBadge:    { flexDirection: 'row', alignItems: 'flex-start', gap: 5, borderRadius: 8, padding: 6, marginBottom: 6 },
  effectText:     { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1, lineHeight: 15 },
  potionName:     { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 6 },
  expandRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expandLabel:    { fontSize: 12, fontFamily: 'Inter_400Regular' },

  // Standard recipe body (non-brewing potions)
  recipeBody:      { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1 },
  recipeSection:   { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 8 },
  ingredientRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ingredientDot:   { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  ingredientText:  { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  instructionsText:{ fontSize: 14, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  magicFooter:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, padding: 10, borderRadius: 12 },
  magicFooterText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  // ── BrewingCard ──────────────────────────────────────────────────────────
  brewBody: {
    paddingHorizontal: 16, paddingVertical: 18,
    borderTopWidth: 1,
  },
  bottleZone: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 220,
    position: 'relative',
  },
  // Burst particles
  particle: {
    position: 'absolute',
    width: 14, height: 14, borderRadius: 7,
  },
  starParticle: {
    position: 'absolute',
    width: 10, height: 10,
    borderWidth: 2, borderRadius: 2,
  },
  brewProgress: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  brewProgressComplete: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  // Ingredient tappable chips
  ingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 14, borderWidth: 1.5, marginBottom: 8,
  },
  ingChipText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
});
