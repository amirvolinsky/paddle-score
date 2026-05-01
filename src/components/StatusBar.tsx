import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameScore, PlayerNames } from '../types/scoring';

interface Props {
  score: GameScore;
  bleConnected: boolean;
  names: PlayerNames;
}

export function ConnectionStatus({ score, bleConnected, names }: Props) {
  const serverNames = score.server === 'A'
    ? `${names.teamA[0]} & ${names.teamA[1]}`
    : `${names.teamB[0]} & ${names.teamB[1]}`;
  const matchFormatLabel = score.setsRequiredToWin === 3 ? 'Best of 5' : 'Best of 3';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.indicator}>
          <View style={[styles.dot, bleConnected ? styles.dotConnected : styles.dotDisconnected]} />
          <Text style={styles.label}>BLE</Text>
        </View>

        <View style={styles.indicator}>
          <View style={[styles.dot, styles.dotConnected]} />
          <Text style={styles.label}>SPEECH</Text>
        </View>

        <View style={styles.serverBadge}>
          <Text style={styles.serverText}>
            🎾 {serverNames}
          </Text>
        </View>

        <View style={styles.formatBadge}>
          <Text style={styles.formatText}>{matchFormatLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: '#4a9eff',
  },
  dotDisconnected: {
    backgroundColor: '#c41e3a',
  },
  label: {
    color: '#5a7a9b',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  serverBadge: {
    backgroundColor: '#0a1628',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a3a5c',
  },
  serverText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  formatBadge: {
    backgroundColor: '#0f2038',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a5588',
  },
  formatText: {
    color: '#a8c8e8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
