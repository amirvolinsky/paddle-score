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
} from 'react-native';
import { PlayerNames, MatchConfig, DeuceMode } from '../types/scoring';

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

  const canStart = a1.trim() && a2.trim() && b1.trim() && b2.trim();

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
      }
    );
  };

  const teamALabel = a1.trim() && a2.trim() ? `${a1.trim()} & ${a2.trim()}` : 'Team A';
  const teamBLabel = b1.trim() && b2.trim() ? `${b1.trim()} & ${b2.trim()}` : 'Team B';

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>PADEL</Text>
        <Text style={styles.subtitle}>SCOREKEEPER</Text>

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

        <TouchableOpacity
          style={[styles.startButton, !canStart && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={!canStart}
          activeOpacity={0.7}
        >
          <Text style={styles.startButtonText}>START MATCH</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#060d18',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  title: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#3a5a7c',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  teamSection: {
    marginBottom: 28,
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
    color: '#8aa8c7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#0a1628',
    borderWidth: 2,
    borderColor: '#1a3a5c',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: '#0050d4',
    backgroundColor: '#0d1f3d',
  },
  toggleBtnText: {
    color: '#8aa8c7',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
  toggleHint: {
    color: '#4a6a8c',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#0050d4',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
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
