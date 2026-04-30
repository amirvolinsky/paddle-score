import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameScore, PadelPoint, PlayerNames } from '../types/scoring';

interface Props {
  score: GameScore;
  names: PlayerNames;
}

function renderPoint(point: PadelPoint, isHighlight: boolean): React.ReactNode {
  return (
    <Text style={[styles.pointText, isHighlight && styles.pointHighlight]}>
      {point === 'Ad' ? 'AD' : point}
    </Text>
  );
}

export function ScoreDisplay({ score, names }: Props) {
  const teamALabel = `${names.teamA[0]} / ${names.teamA[1]}`;
  const teamBLabel = `${names.teamB[0]} / ${names.teamB[1]}`;

  if (score.matchOver) {
    const winnerLabel = score.winner === 'A' ? teamALabel : teamBLabel;
    return (
      <View style={styles.container}>
        <View style={styles.matchOverBanner}>
          <Text style={styles.matchOverText}>MATCH OVER</Text>
          <Text style={styles.winnerText}>{winnerLabel}</Text>
          <Text style={styles.winnerSubtext}>WINS</Text>
        </View>
        <SetScoreRow score={score} teamALabel={teamALabel} teamBLabel={teamBLabel} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SetScoreRow score={score} teamALabel={teamALabel} teamBLabel={teamBLabel} />
      <GameScoreRow score={score} />
      <PointScoreRow score={score} />
      {score.isDeuce && (
        <View style={styles.deuceBadge}>
          <Text style={styles.deuceText}>DEUCE</Text>
        </View>
      )}
      <ServingIndicator score={score} names={names} />
    </View>
  );
}

function SetScoreRow({ score, teamALabel, teamBLabel }: { score: GameScore; teamALabel: string; teamBLabel: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.teamColumn}>
        <Text style={[styles.teamLabel, score.server === 'A' && styles.teamLabelServing]} numberOfLines={1}>
          {teamALabel}
        </Text>
        <Text style={styles.setScore}>{score.setsA}</Text>
      </View>
      <View style={styles.separator}>
        <Text style={styles.separatorText}>SETS</Text>
      </View>
      <View style={styles.teamColumn}>
        <Text style={[styles.teamLabel, score.server === 'B' && styles.teamLabelServing]} numberOfLines={1}>
          {teamBLabel}
        </Text>
        <Text style={styles.setScore}>{score.setsB}</Text>
      </View>
    </View>
  );
}

function GameScoreRow({ score }: { score: GameScore }) {
  return (
    <View style={styles.row}>
      <View style={styles.teamColumn}>
        <Text style={styles.gameScore}>{score.gamesA}</Text>
      </View>
      <View style={styles.separator}>
        <Text style={styles.separatorText}>GAMES</Text>
      </View>
      <View style={styles.teamColumn}>
        <Text style={styles.gameScore}>{score.gamesB}</Text>
      </View>
    </View>
  );
}

function PointScoreRow({ score }: { score: GameScore }) {
  return (
    <View style={styles.pointRow}>
      <View style={styles.pointColumn}>
        {renderPoint(score.teamA, score.teamA === 'Ad')}
      </View>
      <View style={styles.pointSeparator}>
        <Text style={styles.pointDash}>:</Text>
      </View>
      <View style={styles.pointColumn}>
        {renderPoint(score.teamB, score.teamB === 'Ad')}
      </View>
    </View>
  );
}

function ServingIndicator({ score, names }: { score: GameScore; names: PlayerNames }) {
  const serverNames = score.server === 'A'
    ? `${names.teamA[0]} & ${names.teamA[1]}`
    : `${names.teamB[0]} & ${names.teamB[1]}`;

  return (
    <View style={styles.servingRow}>
      <Text style={styles.servingBall}>🎾</Text>
      <Text style={styles.servingText}>{serverNames} to serve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },
  separator: {
    width: 70,
    alignItems: 'center',
  },
  separatorText: {
    color: '#5a7a9b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  teamLabel: {
    color: '#8aa8c7',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  teamLabelServing: {
    color: '#ffffff',
  },
  setScore: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
  },
  gameScore: {
    color: '#b0d4f1',
    fontSize: 36,
    fontWeight: '700',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#0a1628',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 40,
    width: '100%',
    borderWidth: 2,
    borderColor: '#1a3a5c',
  },
  pointColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pointSeparator: {
    width: 40,
    alignItems: 'center',
  },
  pointDash: {
    color: '#4a9eff',
    fontSize: 64,
    fontWeight: '900',
  },
  pointText: {
    color: '#ffffff',
    fontSize: 72,
    fontWeight: '900',
  },
  pointHighlight: {
    color: '#4a9eff',
  },
  deuceBadge: {
    marginTop: 12,
    backgroundColor: '#c41e3a',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deuceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  servingBall: {
    fontSize: 16,
  },
  servingText: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  matchOverBanner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  matchOverText: {
    color: '#c41e3a',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },
  winnerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  winnerSubtext: {
    color: '#4a9eff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
});
