import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { STORY_CATEGORIES, StoryCategory, UNICORN_STORIES, UnicornStory } from '@/constants/stories';
import { useColors } from '@/hooks/useColors';

const CATEGORY_ICONS: Record<StoryCategory, string> = {
  'magical adventure': 'sparkles',
  'friendship': 'heart',
  'teamwork': 'people',
  'mystery': 'eye',
  'silly and funny': 'happy',
};

export default function StoriesScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('magical adventure');
  const [selectedStory, setSelectedStory] = useState<UnicornStory | null>(UNICORN_STORIES[0]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : 0;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const filteredStories = UNICORN_STORIES.filter((s) => s.category === selectedCategory);

  const handleSpeak = async (story: UnicornStory) => {
    if (speakingId === story.id) {
      await Speech.stop();
      setSpeakingId(null);
      return;
    }
    await Speech.stop();
    setSpeakingId(story.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const fullText = `${story.title}. ${story.text}`;
    Speech.speak(fullText, {
      language: 'en-US',
      pitch: 1.1,
      rate: 0.8,
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleSelectStory = (story: UnicornStory) => {
    setSelectedStory(story);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.deepPurple }]}>Unicorn Stories</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{UNICORN_STORIES.length} magical stories</Text>
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
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
              name={CATEGORY_ICONS[cat.id] as any}
              size={14}
              color={selectedCategory === cat.id ? '#fff' : colors.midPurple}
            />
            <Text style={[styles.categoryText, { color: selectedCategory === cat.id ? '#fff' : colors.deepPurple }]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomPad }]} showsVerticalScrollIndicator={false}>
        {/* Story picker */}
        <View style={styles.storyList}>
          {filteredStories.map((story) => (
            <Pressable
              key={story.id}
              onPress={() => handleSelectStory(story)}
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
                size={18}
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

        {/* Story display */}
        {selectedStory && (
          <View style={[styles.storyCard, { borderColor: colors.border }]}>
            {/* Story header */}
            <View style={[styles.storyHeader, { backgroundColor: colors.deepPurple }]}>
              <MaterialCommunityIcons name="star-four-points" size={20} color="#ffd700" />
              <Text style={styles.storyTitle}>{selectedStory.title}</Text>
              <Pressable
                onPress={() => handleSpeak(selectedStory)}
                style={({ pressed }) => [styles.listenBtn, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Ionicons
                  name={speakingId === selectedStory.id ? 'pause' : 'play'}
                  size={20}
                  color="#ffd700"
                />
              </Pressable>
            </View>

            {/* Story body */}
            <View style={[styles.storyBody, { backgroundColor: colors.card }]}>
              <Text style={[styles.storyText, { color: colors.textDark }]}>{selectedStory.text}</Text>

              {/* Read aloud full button */}
              <Pressable
                onPress={() => handleSpeak(selectedStory)}
                style={({ pressed }) => [
                  styles.readAloudBtn,
                  { backgroundColor: colors.muted, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Ionicons
                  name={speakingId === selectedStory.id ? 'pause-circle' : 'play-circle'}
                  size={22}
                  color={colors.midPurple}
                />
                <Text style={[styles.readAloudText, { color: colors.midPurple }]}>
                  {speakingId === selectedStory.id ? 'Pause Story' : 'Read This Story Aloud'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  categoryScroll: { flexGrow: 0, marginBottom: 12 },
  categoryContent: { paddingHorizontal: 16, gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  scroll: { paddingHorizontal: 16 },
  storyList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  storyThumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    width: '47%',
  },
  storyThumbTitle: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1 },
  storyCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  storyTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#ffffff', fontFamily: 'Inter_700Bold' },
  listenBtn: { padding: 4 },
  storyBody: { padding: 16 },
  storyText: { fontSize: 15, lineHeight: 26, fontFamily: 'Inter_400Regular', marginBottom: 16 },
  readAloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  readAloudText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});
