import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useColors } from '@/hooks/useColors';

type GameMode = 'memory' | 'tictactoe';

/* ═══════════════════════════════════════════════════════════════
   MEMORY MATCH
═══════════════════════════════════════════════════════════════ */

const SYMBOLS = ['🌈', '⭐', '💜', '🌸', '💎', '🌙', '🦋', '🌟'];

interface CardData {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffleDeck(): CardData[] {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((symbol, id) => ({ id, symbol, isFlipped: false, isMatched: false }));
}

function MemoryCard({
  card,
  onPress,
  cardSize,
}: {
  card: CardData;
  onPress: () => void;
  cardSize: number;
}) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const matchAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: card.isFlipped ? 1 : 0,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [card.isFlipped]);

  useEffect(() => {
    if (card.isMatched) {
      Animated.sequence([
        Animated.spring(matchAnim, { toValue: 1.15, friction: 5, useNativeDriver: true }),
        Animated.timing(matchAnim, { toValue: 0, duration: 350, delay: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [card.isMatched]);

  /* Opacity-switch trick: back visible 0→0.5, front visible 0.5→1 */
  const backOpacity  = flipAnim.interpolate({ inputRange: [0, 0.45, 0.55, 1], outputRange: [1, 1, 0, 0] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.45, 0.55, 1], outputRange: [0, 0, 1, 1] });
  const backRotate   = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  const r = cardSize * 0.14;

  return (
    <Animated.View
      style={{
        width: cardSize,
        height: cardSize,
        opacity: card.isMatched ? matchAnim : 1,
        transform: card.isMatched ? [{ scale: matchAnim }] : [],
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={card.isFlipped || card.isMatched}
        style={{ width: cardSize, height: cardSize }}
      >
        {/* ── Card back (unicorn) ── */}
        <Animated.View
          style={[
            styles.cardFace,
            {
              width: cardSize,
              height: cardSize,
              borderRadius: r,
              opacity: backOpacity,
              transform: [{ perspective: 900 }, { rotateY: backRotate }],
            },
          ]}
        >
          <LinearGradient
            colors={['#26215C', '#534AB7', '#8B7BD8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: r }]}
          />
          {/* corner sparkles */}
          <Text style={[styles.cornerSparkle, { top: 3, left: 4, fontSize: cardSize * 0.18 }]}>✨</Text>
          <Text style={[styles.cornerSparkle, { bottom: 3, right: 4, fontSize: cardSize * 0.18 }]}>✨</Text>
          <Text style={{ fontSize: cardSize * 0.52, lineHeight: cardSize * 0.58 }}>🦄</Text>
        </Animated.View>

        {/* ── Card front (magical symbol) ── */}
        <Animated.View
          style={[
            styles.cardFace,
            {
              width: cardSize,
              height: cardSize,
              borderRadius: r,
              opacity: frontOpacity,
              transform: [{ perspective: 900 }, { rotateY: frontRotate }],
              borderWidth: 2,
              borderColor: '#CECBF6',
            },
          ]}
        >
          <LinearGradient
            colors={['#FFF0FA', '#F0ECFF', '#E8F0FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: r }]}
          />
          <Text style={{ fontSize: cardSize * 0.48, lineHeight: cardSize * 0.56 }}>{card.symbol}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function MemoryGame() {
  const { width: screenWidth } = useWindowDimensions();
  const colors = useColors();
  const cols = 4;
  const gap = 8;
  const hPad = 12;
  const cardSize = Math.floor((screenWidth - hPad * 2 - gap * (cols - 1)) / cols);

  const [cards, setCards] = useState<CardData[]>(shuffleDeck);
  const [moves, setMoves] = useState(0);
  const [checking, setChecking] = useState(false);
  const selectedRef = useRef<number[]>([]);

  const matched = cards.filter((c) => c.isMatched).length / 2;
  const won = matched === SYMBOLS.length;

  const handleCardPress = useCallback(
    (id: number) => {
      if (checking) return;
      if (selectedRef.current.includes(id)) return;
      if (selectedRef.current.length >= 2) return;
      if (cards.find((c) => c.id === id)?.isMatched) return;

      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      selectedRef.current = [...selectedRef.current, id];

      if (selectedRef.current.length === 2) {
        const [a, b] = selectedRef.current;
        selectedRef.current = [];
        setMoves((m) => m + 1);
        setChecking(true);

        setTimeout(() => {
          setCards((prev) => {
            const cardA = prev.find((c) => c.id === a)!;
            const cardB = prev.find((c) => c.id === b)!;
            if (cardA.symbol === cardB.symbol) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              return prev.map((c) =>
                c.id === a || c.id === b ? { ...c, isMatched: true, isFlipped: true } : c
              );
            } else {
              return prev.map((c) =>
                c.id === a || c.id === b ? { ...c, isFlipped: false } : c
              );
            }
          });
          setChecking(false);
        }, 850);
      }
    },
    [checking, cards]
  );

  const resetGame = () => {
    selectedRef.current = [];
    setCards(shuffleDeck());
    setMoves(0);
    setChecking(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: hPad, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={[styles.statVal, { color: colors.midPurple }]}>{matched}/{SYMBOLS.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Matches</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statVal, { color: colors.midPurple }]}>{moves}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Moves</Text>
        </View>
        <Pressable
          onPress={resetGame}
          style={({ pressed }) => [
            styles.newGameBtn,
            { backgroundColor: colors.midPurple, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.newGameBtnText}>New Game ✨</Text>
        </Pressable>
      </View>

      {won && (
        <View style={[styles.winBanner, { backgroundColor: colors.midPurple }]}>
          <Text style={styles.winTitle}>🎉 You found all the matches! 🎉</Text>
          <Text style={styles.winSub}>Finished in {moves} moves!</Text>
        </View>
      )}

      {/* Card grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, marginTop: 10 }}>
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            onPress={() => handleCardPress(card.id)}
            cardSize={cardSize}
          />
        ))}
      </View>
    </ScrollView>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TIC-TAC-TOE
═══════════════════════════════════════════════════════════════ */

type Player = '❤️' | '⭐';
type Cell = Player | null;

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Player; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line };
    }
  }
  return null;
}

function TicTacToeGame() {
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();
  const boardSize = Math.min(screenWidth - 64, 320);
  const cellSize = Math.floor(boardSize / 3);

  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [current, setCurrent] = useState<Player>('❤️');
  const [winResult, setWinResult] = useState<{ winner: Player; line: number[] } | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const scaleAnims = useRef(Array.from({ length: 9 }, () => new Animated.Value(0))).current;

  const handleCellPress = (idx: number) => {
    if (board[idx] || winResult || isDraw) return;

    const newBoard = [...board];
    newBoard[idx] = current;
    setBoard(newBoard);

    scaleAnims[idx].setValue(0);
    Animated.spring(scaleAnims[idx], {
      toValue: 1,
      friction: 5,
      tension: 180,
      useNativeDriver: true,
    }).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = checkWinner(newBoard);
    if (result) {
      setWinResult(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (newBoard.every((c) => c !== null)) {
      setIsDraw(true);
    } else {
      setCurrent(current === '❤️' ? '⭐' : '❤️');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrent('❤️');
    setWinResult(null);
    setIsDraw(false);
    scaleAnims.forEach((a) => a.setValue(0));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const isWinCell = (i: number) => winResult?.line.includes(i) ?? false;

  return (
    <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 100 }}>
      {/* Status */}
      <View style={styles.tttStatusBox}>
        {winResult ? (
          <Text style={[styles.tttStatusText, { color: colors.deepPurple }]}>
            {winResult.winner} Wins! 🎉
          </Text>
        ) : isDraw ? (
          <Text style={[styles.tttStatusText, { color: colors.deepPurple }]}>It's a draw! 🌈</Text>
        ) : (
          <Text style={[styles.tttStatusText, { color: colors.deepPurple }]}>
            {current}'s turn
          </Text>
        )}
      </View>

      {/* Player indicators */}
      <View style={styles.tttPlayers}>
        {(['❤️', '⭐'] as Player[]).map((p, i) => {
          const isActive = current === p && !winResult && !isDraw;
          const isWinner = winResult?.winner === p;
          return (
            <View
              key={p}
              style={[
                styles.tttPlayerChip,
                {
                  backgroundColor: isActive || isWinner ? colors.midPurple : colors.card,
                  borderColor: isActive || isWinner ? colors.midPurple : colors.border,
                },
              ]}
            >
              <Text style={{ fontSize: 22 }}>{p}</Text>
              <Text
                style={[
                  styles.tttPlayerLabel,
                  { color: isActive || isWinner ? '#fff' : colors.deepPurple },
                ]}
              >
                Player {i + 1}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Board */}
      <View
        style={[
          styles.tttBoard,
          { width: boardSize, borderColor: '#CECBF6' },
        ]}
      >
        {[0, 1, 2].map((row) => (
          <View
            key={row}
            style={[
              styles.tttRow,
              row < 2 && { borderBottomWidth: 4, borderColor: '#534AB7' },
            ]}
          >
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              const cell = board[idx];
              const winning = isWinCell(idx);
              return (
                <Pressable
                  key={col}
                  onPress={() => handleCellPress(idx)}
                  style={({ pressed }) => [
                    styles.tttCell,
                    {
                      width: cellSize,
                      height: cellSize,
                      borderRightWidth: col < 2 ? 4 : 0,
                      borderColor: '#534AB7',
                      backgroundColor: winning
                        ? 'rgba(83,74,183,0.15)'
                        : pressed && !cell
                        ? 'rgba(83,74,183,0.06)'
                        : 'transparent',
                    },
                  ]}
                >
                  {cell && (
                    <Animated.Text
                      style={{
                        fontSize: cellSize * 0.52,
                        lineHeight: cellSize * 0.58,
                        transform: [{ scale: scaleAnims[idx] }],
                      }}
                    >
                      {cell}
                    </Animated.Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Buttons */}
      <Pressable
        onPress={resetGame}
        style={({ pressed }) => [
          styles.playAgainBtn,
          {
            backgroundColor: winResult || isDraw ? colors.midPurple : colors.card,
            borderColor: colors.midPurple,
            opacity: pressed ? 0.7 : 1,
            marginTop: 24,
          },
        ]}
      >
        <Text
          style={[
            styles.playAgainText,
            { color: winResult || isDraw ? '#fff' : colors.midPurple },
          ]}
        >
          {winResult || isDraw ? 'Play Again ✨' : 'Restart'}
        </Text>
      </Pressable>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GAMES SCREEN
═══════════════════════════════════════════════════════════════ */

export default function GamesScreen() {
  const colors = useColors();
  const [activeGame, setActiveGame] = useState<GameMode>('memory');
  const topPad = Platform.OS === 'web' ? 67 : 0;

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
        <Text style={[styles.title, { color: colors.deepPurple }]}>Games</Text>

        <View style={[styles.segmented, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Pressable
            onPress={() => {
              setActiveGame('memory');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.segBtn, activeGame === 'memory' && { backgroundColor: colors.midPurple }]}
          >
            <Text style={{ fontSize: 14 }}>🃏</Text>
            <Text style={[styles.segBtnText, { color: activeGame === 'memory' ? '#fff' : colors.deepPurple }]}>
              Memory
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setActiveGame('tictactoe');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.segBtn, activeGame === 'tictactoe' && { backgroundColor: colors.midPurple }]}
          >
            <Text style={{ fontSize: 14 }}>❤️</Text>
            <Text style={[styles.segBtnText, { color: activeGame === 'tictactoe' ? '#fff' : colors.deepPurple }]}>
              Tic Tac Toe
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {activeGame === 'memory' ? <MemoryGame /> : <TicTacToeGame />}
      </ScrollView>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────── */
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
    paddingVertical: 9,
  },
  segBtnText: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  /* Memory Match */
  cardFace: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#26215C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  cornerSparkle: { position: 'absolute' },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
    marginTop: 4,
  },
  stat: { alignItems: 'center', minWidth: 48 },
  statVal: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  newGameBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  newGameBtnText: { fontSize: 13, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold' },

  winBanner: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  winTitle: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'Inter_700Bold', textAlign: 'center' },
  winSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontFamily: 'Inter_400Regular' },

  /* Tic-Tac-Toe */
  tttStatusBox: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tttStatusText: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold', textAlign: 'center' },

  tttPlayers: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  tttPlayerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  tttPlayerLabel: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },

  tttBoard: {
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    borderWidth: 3,
  },
  tttRow: {
    flexDirection: 'row',
  },
  tttCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  playAgainBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2,
  },
  playAgainText: { fontSize: 16, fontWeight: '700', fontFamily: 'Inter_700Bold' },
});
