import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UnicornSVG from '@/components/UnicornSVG';
import { useUnicorn } from '@/context/UnicornContext';
import { useColors } from '@/hooks/useColors';

type Zone = 'body' | 'mane' | 'horn' | 'tail';
type UnicornStyle = 'unicorn' | 'alicorn';
type Location = 'rainbow meadow' | 'enchanted forest' | 'crystal cave' | 'starry sky' | 'magical beach';

const LOCATIONS: { id: Location; label: string; gradient: [string, string] }[] = [
  { id: 'rainbow meadow', label: 'Rainbow Meadow', gradient: ['#87CEEB', '#98FB98'] },
  { id: 'enchanted forest', label: 'Enchanted Forest', gradient: ['#2d6a4f', '#1b4332'] },
  { id: 'crystal cave', label: 'Crystal Cave', gradient: ['#2d2d6b', '#4a1985'] },
  { id: 'starry sky', label: 'Starry Sky', gradient: ['#0d0d2b', '#1a1a5a'] },
  { id: 'magical beach', label: 'Magical Beach', gradient: ['#87CEEB', '#f4d03f'] },
];

export default function ColorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { paintColors, activePaintColor, unicornStyle, paintLocation, setPaintColor, setActivePaintColor, resetPaintColors, setUnicornStyle, setPaintLocation } = useUnicorn();

  const topPad = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const currentLocation = LOCATIONS.find((l) => l.id === paintLocation) ?? LOCATIONS[0];

  const handleZonePress = (zone: Zone) => {
    setPaintColor(zone, activePaintColor);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.deepPurple }]}>Coloring Page</Text>
          <Pressable
            onPress={() => { resetPaintColors(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
            style={({ pressed }) => [styles.clearBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="refresh" size={16} color={colors.textMuted} />
            <Text style={[styles.clearText, { color: colors.textMuted }]}>Clear</Text>
          </Pressable>
        </View>

        {/* Style selector */}
        <View style={styles.selectorRow}>
          <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>Style</Text>
          <View style={[styles.segmentControl, { borderColor: colors.border, backgroundColor: colors.card }]}>
            {(['unicorn', 'alicorn'] as UnicornStyle[]).map((style) => (
              <Pressable
                key={style}
                onPress={() => { setUnicornStyle(style); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[
                  styles.segmentOption,
                  unicornStyle === style && { backgroundColor: colors.midPurple },
                ]}
              >
                <Text style={[styles.segmentText, { color: unicornStyle === style ? '#fff' : colors.textMuted }]}>
                  {style === 'unicorn' ? 'Unicorn' : 'Alicorn'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Location selector */}
        <View style={styles.selectorRow}>
          <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>Location</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
            {LOCATIONS.map((loc) => (
              <Pressable
                key={loc.id}
                onPress={() => { setPaintLocation(loc.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.locationChip, { borderColor: paintLocation === loc.id ? colors.midPurple : colors.border }]}
              >
                <LinearGradient colors={loc.gradient} style={styles.locationGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                <Text style={[styles.locationText, { color: paintLocation === loc.id ? colors.midPurple : colors.textMuted }]}>
                  {loc.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Color palette */}
        <View style={styles.paletteRow}>
          {colors.palette.map((color) => (
            <Pressable
              key={color}
              onPress={() => { setActivePaintColor(color); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[
                styles.paletteSwatch,
                { backgroundColor: color },
                activePaintColor === color && styles.swatchActive,
              ]}
            />
          ))}
        </View>

        {/* Active color hint */}
        <Text style={[styles.colorHint, { color: colors.textMuted }]}>
          Tap a unicorn zone to fill it with this color
        </Text>
        <View style={[styles.activeColorDot, { backgroundColor: activePaintColor }]} />

        {/* Coloring canvas */}
        <LinearGradient
          colors={currentLocation.gradient}
          style={[styles.canvas, { borderColor: colors.border }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Stars for certain locations */}
          {(paintLocation === 'starry sky' || paintLocation === 'crystal cave') && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {[...Array(20)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.star,
                    {
                      left: `${(i * 37 + 5) % 95}%` as any,
                      top: `${(i * 53 + 8) % 85}%` as any,
                    },
                  ]}
                />
              ))}
            </View>
          )}
          <UnicornSVG
            colors={paintColors}
            mode="paint"
            sparkles={false}
            onZonePress={handleZonePress}
            showWings={unicornStyle === 'alicorn'}
          />
        </LinearGradient>

        <Text style={[styles.instructionText, { color: colors.textMuted }]}>
          Tap the unicorn to paint each zone
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, borderRadius: 12, borderWidth: 1 },
  clearText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  selectorRow: { marginBottom: 12 },
  selectorLabel: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  segmentControl: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, overflow: 'hidden', alignSelf: 'flex-start' },
  segmentOption: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  segmentText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  locationScroll: { flexGrow: 0 },
  locationChip: { alignItems: 'center', marginRight: 10, borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', width: 100 },
  locationGradient: { width: '100%', height: 50 },
  locationText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold', textAlign: 'center', paddingVertical: 6, paddingHorizontal: 4 },
  paletteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 8 },
  paletteSwatch: { width: 36, height: 36, borderRadius: 18 },
  swatchActive: { borderWidth: 3, borderColor: '#26215C', transform: [{ scale: 1.15 }] },
  colorHint: { fontSize: 12, textAlign: 'center', fontFamily: 'Inter_400Regular', marginBottom: 4 },
  activeColorDot: { width: 20, height: 20, borderRadius: 10, alignSelf: 'center', marginBottom: 12 },
  canvas: {
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 8,
    overflow: 'hidden',
    minHeight: 260,
  },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ffffff80' },
  instructionText: { fontSize: 13, textAlign: 'center', fontFamily: 'Inter_400Regular', marginBottom: 16 },
});
