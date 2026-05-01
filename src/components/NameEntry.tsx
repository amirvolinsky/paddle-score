import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ViewStyle,
} from 'react-native';
import { PlayerNames, MatchConfig, DeuceMode, MatchFormat } from '../types/scoring';
import { BrandHeader } from './BrandHeader';

interface Props {
  onStart: (names: PlayerNames, config: MatchConfig) => void;
}

export function NameEntry({ onStart }: Props) {
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [firstServer, setFirstServer] = useState<'A' | 'B'>('A');
  const [deuceMode, setDeuceMode] = useState<DeuceMode>('advantage');
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('best_of_3');

  const canStart = Boolean(a1.trim() && a2.trim() && b1.trim() && b2.trim());

  const handleStart = () => {
    if (!canStart) return;
    onStart(
      {
        teamA: [a1.trim(), a2.trim()],
        teamB: [b1.trim(), b2.trim()],
      },
      {
        firstServer,
        deuceMode,
        matchFormat,
      }
    );
  };

  const teamALabel = a1.trim() && a2.trim() ? `${a1.trim()} & ${a2.trim()}` : 'Team A';
  const teamBLabel = b1.trim() && b2.trim() ? `${b1.trim()} & ${b2.trim()}` : 'Team B';

  const scrollBody = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        Platform.OS === 'web'
          ? ({ minHeight: '100vh' } as unknown as ViewStyle)
          : null,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      <BrandHeader size="large" />

      <View style={styles.setupCard}>
        <Text style={styles.sectionLabel}>WHO SERVES FIRST?</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, firstServer === 'A' && styles.toggleBtnActive]}
            onPress={() => setFirstServer('A')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, firstServer === 'A' && styles.toggleBtnTextActive]}>
              {teamALabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, firstServer === 'B' && styles.toggleBtnActive]}
            onPress={() => setFirstServer('B')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, firstServer === 'B' && styles.toggleBtnTextActive]}>
              {teamBLabel}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>DEUCE SYSTEM</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, deuceMode === 'advantage' && styles.toggleBtnActive]}
            onPress={() => setDeuceMode('advantage')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, deuceMode === 'advantage' && styles.toggleBtnTextActive]}>
              Advantage
            </Text>
            <Text style={styles.toggleHint}>Ad — win by two</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, deuceMode === 'golden_point' && styles.toggleBtnActive]}
            onPress={() => setDeuceMode('golden_point')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, deuceMode === 'golden_point' && styles.toggleBtnTextActive]}>
              Golden point
            </Text>
            <Text style={styles.toggleHint}>40–40: next point wins</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>MATCH FORMAT</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, matchFormat === 'best_of_3' && styles.toggleBtnActive]}
            onPress={() => setMatchFormat('best_of_3')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, matchFormat === 'best_of_3' && styles.toggleBtnTextActive]}>
              Best of 3
            </Text>
            <Text style={styles.toggleHint}>First to 2 sets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, matchFormat === 'best_of_5' && styles.toggleBtnActive]}
            onPress={() => setMatchFormat('best_of_5')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleBtnText, matchFormat === 'best_of_5' && styles.toggleBtnTextActive]}>
              Best of 5
            </Text>
            <Text style={styles.toggleHint}>First to 3 sets</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.teamSection}>
        <View style={styles.teamHeader}>
          <View style={[styles.teamDot, { backgroundColor: '#0050d4' }]} />
          <Text style={styles.teamTitle}>TEAM A</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Player 1 name"
          placeholderTextColor="#3a5a7c"
          value={a1}
          onChangeText={setA1}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Player 2 name"
          placeholderTextColor="#3a5a7c"
          value={a2}
          onChangeText={setA2}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      <View style={styles.teamSection}>
        <View style={styles.teamHeader}>
          <View style={[styles.teamDot, { backgroundColor: '#1a6bff' }]} />
          <Text style={styles.teamTitle}>TEAM B</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Player 1 name"
          placeholderTextColor="#3a5a7c"
          value={b1}
          onChangeText={setB1}
          autoCapitalize="words"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Player 2 name"
          placeholderTextColor="#3a5a7c"
          value={b2}
          onChangeText={setB2}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleStart}
        />
      </View>

      <TouchableOpacity
        style={[styles.startButton, !canStart && styles.startButtonDisabled]}
        onPress={handleStart}
        disabled={!canStart}
        activeOpacity={0.7}
      >
        <Text style={styles.startButtonText}>START MATCH</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  if (Platform.OS === 'web') {
    return <View style={styles.wrapper}>{scrollBody}</View>;
  }

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior="padding">
      {scrollBody}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#060d18',
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 48,
  },
  setupCard: {
    borderWidth: 1,
    borderColor: '#1e4a72',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#0a1424',
  },
  teamSection: {
    marginBottom: 22,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  teamDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  teamTitle: {
    color: '#8aa8c7',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3,
  },
  input: {
    backgroundColor: '#0a1628',
    borderWidth: 2,
    borderColor: '#1a3a5c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#a8c8e8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#0f2038',
    borderWidth: 2,
    borderColor: '#2a5588',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: '#0050d4',
    backgroundColor: '#152a4a',
  },
  toggleBtnText: {
    color: '#c8d8e8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
  toggleHint: {
    color: '#6a8aac',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#0050d4',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  startButtonDisabled: {
    opacity: 0.3,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
