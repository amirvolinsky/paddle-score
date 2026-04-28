import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { PlayerNames } from '../types/scoring';

interface Props {
  onTeamA: () => void;
  onTeamB: () => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  names: PlayerNames;
}

export function SimulationPanel({ onTeamA, onTeamB, onUndo, onReset, canUndo, names }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>SIMULATION MODE</Text>

      <View style={styles.scoreButtons}>
        <TouchableOpacity
          style={[styles.button, styles.teamAButton]}
          onPress={onTeamA}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonIcon}>+1</Text>
          <Text style={styles.buttonText}>{names.teamA[0]}</Text>
          <Text style={styles.buttonSubtext}>{names.teamA[1]}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.teamBButton]}
          onPress={onTeamB}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonIcon}>+1</Text>
          <Text style={styles.buttonText}>{names.teamB[0]}</Text>
          <Text style={styles.buttonSubtext}>{names.teamB[1]}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.undoButton, !canUndo && styles.disabledButton]}
          onPress={onUndo}
          disabled={!canUndo}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>UNDO</Text>
          <Text style={styles.actionSubtext}>Long Press</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton]}
          onPress={onReset}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>RESET</Text>
          <Text style={styles.actionSubtext}>New Match</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  header: {
    color: '#3a5a7c',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAButton: {
    backgroundColor: '#0050d4',
  },
  teamBButton: {
    backgroundColor: '#1a6bff',
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  buttonText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  undoButton: {
    borderColor: '#4a9eff',
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
  },
  resetButton: {
    borderColor: '#3a5a7c',
    backgroundColor: 'rgba(58, 90, 124, 0.1)',
  },
  disabledButton: {
    opacity: 0.3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionSubtext: {
    color: '#5a7a9b',
    fontSize: 11,
    marginTop: 2,
  },
});
