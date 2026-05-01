import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GameScore, PlayerNames } from '../types/scoring';
import { ScoreDisplay } from './ScoreDisplay';

interface Props {
  score: GameScore;
  names: PlayerNames;
}

export function CourtScoreboardView({ score, names }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.topHint}>COURT MODE</Text>
      <ScoreDisplay score={score} names={names} variant="court" />
      <Text style={styles.bottomHint}>Tap left/right to add points • hold to undo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#060d18',
  },
  topHint: {
    color: '#2f5d89',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 10,
  },
  bottomHint: {
    color: '#2a4a6c',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '600',
  },
});
