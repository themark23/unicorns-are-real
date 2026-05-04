import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UNICORN_FACTS, UnicornFact } from '@/constants/facts';
import { useColors } from '@/hooks/useColors';

export default function FactsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [shownFacts, setShownFacts] = useState<UnicornFact[]>([UNICORN_FACTS[0]]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const handleNextFact = () => {
    if (currentIndex >= UNICORN_FACTS.length) return;
    const fact = UNICORN_FACTS[currentIndex];
    setShownFacts((prev) => [fact, ...prev]);
    setCurrentIndex((i) => i + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.timing(sparkleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(sparkleAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleSpeak = async (fact: UnicornFact) => {
    if (speakingId === fact.id) {
      await Speech.stop();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(fact.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(fact.text, {
      language: 'en-US',
      pitch: 1.15,
      rate: 0.85,
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const sparkleScale = sparkleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] });

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={['#FFD6EC', '#EDD6FF', '#D6EEFF', '#D6FFE8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.deepPurple }]}>Unicorn Facts</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{currentIndex} of {UNICORN_FACTS.length} facts found</Text>
        </View>

        {/* Big magic button */}
        <Pressable
          onPress={handleNextFact}
          disabled={currentIndex >= UNICORN_FACTS.length}
          style={({ pressed }) => [
            styles.magicBtn,
            {
              backgroundColor: currentIndex >= UNICORN_FACTS.length ? colors.border : colors.midPurple,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: sparkleScale }] }}>
            <MaterialCommunityIcons name="star-four-points" size={24} color="#ffffff" />
          </Animated.View>
          <Text style={styles.magicBtnText}>
            {currentIndex >= UNICORN_FACTS.length ? 'All Facts Found!' : 'Discover a Unicorn Fact!'}
          </Text>
        </Pressable>

        {/* Facts list */}
        {shownFacts.map((fact, index) => {
          const isSpeaking = speakingId === fact.id;
          const isFirst = index === 0;
          return (
            <View
              key={fact.id}
              style={[
                styles.factCard,
                {
                  backgroundColor: isFirst ? colors.midPurple : colors.card,
                  borderColor: isFirst ? colors.midPurple : colors.border,
                },
              ]}
            >
              <View style={styles.factIcon}>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={16}
                  color={isFirst ? '#ffd700' : colors.midPurple}
                />
              </View>
              <Text style={[styles.factText, { color: isFirst ? '#ffffff' : colors.textDark }]}>
                {fact.text}
              </Text>
              <Pressable
                onPress={() => handleSpeak(fact)}
                style={({ pressed }) => [
                  styles.playBtn,
                  {
                    backgroundColor: isFirst ? 'rgba(255,255,255,0.2)' : colors.muted,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={isSpeaking ? 'pause' : 'play'}
                  size={18}
                  color={isFirst ? '#ffffff' : colors.midPurple}
                />
                <Text style={[styles.playBtnText, { color: isFirst ? '#ffffff' : colors.midPurple }]}>
                  {isSpeaking ? 'Pause' : 'Listen'}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {shownFacts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={48} color={colors.lavenderMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Tap the button to discover a magical unicorn fact!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  magicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 20,
  },
  magicBtnText: { fontSize: 17, fontWeight: '700', color: '#ffffff', fontFamily: 'Inter_700Bold' },
  factCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  factIcon: { marginBottom: 8 },
  factText: { fontSize: 15, lineHeight: 24, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  playBtnText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center', fontFamily: 'Inter_400Regular', maxWidth: 260 },
});
