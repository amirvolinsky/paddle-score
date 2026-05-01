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
      <ScoreDisplay score={score} names={names} variant="court" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#060d18',
  },
});
