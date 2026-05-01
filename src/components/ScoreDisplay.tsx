import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameScore, PlayerNames } from '../types/scoring';

interface Props {
  score: GameScore;
  names: PlayerNames;
  variant?: 'default' | 'court';
}

export function ScoreDisplay({ score, names, variant = 'default' }: Props) {
  const isCourt = variant === 'court';
  const teamALabel = `${names.teamA[0]} / ${names.teamA[1]}`;
  const teamBLabel = `${names.teamB[0]} / ${names.teamB[1]}`;

  if (score.matchOver) {
    const winnerLabel = score.winner === 'A' ? teamALabel : teamBLabel;
    return (
      <View style={styles.container}>
        <View style={[styles.matchOverBanner, isCourt && styles.matchOverBannerCourt]}>
          <Text style={[styles.matchOverText, isCourt && styles.matchOverTextCourt]}>MATCH OVER</Text>
          <Text style={[styles.winnerText, isCourt && styles.winnerTextCourt]}>{winnerLabel}</Text>
          <Text style={[styles.winnerSubtext, isCourt && styles.winnerSubtextCourt]}>WINS</Text>
        </View>
        <SetScoreRow score={score} teamALabel={teamALabel} teamBLabel={teamBLabel} isCourt={isCourt} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SetScoreRow score={score} teamALabel={teamALabel} teamBLabel={teamBLabel} isCourt={isCourt} />
      <GameScoreRow score={score} isCourt={isCourt} />
      <PointScoreRow score={score} isCourt={isCourt} />
      {score.isTieBreak && <TieBreakScoreRow score={score} isCourt={isCourt} />}
      {score.isDeuce && (
        <View style={[styles.deuceBadge, isCourt && styles.deuceBadgeCourt]}>
          <Text style={[styles.deuceText, isCourt && styles.deuceTextCourt]}>DEUCE</Text>
        </View>
      )}
      <ServingIndicator score={score} names={names} isCourt={isCourt} />
    </View>
  );
}

function SetScoreRow({
  score,
  teamALabel,
  teamBLabel,
  isCourt,
}: {
  score: GameScore;
  teamALabel: string;
  teamBLabel: string;
  isCourt: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.teamColumn}>
        <Text style={[styles.teamLabel, isCourt && styles.teamLabelCourt, score.server === 'A' && styles.teamLabelServing]} numberOfLines={1}>
          {teamALabel}
        </Text>
        <Text style={[styles.setScore, isCourt && styles.setScoreCourt]}>{score.setsA}</Text>
      </View>
      <View style={styles.separator}>
        <Text style={[styles.separatorText, isCourt && styles.separatorTextCourt]}>SETS</Text>
      </View>
      <View style={styles.teamColumn}>
        <Text style={[styles.teamLabel, isCourt && styles.teamLabelCourt, score.server === 'B' && styles.teamLabelServing]} numberOfLines={1}>
          {teamBLabel}
        </Text>
        <Text style={[styles.setScore, isCourt && styles.setScoreCourt]}>{score.setsB}</Text>
      </View>
    </View>
  );
}

function GameScoreRow({ score, isCourt }: { score: GameScore; isCourt: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.teamColumn}>
        <Text style={[styles.gameScore, isCourt && styles.gameScoreCourt]}>{score.gamesA}</Text>
      </View>
      <View style={styles.separator}>
        <Text style={[styles.separatorText, isCourt && styles.separatorTextCourt]}>GAMES</Text>
      </View>
      <View style={styles.teamColumn}>
        <Text style={[styles.gameScore, isCourt && styles.gameScoreCourt]}>{score.gamesB}</Text>
      </View>
    </View>
  );
}

function PointScoreRow({ score, isCourt }: { score: GameScore; isCourt: boolean }) {
  if (score.isTieBreak) {
    return (
      <View style={[styles.pointRow, isCourt && styles.pointRowCourt]}>
        <View style={styles.pointColumn}>
          <Text style={[styles.pointText, isCourt && styles.pointTextCourt]}>{score.tieBreakPointsA}</Text>
        </View>
        <View style={styles.pointSeparator}>
          <Text style={[styles.pointDash, isCourt && styles.pointDashCourt]}>:</Text>
        </View>
        <View style={styles.pointColumn}>
          <Text style={[styles.pointText, isCourt && styles.pointTextCourt]}>{score.tieBreakPointsB}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.pointRow, isCourt && styles.pointRowCourt]}>
      <View style={styles.pointColumn}>
        <Text style={[styles.pointText, isCourt && styles.pointTextCourt, score.teamA === 'Ad' && styles.pointHighlight]}>
          {score.teamA === 'Ad' ? 'AD' : score.teamA}
        </Text>
      </View>
      <View style={styles.pointSeparator}>
        <Text style={[styles.pointDash, isCourt && styles.pointDashCourt]}>:</Text>
      </View>
      <View style={styles.pointColumn}>
        <Text style={[styles.pointText, isCourt && styles.pointTextCourt, score.teamB === 'Ad' && styles.pointHighlight]}>
          {score.teamB === 'Ad' ? 'AD' : score.teamB}
        </Text>
      </View>
    </View>
  );
}

function TieBreakScoreRow({ score, isCourt }: { score: GameScore; isCourt: boolean }) {
  return (
    <View style={[styles.tieBreakBadge, isCourt && styles.tieBreakBadgeCourt]}>
      <Text style={[styles.tieBreakText, isCourt && styles.tieBreakTextCourt]}>TIE-BREAK</Text>
      <Text style={[styles.tieBreakSubText, isCourt && styles.tieBreakSubTextCourt]}>First to 7, win by 2</Text>
    </View>
  );
}

function ServingIndicator({ score, names, isCourt }: { score: GameScore; names: PlayerNames; isCourt: boolean }) {
  const serverName = score.server === 'A'
    ? names.teamA[score.serverPlayerA]
    : names.teamB[score.serverPlayerB];

  return (
    <View style={styles.servingRow}>
      <Text style={[styles.servingBall, isCourt && styles.servingBallCourt]}>🎾</Text>
      <Text style={[styles.servingText, isCourt && styles.servingTextCourt]}>{serverName} to serve</Text>
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
  separatorTextCourt: {
    fontSize: 18,
  },
  teamLabel: {
    color: '#8aa8c7',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  teamLabelCourt: {
    fontSize: 18,
    marginBottom: 8,
  },
  teamLabelServing: {
    color: '#ffffff',
  },
  setScore: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '900',
  },
  setScoreCourt: {
    fontSize: 86,
  },
  gameScore: {
    color: '#b0d4f1',
    fontSize: 36,
    fontWeight: '700',
  },
  gameScoreCourt: {
    fontSize: 64,
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
  pointRowCourt: {
    marginTop: 26,
    paddingVertical: 34,
    paddingHorizontal: 60,
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
  pointDashCourt: {
    fontSize: 84,
  },
  pointText: {
    color: '#ffffff',
    fontSize: 72,
    fontWeight: '900',
  },
  pointTextCourt: {
    fontSize: 118,
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
  deuceBadgeCourt: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  tieBreakBadge: {
    marginTop: 12,
    backgroundColor: '#0050d4',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  tieBreakBadgeCourt: {
    marginTop: 18,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  tieBreakText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tieBreakTextCourt: {
    fontSize: 22,
  },
  tieBreakSubText: {
    color: '#d8e7ff',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  tieBreakSubTextCourt: {
    fontSize: 15,
    marginTop: 4,
  },
  deuceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
  deuceTextCourt: {
    fontSize: 24,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  servingBallCourt: {
    fontSize: 24,
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
  servingTextCourt: {
    fontSize: 20,
  },
  matchOverBanner: {
    alignItems: 'center',
    marginBottom: 20,
  },
  matchOverBannerCourt: {
    marginBottom: 26,
  },
  matchOverText: {
    color: '#c41e3a',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },
  matchOverTextCourt: {
    fontSize: 44,
  },
  winnerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  winnerTextCourt: {
    fontSize: 42,
  },
  winnerSubtext: {
    color: '#4a9eff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  winnerSubtextCourt: {
    fontSize: 52,
  },
});
