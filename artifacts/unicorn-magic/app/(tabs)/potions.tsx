import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MAGIC_POTIONS, MagicPotion } from '@/constants/potions';
import { useColors } from '@/hooks/useColors';

export default function PotionsScreen() {
  const colors = useColors();
  const [expandedId, setExpandedId] = useState<string | null>('p1');

  const topPad = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.deepPurple }]}>Magic Potions</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{MAGIC_POTIONS.length} recipes to brew at home</Text>
        </View>

        {MAGIC_POTIONS.map((potion) => {
          const isExpanded = expandedId === potion.id;
          return (
            <Pressable
              key={potion.id}
              onPress={() => handleToggle(potion.id)}
              style={({ pressed }) => [
                styles.potionCard,
                { borderColor: isExpanded ? potion.accentColor : colors.border, opacity: pressed ? 0.95 : 1 },
              ]}
            >
              {/* Card top: image or gradient + info */}
              <View style={styles.cardTop}>
                {potion.image ? (
                  <Image source={potion.image} style={styles.potionImage} contentFit="cover" />
                ) : (
                  <LinearGradient
                    colors={[potion.cardColor, potion.accentColor + '40']}
                    style={[styles.potionImagePlaceholder]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name="flask-round-bottom" size={52} color={potion.accentColor} />
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
                  <View style={styles.expandRow}>
                    <Text style={[styles.expandLabel, { color: colors.textMuted }]}>
                      {isExpanded ? 'Tap to collapse' : `${potion.ingredients.length} ingredients`}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </View>
                </View>
              </View>

              {/* Expanded recipe */}
              {isExpanded && (
                <View style={[styles.recipeBody, { borderTopColor: colors.border }]}>
                  {/* Ingredients */}
                  <Text style={[styles.recipeSection, { color: colors.deepPurple }]}>Ingredients</Text>
                  {potion.ingredients.map((ing, i) => (
                    <View key={i} style={styles.ingredientRow}>
                      <View style={[styles.ingredientDot, { backgroundColor: potion.accentColor }]} />
                      <Text style={[styles.ingredientText, { color: colors.textDark }]}>{ing}</Text>
                    </View>
                  ))}

                  {/* Instructions */}
                  <Text style={[styles.recipeSection, { color: colors.deepPurple, marginTop: 14 }]}>Instructions</Text>
                  <Text style={[styles.instructionsText, { color: colors.textDark }]}>{potion.instructions}</Text>

                  {/* Fun footer */}
                  <View style={[styles.magicFooter, { backgroundColor: potion.cardColor }]}>
                    <MaterialCommunityIcons name="shimmer" size={16} color={potion.accentColor} />
                    <Text style={[styles.magicFooterText, { color: potion.accentColor }]}>Always brew with a grown-up's help!</Text>
                  </View>
                </View>
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
  scroll: { paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  potionCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  cardTop: { flexDirection: 'row', gap: 0 },
  potionImage: { width: 110, height: 120 },
  potionImagePlaceholder: { width: 110, height: 120, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  effectBadge: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, borderRadius: 8, padding: 6, marginBottom: 6 },
  effectText: { fontSize: 11, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1, lineHeight: 15 },
  potionName: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 6 },
  expandRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expandLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  recipeBody: { paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1 },
  recipeSection: { fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 8 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  ingredientDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  ingredientText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  instructionsText: { fontSize: 14, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  magicFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, padding: 10, borderRadius: 12 },
  magicFooterText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});
