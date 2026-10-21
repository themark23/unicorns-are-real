import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
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
import { STORY_CATEGORIES, StoryCategory, UNICORN_STORIES, UnicornStory } from '@/constants/stories';
import { useColors } from '@/hooks/useColors';
import { useNarration } from '@/hooks/useNarration';
import { factClip, storyClip } from '@/constants/voiceClips';

type Section = 'facts' | 'stories';

const FACTS_SEEN_KEY = '@unicorn_facts_seen';

const CATEGORY_ICONS: Record<StoryCategory, keyof typeof Ionicons.glyphMap> = {
  'magical adventure': 'sparkles',
  'friendship': 'heart',
  'teamwork': 'people',
  'mystery': 'eye',
  'silly and funny': 'happy',
};

/* ─── Facts section ─────────────────────────────────────────── */
function FactsSection() {
  const colors = useColors();
  const { playingId, toggle } = useNarration();
  const [shownFacts, setShownFacts] = useState<UnicornFact[]>([UNICORN_FACTS[0]]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  /* Facts already discovered are remembered between sessions. */
  useEffect(() => {
    AsyncStorage.getItem(FACTS_SEEN_KEY)
      .then((raw) => {
        const n = raw ? parseInt(raw, 10) : 0;
        if (!Number.isFinite(n) || n < 1) return;
        const count = Math.min(n, UNICORN_FACTS.length);
        setCurrentIndex(count);
        setShownFacts(UNICORN_FACTS.slice(0, count).reverse());
      })
      .catch(() => {});
  }, []);

  const handleNextFact = () => {
    if (currentIndex >= UNICORN_FACTS.length) return;
    setShownFacts((prev) => [UNICORN_FACTS[currentIndex], ...prev]);
    setCurrentIndex((i) => i + 1);
    AsyncStorage.setItem(FACTS_SEEN_KEY, String(currentIndex + 1)).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(sparkleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(sparkleAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleSpeak = (fact: UnicornFact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(fact.id, factClip(fact.id));
  };

  const sparkleScale = sparkleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.3, 1] });

  return (
    <ScrollView
      contentContainerStyle={styles.sectionScroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
        {currentIndex} of {UNICORN_FACTS.length} facts found
      </Text>

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
          <MaterialCommunityIcons name="star-four-points" size={22} color="#fff" />
        </Animated.View>
        <Text style={styles.magicBtnText}>
          {currentIndex >= UNICORN_FACTS.length ? 'All Facts Found! 🌟' : 'Discover a Unicorn Fact!'}
        </Text>
      </Pressable>

      {shownFacts.map((fact, index) => {
        const isSpeaking = playingId === fact.id;
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
            <Text style={[styles.factText, { color: isFirst ? '#fff' : colors.textDark }]}>
              {fact.text}
            </Text>
            <Pressable
              onPress={() => handleSpeak(fact)}
              accessibilityRole="button"
              accessibilityLabel={isSpeaking ? 'Pause reading this fact' : 'Listen to this fact'}
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
                color={isFirst ? '#fff' : colors.midPurple}
              />
              <Text style={[styles.playBtnText, { color: isFirst ? '#fff' : colors.midPurple }]}>
                {isSpeaking ? 'Pause' : 'Listen'}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

/* ─── Stories section ───────────────────────────────────────── */
function StoriesSection() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('magical adventure');
  const [selectedStory, setSelectedStory] = useState<UnicornStory | null>(UNICORN_STORIES[0]);
  const { playingId, toggle } = useNarration();

  const filteredStories = UNICORN_STORIES.filter((s) => s.category === selectedCategory);

  const handleSpeak = (story: UnicornStory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggle(story.id, storyClip(story.id));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.sectionScroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
        {UNICORN_STORIES.length} magical stories
      </Text>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {STORY_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => {
              setSelectedCategory(cat.id);
              const first = UNICORN_STORIES.find((s) => s.category === cat.id);
              if (first) setSelectedStory(first);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === cat.id ? colors.midPurple : colors.card,
                borderColor: selectedCategory === cat.id ? colors.midPurple : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons
              name={CATEGORY_ICONS[cat.id]}
              size={13}
              color={selectedCategory === cat.id ? '#fff' : colors.midPurple}
            />
            <Text style={[styles.categoryText, { color: selectedCategory === cat.id ? '#fff' : colors.deepPurple }]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Story grid */}
      <View style={styles.storyGrid}>
        {filteredStories.map((story) => (
          <Pressable
            key={story.id}
            onPress={() => {
              setSelectedStory(story);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.storyThumb,
              {
                backgroundColor: selectedStory?.id === story.id ? colors.midPurple : colors.card,
                borderColor: selectedStory?.id === story.id ? colors.midPurple : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={16}
              color={selectedStory?.id === story.id ? '#fff' : colors.midPurple}
            />
            <Text
              style={[styles.storyThumbTitle, { color: selectedStory?.id === story.id ? '#fff' : colors.deepPurple }]}
              numberOfLines={2}
            >
              {story.title}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Story card */}
      {selectedStory && (
        <View style={[styles.storyCard, { borderColor: colors.border }]}>
          <View style={[styles.storyHeader, { backgroundColor: colors.deepPurple }]}>
            <MaterialCommunityIcons name="star-four-points" size={18} color="#ffd700" />
            <Text style={styles.storyTitle} numberOfLines={2}>{selectedStory.title}</Text>
            <Pressable
              onPress={() => handleSpeak(selectedStory)}
              accessibilityRole="button"
              accessibilityLabel={playingId === selectedStory.id ? 'Pause the story' : 'Read the story aloud'}
              style={({ pressed }) => [styles.listenBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons
                name={playingId === selectedStory.id ? 'pause' : 'play'}
                size={20}
                color="#ffd700"
              />
            </Pressable>
          </View>
          <View style={[styles.storyBody, { backgroundColor: colors.card }]}>
            <Text style={[styles.storyText, { color: colors.textDark }]}>{selectedStory.text}</Text>
            <Pressable
              onPress={() => handleSpeak(selectedStory)}
              style={({ pressed }) => [
                styles.readAloudBtn,
                { backgroundColor: colors.muted, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons
                name={playingId === selectedStory.id ? 'pause-circle' : 'play-circle'}
                size={22}
                color={colors.midPurple}
              />
              <Text style={[styles.readAloudText, { color: colors.midPurple }]}>
                {playingId === selectedStory.id ? 'Pause Story' : 'Read This Story Aloud'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

/* ─── Main screen ───────────────────────────────────────────── */
export default function ReadScreen() {
  const colors = useColors();
  const [section, setSection] = useState<Section>('stories');
  const insets    = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleSectionSwitch = (s: Section) => {
    setSection(s);
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.deepPurple }]}>Read</Text>

        {/* Segmented control */}
        <View style={[styles.segmented, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Pressable
            onPress={() => handleSectionSwitch('stories')}
            style={[styles.segBtn, section === 'stories' && { backgroundColor: colors.midPurple }]}
          >
            <Ionicons name="book" size={14} color={section === 'stories' ? '#fff' : colors.midPurple} />
            <Text style={[styles.segBtnText, { color: section === 'stories' ? '#fff' : colors.deepPurple }]}>
              Stories
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleSectionSwitch('facts')}
            style={[styles.segBtn, section === 'facts' && { backgroundColor: colors.midPurple }]}
          >
            <MaterialCommunityIcons name="star-four-points" size={14} color={section === 'facts' ? '#fff' : colors.midPurple} />
            <Text style={[styles.segBtnText, { color: section === 'facts' ? '#fff' : colors.deepPurple }]}>
              Facts
            </Text>
          </Pressable>
        </View>
      </View>

      {section === 'facts' ? <FactsSection /> : <StoriesSection />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, gap: 10 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  segmented: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  segBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segBtnText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  sectionScroll: { paddingHorizontal: 16, paddingBottom: 120 },
  sectionSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4, marginBottom: 14 },

  magicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 20,
  },
  magicBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold' },

  factCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  factIcon: { marginBottom: 8 },
  factText: { fontSize: 15, lineHeight: 24, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start',
  },
  playBtnText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  categoryScroll: { flexGrow: 0, marginBottom: 14 },
  categoryContent: { gap: 8, paddingBottom: 2 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  },
  categoryText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  storyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  storyThumb: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, width: '47%',
  },
  storyThumbTitle: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1 },

  storyCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  storyHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16,
  },
  storyTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold' },
  listenBtn: { padding: 4 },
  storyBody: { padding: 16 },
  storyText: { fontSize: 15, lineHeight: 26, fontFamily: 'Inter_400Regular', marginBottom: 16 },
  readAloudBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, alignSelf: 'flex-start',
  },
  readAloudText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});
