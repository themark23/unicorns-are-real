import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

/**
 * Parental gate for the Kids Category.
 *
 * Apple's rule: "Apps must also require a parental gate in order to link out of
 * the app, request permissions, or present purchasing opportunities."
 * (developer.apple.com/news/?id=01212020b). Saving a picture to the device
 * photo library asks for a system permission, so it sits behind this.
 *
 * Two barriers stand in the way at once, and the first does most of the work:
 * the numbers are spelled as words, so the question has to be read. The sum
 * itself is only a times-table fact, which an adult answers without thinking
 * but a child of this app's age has not learned. Every wrong answer draws a
 * fresh problem, so tapping at it cannot get through by luck.
 */

/* Spelled out rather than shown as digits — reading the question is the
   larger half of the gate. Only the digits actually used need words. */
const DIGIT_WORDS: Record<number, string> = {
  3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
};
const LOW = 3;
const HIGH = 9;
/* Below this the sum is one a child who can already read might manage. */
const MIN_PRODUCT = 20;

type Problem = { question: string; answer: number };

function newProblem(): Problem {
  let a = LOW;
  let b = LOW;
  do {
    a = LOW + Math.floor(Math.random() * (HIGH - LOW + 1));
    b = LOW + Math.floor(Math.random() * (HIGH - LOW + 1));
  } while (a * b < MIN_PRODUCT);
  return {
    question: `What is ${DIGIT_WORDS[a]} times ${DIGIT_WORDS[b]}?`,
    answer: a * b,
  };
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'] as const;

type Props = {
  visible: boolean;
  onPass: () => void;
  onCancel: () => void;
};

export default function ParentalGate({ visible, onPass, onCancel }: Props) {
  const colors = useColors();
  const [problem, setProblem] = useState<Problem>(newProblem);
  const [entry, setEntry] = useState('');
  const [missed, setMissed] = useState(false);

  /* Each opening is a fresh challenge — never the one left on screen last time. */
  useEffect(() => {
    if (visible) {
      setProblem(newProblem());
      setEntry('');
      setMissed(false);
    }
  }, [visible]);

  const submit = useCallback(() => {
    if (!entry) return;
    if (Number(entry) === problem.answer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onPass();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    setMissed(true);
    setProblem(newProblem());
    setEntry('');
  }, [entry, onPass, problem.answer]);

  const press = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (key === 'ok') { submit(); return; }
    /* Clear the last miss as soon as they start over, so the red border and
       the error line are about the answer being typed, not the one before. */
    setMissed(false);
    if (key === 'del') { setEntry((e) => e.slice(0, -1)); return; }
    setEntry((e) => (e.length >= 3 ? e : e + key));
  }, [submit]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.scrim}>
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          accessibilityViewIsModal
        >
          <MaterialCommunityIcons name="shield-account" size={30} color={colors.midPurple} />
          <Text style={[styles.title, { color: colors.deepPurple }]}>Grown-ups only</Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>
            Ask a grown-up to answer this, and your picture will be saved to Photos.
          </Text>

          <Text
            style={[styles.question, { color: colors.deepPurple }]}
            accessibilityRole="header"
          >
            {problem.question}
          </Text>

          <View
            style={[styles.entry, { borderColor: missed ? colors.destructive : colors.border }]}
            accessibilityLabel={entry ? `Answer so far: ${entry}` : 'No answer entered yet'}
          >
            <Text style={[styles.entryText, { color: colors.deepPurple }]}>{entry || '—'}</Text>
          </View>

          {missed ? (
            <Text style={[styles.missed, { color: colors.destructive }]}>
              Not quite — here is a new one.
            </Text>
          ) : null}

          <View style={styles.pad}>
            {KEYS.map((key) => {
              const isOk  = key === 'ok';
              const isDel = key === 'del';
              return (
                <Pressable
                  key={key}
                  onPress={() => press(key)}
                  disabled={isOk && !entry}
                  accessibilityRole="button"
                  accessibilityLabel={isOk ? 'Check answer' : isDel ? 'Delete last digit' : key}
                  style={({ pressed }) => [
                    styles.key,
                    {
                      backgroundColor: isOk ? colors.midPurple : colors.muted,
                      borderColor: colors.border,
                      opacity: isOk && !entry ? 0.4 : pressed ? 0.6 : 1,
                    },
                  ]}
                >
                  {isOk ? (
                    <MaterialCommunityIcons name="check-bold" size={20} color="#fff" />
                  ) : isDel ? (
                    <MaterialCommunityIcons name="backspace-outline" size={19} color={colors.textMuted} />
                  ) : (
                    <Text style={[styles.keyText, { color: colors.deepPurple }]}>{key}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Never mind, do not save"
            style={({ pressed }) => [styles.cancel, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>Never mind</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(38,33,92,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20, fontWeight: '700',
    fontFamily: 'Inter_700Bold', marginTop: 8,
  },
  sub: {
    fontSize: 12, textAlign: 'center',
    fontFamily: 'Inter_400Regular', marginTop: 6, lineHeight: 17,
  },
  question: {
    fontSize: 17, fontWeight: '700', textAlign: 'center',
    fontFamily: 'Inter_700Bold', marginTop: 18,
  },
  entry: {
    minWidth: 120,
    borderWidth: 2, borderRadius: 14,
    paddingVertical: 8, paddingHorizontal: 18,
    marginTop: 12, alignItems: 'center',
  },
  entryText: {
    fontSize: 24, fontWeight: '700',
    fontFamily: 'Inter_700Bold', letterSpacing: 2,
  },
  missed: {
    fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 8,
  },
  pad: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8, marginTop: 16,
  },
  key: {
    width: 62, height: 46,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, borderWidth: 1,
  },
  keyText: {
    fontSize: 19, fontWeight: '700', fontFamily: 'Inter_700Bold',
  },
  cancel: { marginTop: 16, paddingVertical: 6, paddingHorizontal: 12 },
  cancelText: {
    fontSize: 13, fontWeight: '600', fontFamily: 'Inter_400Regular',
  },
});
