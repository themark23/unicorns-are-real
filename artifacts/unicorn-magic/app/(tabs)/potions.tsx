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

/* Layout constants for the drop animation */
const BOTTLE_AREA_H  = 195;   // height of the bottle zone above the emoji row
const EMOJI_ROW_H    = 74;    // height of the emoji tap row
const EMOJI_STRIDE   = 66;    // center-to-center distance between emoji chips
// The bottle cork top is at approximately y=14 from the top of brewZone
// The emoji row centre is at BOTTLE_AREA_H + EMOJI_ROW_H/2 from the top
// So the fly distance is: (BOTTLE_AREA_H + EMOJI_ROW_H/2) - 14 ≈ 218
const FLY_DIST_Y     = BOTTLE_AREA_H + EMOJI_ROW_H / 2 - 14;

/* ── BrewingCard ──────────────────────────────────────────────── */
function BrewingCard({ potion }: { potion: MagicPotion }) {
  const colors = useColors();

  const [brewed,       setBrewed]       = useState<Set<number>>(new Set());
  const [showComplete, setShowComplete] = useState(false);
  const [flyEmoji,     setFlyEmoji]     = useState<string | null>(null);

  const fillAnim  = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  /* Flying emoji animation values */
  const flyY   = useRef(new Animated.Value(FLY_DIST_Y)).current;
  const flyX   = useRef(new Animated.Value(0)).current;
  const flyScl = useRef(new Animated.Value(1)).current;
  const flyOp  = useRef(new Animated.Value(0)).current;

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

  const fillY  = fillAnim.interpolate({ inputRange: [0, 1], outputRange: [158, 28] });
  const rotate = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-9deg', '0deg', '9deg'] });

  /* Colour: each ingredient step shifts the liquid toward the final accent */
  const colorInputRange  = Array.from({ length: total + 1 }, (_, i) => i / total);
  const colorOutputRange = [
    hexToRgba(potion.ingredientColors[0], 0.0),
    ...potion.ingredientColors.map((c, i) =>
      hexToRgba(c, 0.72 + (i / Math.max(total - 1, 1)) * 0.2)
    ),
  ];
  const fillColor = fillAnim.interpolate({ inputRange: colorInputRange, outputRange: colorOutputRange });

  const handleEmojiTap = (index: number) => {
    if (brewed.has(index)) return;

    /* Position flying emoji at this chip's x offset from centre */
    const startX = (index - (total - 1) / 2) * EMOJI_STRIDE;
    flyX.setValue(startX);
    flyY.setValue(FLY_DIST_Y);
    flyScl.setValue(1.2);
    flyOp.setValue(1);
    setFlyEmoji(potion.ingredientEmojis[index]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    /* Fly up into bottle, then fill */
    Animated.parallel([
      Animated.timing(flyY, {
        toValue: 0,
        duration: 480,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(flyX, {
        toValue: 0,
        duration: 480,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(flyScl, { toValue: 1.0, duration: 200, useNativeDriver: true }),
        Animated.timing(flyScl, { toValue: 0.15, duration: 280, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(flyOp, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(flyOp, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setFlyEmoji(null);

      const next = new Set(brewed);
      next.add(index);
      setBrewed(next);

      /* Bottle fill spring */
      Animated.spring(fillAnim, {
        toValue: next.size / total,
        useNativeDriver: false,
        bounciness: 12,
        speed: 7,
      }).start();

      /* Bottle shake */
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1,   duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0.5, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
      ]).start();

      if (next.size === total) {
        setTimeout(() => {
          setShowComplete(true);
          Animated.timing(burstAnim, {
            toValue: 1, duration: 750,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }).start();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 350);
      }
    });
  };

  return (
    <View style={[styles.brewBody, { borderTopColor: colors.border }]}>

      {/* ── Combined zone: bottle + emoji row (+ flying emoji overlay) ── */}
      <View style={styles.brewZone}>

        {/* ── Burst particles (absolute, appear on completion) ── */}
        {showComplete && BURST_ANGLES.map((angle, i) => {
          const tx = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * BURST_RADIUS] });
          const ty = burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * BURST_RADIUS] });
          const sc = burstAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 1.8, 1.0] });
          const op = burstAnim.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] });
          return (
            <Animated.View key={i} pointerEvents="none"
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

        {/* ── Bottle area ── */}
        <View style={styles.bottleArea}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Svg width={110} height={175} viewBox="0 0 100 165">
              <Defs>
                <ClipPath id={`brew-${potion.id}`}>
                  <Path d={BOTTLE_PATH} />
                </ClipPath>
              </Defs>
              <Path d={BOTTLE_PATH} fill="rgba(255,255,255,0.55)" />
              <AnimatedRect
                x="0" y={fillY as any} width="100" height="165"
                fill={fillColor as any}
                clipPath={`url(#brew-${potion.id})`}
              />

              {/* Bubbles */}
              {brewed.size > 0 && (() => {
                const CX = [32, 54, 70]; const R = [4, 5, 3.5];
                return bubbleAnims.map((anim, i) => {
                  const cy = anim.interpolate({ inputRange: [0, 1], outputRange: [152, 30] });
                  const cx = anim.interpolate({ inputRange: [0, 0.2, 0.5, 0.8, 1], outputRange: [CX[i], CX[i]+5, CX[i]-4, CX[i]+3, CX[i]] });
                  const op = anim.interpolate({ inputRange: [0, 0.08, 0.85, 1], outputRange: [0, 0.75, 0.75, 0] });
                  return <AnimatedCircle key={`b${i}`} cx={cx as any} cy={cy as any} r={R[i]} fill="white" opacity={op as any} clipPath={`url(#brew-${potion.id})`} />;
                });
              })()}

              {/* Sparkles */}
              {brewed.size > 0 && (() => {
                const POS = [[38, 120], [64, 100], [44, 138], [68, 115]];
                return sparkleAnims.map((anim, i) => (
                  <AnimatedCircle key={`sp${i}`} cx={POS[i][0]} cy={POS[i][1]} r="2.5" fill="white" opacity={anim as any} clipPath={`url(#brew-${potion.id})`} />
                ));
              })()}

              {/* Shine */}
              <Path d="M 23,82 Q 19,110 23,134" stroke="rgba(255,255,255,0.65)" strokeWidth="7" strokeLinecap="round" fill="none" />
              <Path d={BOTTLE_PATH} stroke={potion.accentColor} strokeWidth="3.5" fill="none" />
              <Path d="M 34,22 L 66,22" stroke={potion.accentColor} strokeWidth="2" fill="none" />
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

        {/* ── Emoji tap row ── */}
        <View style={styles.emojiRow}>
          {potion.ingredientEmojis.map((emoji, i) => {
            const done = brewed.has(i);
            const stepColor = potion.ingredientColors[i] ?? potion.accentColor;
            return (
              <Pressable
                key={i}
                onPress={() => handleEmojiTap(i)}
                disabled={done}
                style={({ pressed }) => [
                  styles.emojiChip,
                  {
                    backgroundColor: done ? stepColor + '28' : '#fff',
                    borderColor:     done ? stepColor        : colors.border,
                    transform: [{ scale: pressed ? 0.88 : 1 }],
                    opacity: done ? 0.6 : 1,
                  },
                ]}
              >
                <Text style={styles.emojiChipText}>{emoji}</Text>
                {done && (
                  <View style={[styles.emojiDoneOverlay, { backgroundColor: stepColor + 'CC' }]}>
                    <Text style={styles.emojiDoneTick}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── Tap hint ── */}
        {brewed.size === 0 && (
          <Text style={[styles.tapHint, { color: colors.textMuted }]}>
            Tap an ingredient to drop it in! ☝️
          </Text>
        )}

        {/* ── Flying emoji overlay ── */}
        {flyEmoji !== null && (
          <Animated.Text
            pointerEvents="none"
            style={[
              styles.flyingEmoji,
              {
                transform: [
                  { translateX: flyX },
                  { translateY: flyY },
                  { scale: flyScl },
                ],
                opacity: flyOp,
              },
            ]}
          >
            {flyEmoji}
          </Animated.Text>
        )}
      </View>

      {/* ── Ingredient text list ── */}
      <View style={styles.ingredientList}>
        <Text style={[styles.ingredientListTitle, { color: colors.deepPurple }]}>
          What's in it:
        </Text>
        {potion.ingredients.map((ing, i) => {
          const done      = brewed.has(i);
          const stepColor = potion.ingredientColors[i] ?? potion.accentColor;
          const emoji     = potion.ingredientEmojis[i] ?? '✨';
          return (
            <View key={i} style={styles.ingRow}>
              <Text style={styles.ingRowEmoji}>{emoji}</Text>
              <Text style={[
                styles.ingRowText,
                {
                  color:              done ? stepColor      : colors.textDark,
                  textDecorationLine: done ? 'line-through' : 'none',
                },
              ]}>
                {ing}
              </Text>
              {done && (
                <Ionicons name="checkmark-circle" size={18} color={stepColor} />
              )}
            </View>
          );
        })}
      </View>

      {/* ── How to brew it ── */}
      <View style={styles.instructionsBlock}>
        <Text style={[styles.ingredientListTitle, { color: colors.deepPurple }]}>
          How to brew it:
        </Text>
        <Text style={[styles.instructionsText, { color: colors.textDark }]}>
          {potion.instructions}
        </Text>
      </View>

      {/* Footer */}
      <View style={[styles.magicFooter, { backgroundColor: potion.cardColor, marginTop: 14 }]}>
        <MaterialCommunityIcons name="shimmer" size={16} color={potion.accentColor} />
        <Text style={[styles.magicFooterText, { color: potion.accentColor }]}>
          Always brew with a grown-up&apos;s help — and check the ingredients
          together for anything you&apos;re allergic to!
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
                  {/* Emoji ingredient preview strip */}
                  <View style={styles.emojiPreviewRow}>
                    {potion.ingredientEmojis.slice(0, 6).map((em, i) => (
                      <Text key={i} style={styles.emojiPreview}>{em}</Text>
                    ))}
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
  effectBadge:    { flexDirection: 'row', alignItems: 'flex-start', gap: 5, borderRadius: 8, padding: 6, marginBottom: 4 },
  effectText:     { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1, lineHeight: 15 },
  potionName:     { fontSize: 17, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 4 },
  emojiPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 1, marginBottom: 4 },
  emojiPreview:    { fontSize: 15 },
  expandRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expandLabel:    { fontSize: 12, fontFamily: 'Inter_400Regular' },

  /* BrewingCard */
  brewBody: { paddingHorizontal: 16, paddingVertical: 18, borderTopWidth: 1 },

  /* Combined zone containing bottle + emoji row + flying overlay */
  brewZone: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
  },

  /* Bottle area */
  bottleArea: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    paddingBottom: 10,
  },

  brewProgress: {
    marginTop: 8, fontSize: 14,
    fontWeight: '600', fontFamily: 'Inter_600SemiBold', textAlign: 'center',
  },
  brewProgressComplete: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },

  /* Burst particles */
  particle:     { position: 'absolute', width: 14, height: 14, borderRadius: 7 },
  starParticle: { position: 'absolute', width: 10, height: 10, borderWidth: 2, borderRadius: 2 },

  /* Emoji tap row */
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    height: EMOJI_ROW_H,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  emojiChip: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  emojiChipText: { fontSize: 30 },
  emojiDoneOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
  },
  emojiDoneTick: { color: '#fff', fontSize: 20, fontWeight: '700' },

  tapHint: {
    fontSize: 12, fontFamily: 'Inter_400Regular',
    textAlign: 'center', marginTop: 4,
  },

  /* Flying emoji: sits at bottle mouth (top: 14), centred horizontally */
  flyingEmoji: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    fontSize: 34,
    textAlign: 'center',
    width: 44,
  },

  /* Ingredient text list */
  ingredientList:      { marginTop: 4, marginBottom: 4 },
  ingredientListTitle: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 8 },
  ingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ECECEC',
  },
  ingRowEmoji: { fontSize: 18, width: 26, textAlign: 'center' },
  ingRowText:  { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },

  instructionsBlock: { marginTop: 14 },
  instructionsText: {
    fontSize: 13, lineHeight: 21,
    fontFamily: 'Inter_400Regular',
  },

  magicFooter:     { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 10, borderRadius: 12 },
  magicFooterText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1, lineHeight: 17 },
});
