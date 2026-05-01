import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import UnicornSVG from '@/components/UnicornSVG';
import { useUnicorn } from '@/context/UnicornContext';
import { useColors } from '@/hooks/useColors';

type Zone = 'body' | 'mane' | 'horn' | 'tail';

const ZONES: { id: Zone; label: string }[] = [
  { id: 'body', label: 'Body' },
  { id: 'mane', label: 'Mane' },
  { id: 'horn', label: 'Horn' },
  { id: 'tail', label: 'Tail' },
];

interface AccessoryItem {
  id: string;
  label: string;
  iconName: string;
  iconSet: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  bgColor: string;
}

const ACCESSORIES: AccessoryItem[] = [
  { id: 'crown-gold', label: 'Crown', iconName: 'crown', iconSet: 'MaterialCommunityIcons', color: '#ffd700', bgColor: '#fffbdd' },
  { id: 'crown-pink', label: 'Tiara', iconName: 'crown-outline', iconSet: 'MaterialCommunityIcons', color: '#ff9de2', bgColor: '#fff0f8' },
  { id: 'flower-wreath', label: 'Flowers', iconName: 'flower', iconSet: 'MaterialCommunityIcons', color: '#86efac', bgColor: '#f0fff4' },
  { id: 'heart-necklace', label: 'Necklace', iconName: 'heart', iconSet: 'Ionicons', color: '#fb7185', bgColor: '#fff0f2' },
  { id: 'star-badge', label: 'Star Badge', iconName: 'star', iconSet: 'Ionicons', color: '#ffd700', bgColor: '#fffbdd' },
  { id: 'bow', label: 'Bow Tie', iconName: 'bow-tie', iconSet: 'MaterialCommunityIcons', color: '#c084fc', bgColor: '#f5f0ff' },
  { id: 'glasses', label: 'Glasses', iconName: 'glasses', iconSet: 'MaterialCommunityIcons', color: '#93c5fd', bgColor: '#f0f4ff' },
  { id: 'gem', label: 'Gem', iconName: 'diamond-stone', iconSet: 'MaterialCommunityIcons', color: '#5eead4', bgColor: '#f0fffe' },
  { id: 'wings', label: 'Wings', iconName: 'butterfly', iconSet: 'MaterialCommunityIcons', color: '#ddd6fe', bgColor: '#f8f5ff' },
  { id: 'magic-wand', label: 'Wand', iconName: 'sparkles', iconSet: 'Ionicons', color: '#ffd700', bgColor: '#fffbdd' },
];

interface DraggableAccessory {
  item: AccessoryItem;
  position: Animated.ValueXY;
  placed: boolean;
  placedX: number;
  placedY: number;
}

export default function DressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dressColors, sparkles, selectedZone, setDressColor, toggleSparkles, setSelectedZone, resetDressColors } = useUnicorn();

  const [placedAccessories, setPlacedAccessories] = useState<Record<string, { x: number; y: number }>>({});
  const unicornViewRef = useRef<View>(null);
  const [unicornLayout, setUnicornLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleZonePress = (zone: Zone) => {
    setSelectedZone(zone);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleColorPress = (color: string) => {
    if (selectedZone) {
      setDressColor(selectedZone, color);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleReset = () => {
    resetDressColors();
    setPlacedAccessories({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const topPad = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.deepPurple }]}>Dress Your Unicorn</Text>
          <View style={styles.headerRight}>
            <View style={styles.sparklesRow}>
              <MaterialCommunityIcons name="star-four-points" size={16} color={colors.midPurple} />
              <Text style={[styles.sparklesLabel, { color: colors.midPurple }]}>Sparkles</Text>
              <Switch
                value={sparkles}
                onValueChange={() => {
                  toggleSparkles();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: colors.border, true: colors.midPurple }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Unicorn display */}
        <View
          ref={unicornViewRef}
          onLayout={(e) => setUnicornLayout(e.nativeEvent.layout)}
          style={[styles.unicornArea, { backgroundColor: colors.lavender, borderColor: colors.border }]}
        >
          {/* Placed accessories */}
          {Object.entries(placedAccessories).map(([id, pos]) => {
            const acc = ACCESSORIES.find((a) => a.id === id);
            if (!acc) return null;
            return (
              <View key={id} style={[styles.placedAccessory, { left: pos.x - 20, top: pos.y - 20 }]}>
                {acc.iconSet === 'Ionicons' ? (
                  <Ionicons name={acc.iconName as any} size={40} color={acc.color} />
                ) : (
                  <MaterialCommunityIcons name={acc.iconName as any} size={40} color={acc.color} />
                )}
              </View>
            );
          })}

          <UnicornSVG
            colors={dressColors}
            mode="dress"
            sparkles={sparkles}
            onZonePress={handleZonePress}
          />
        </View>

        {/* Zone pills */}
        <View style={styles.zonePills}>
          {ZONES.map((zone) => (
            <Pressable
              key={zone.id}
              onPress={() => handleZonePress(zone.id)}
              style={({ pressed }) => [
                styles.zonePill,
                {
                  backgroundColor: selectedZone === zone.id ? colors.midPurple : colors.card,
                  borderColor: selectedZone === zone.id ? colors.midPurple : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={[styles.zoneSwatch, { backgroundColor: dressColors[zone.id] }]} />
              <Text style={[styles.zonePillText, { color: selectedZone === zone.id ? '#fff' : colors.deepPurple }]}>
                {zone.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Color palette */}
        <View style={[styles.paletteSection, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            {selectedZone ? `Tap a color for the ${selectedZone}` : 'Select a zone above'}
          </Text>
          <View style={styles.palette}>
            {colors.palette.map((color) => (
              <Pressable
                key={color}
                onPress={() => handleColorPress(color)}
                style={({ pressed }) => [
                  styles.swatch,
                  { backgroundColor: color, opacity: pressed ? 0.8 : 1 },
                  selectedZone && dressColors[selectedZone] === color && styles.swatchSelected,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Accessories */}
        <View style={styles.accessoriesSection}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Accessories — tap to place!</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accessoryScroll}>
            {ACCESSORIES.map((acc) => {
              const isPlaced = !!placedAccessories[acc.id];
              return (
                <Pressable
                  key={acc.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (isPlaced) {
                      const next = { ...placedAccessories };
                      delete next[acc.id];
                      setPlacedAccessories(next);
                    } else {
                      const cx = unicornLayout.width / 2 + (Math.random() - 0.5) * 60;
                      const cy = unicornLayout.height / 2 + (Math.random() - 0.5) * 60;
                      setPlacedAccessories((prev) => ({ ...prev, [acc.id]: { x: cx, y: cy } }));
                    }
                  }}
                  style={({ pressed }) => [
                    styles.accessoryChip,
                    {
                      backgroundColor: isPlaced ? acc.bgColor : colors.card,
                      borderColor: isPlaced ? acc.color : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  {acc.iconSet === 'Ionicons' ? (
                    <Ionicons name={acc.iconName as any} size={28} color={acc.color} />
                  ) : (
                    <MaterialCommunityIcons name={acc.iconName as any} size={28} color={acc.color} />
                  )}
                  <Text style={[styles.accessoryLabel, { color: colors.textDark }]}>{acc.label}</Text>
                  {isPlaced && (
                    <View style={[styles.placedBadge, { backgroundColor: acc.color }]}>
                      <Ionicons name="checkmark" size={10} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Reset */}
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [styles.resetBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="refresh" size={16} color={colors.textMuted} />
          <Text style={[styles.resetText, { color: colors.textMuted }]}>Reset Everything</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  headerRight: {},
  sparklesRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sparklesLabel: { fontSize: 13, fontWeight: '500', fontFamily: 'Inter_500Medium' },
  unicornArea: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: 16,
    overflow: 'hidden',
    minHeight: 250,
  },
  placedAccessory: { position: 'absolute', zIndex: 10 },
  zonePills: { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'center' },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  zoneSwatch: { width: 12, height: 12, borderRadius: 6 },
  zonePillText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  paletteSection: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '500', marginBottom: 10, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  swatch: { width: 38, height: 38, borderRadius: 19 },
  swatchSelected: { borderWidth: 3, borderColor: '#26215C' },
  accessoriesSection: { marginBottom: 16 },
  accessoryScroll: { marginTop: 8 },
  accessoryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    marginRight: 10,
    minWidth: 70,
    position: 'relative',
  },
  accessoryLabel: { fontSize: 11, marginTop: 4, fontWeight: '500', fontFamily: 'Inter_500Medium' },
  placedBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  resetText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
