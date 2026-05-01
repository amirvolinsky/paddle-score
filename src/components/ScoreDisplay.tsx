import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GameScore, PlayerNames, SetResult } from '../types/scoring';

interface Props {
  score: GameScore;
  names: PlayerNames;
  variant?: 'default' | 'court';
}

export function ScoreDisplay({ score, names, variant = 'default' }: Props) {
  const isCourt = variant === 'court';
  const teamALabel = `${names.teamA[0]} / ${names.teamA[1]}`;
  const teamBLabel = `${names.teamB[0]} / ${names.teamB[1]}`;

  if (isCourt) {
    return <CourtModeScoreDisplay score={score} names={names} teamALabel={teamALabel} teamBLabel={teamBLabel} />;
  }

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

function CourtModeScoreDisplay({
  score,
  names,
  teamALabel,
  teamBLabel,
}: {
  score: GameScore;
  names: PlayerNames;
  teamALabel: string;
  teamBLabel: string;
}) {
  const pointA = score.isTieBreak ? String(score.tieBreakPointsA) : (score.teamA === 'Ad' ? 'AD' : score.teamA);
  const pointB = score.isTieBreak ? String(score.tieBreakPointsB) : (score.teamB === 'Ad' ? 'AD' : score.teamB);
  const winnerLabel = score.winner === 'A' ? teamALabel : teamBLabel;

  return (
    <View style={styles.courtRoot}>
      <View style={styles.courtTopRow}>
        <View style={styles.courtTeamHeader}>
          <Text style={styles.courtGamesValue}>{score.gamesA}</Text>
          <Text style={styles.courtSetsText}>SETS {score.setsA}</Text>
          <Text style={[styles.courtTeamName, score.server === 'A' && styles.courtTeamNameServing]} numberOfLines={1}>
            {teamALabel}
          </Text>
        </View>
        <View style={styles.courtMiddleTag}>
          <Text style={styles.courtMiddleTagText}>GAMES</Text>
        </View>
        <View style={styles.courtTeamHeader}>
          <Text style={styles.courtGamesValue}>{score.gamesB}</Text>
          <Text style={styles.courtSetsText}>SETS {score.setsB}</Text>
          <Text style={[styles.courtTeamName, score.server === 'B' && styles.courtTeamNameServing]} numberOfLines={1}>
            {teamBLabel}
          </Text>
        </View>
      </View>

      {score.matchOver ? (
        <CourtMatchSummary
          teamALabel={teamALabel}
          teamBLabel={teamBLabel}
          winnerLabel={winnerLabel}
          setResults={score.setResults}
        />
      ) : (
        <View style={styles.courtMainScore}>
          <Text style={styles.courtPointValue}>{pointA}</Text>
          <Text style={styles.courtPointSeparator}>:</Text>
          <Text style={styles.courtPointValue}>{pointB}</Text>
        </View>
      )}

      <View style={styles.courtInfoRow}>
        {!score.matchOver && score.isTieBreak ? (
          <View style={styles.courtBadge}>
            <Text style={styles.courtBadgeText}>TIE-BREAK</Text>
            <Text style={styles.courtBadgeSubText}>First to 7, win by 2</Text>
          </View>
        ) : score.isDeuce ? (
          <View style={[styles.courtBadge, styles.courtBadgeDanger]}>
            <Text style={styles.courtBadgeText}>DEUCE</Text>
          </View>
        ) : null}

        {!score.matchOver && (
          <View style={styles.courtServeRow}>
            <Text style={styles.courtServeBall}>🎾</Text>
            <Text style={styles.courtServeText}>
              {(score.server === 'A' ? names.teamA[score.serverPlayerA] : names.teamB[score.serverPlayerB])} serves
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function CourtMatchSummary({
  teamALabel,
  teamBLabel,
  winnerLabel,
  setResults,
}: {
  teamALabel: string;
  teamBLabel: string;
  winnerLabel: string;
  setResults: SetResult[];
}) {
  return (
    <View style={styles.courtSummaryCard}>
      <Text style={styles.courtSummaryTitle}>MATCH OVER</Text>
      <Text style={styles.courtSummaryWinner}>{winnerLabel} WINS</Text>

      <View style={styles.courtSummaryTable}>
        <View style={styles.courtSummaryHeaderRow}>
          <View style={styles.courtSummaryNameCell} />
          {setResults.map((_, index) => (
            <View key={`head-${index}`} style={styles.courtSummarySetCell}>
              <Text style={styles.courtSummaryHeadText}>S{index + 1}</Text>
            </View>
          ))}
        </View>

        <View style={styles.courtSummaryDataRow}>
          <View style={styles.courtSummaryNameCell}>
            <Text style={styles.courtSummaryTeamName} numberOfLines={1}>{teamALabel}</Text>
          </View>
          {setResults.map((set, index) => (
            <View
              key={`a-${index}`}
              style={[
                styles.courtSummarySetCell,
                set.winner === 'A' && styles.courtSummaryWinnerCell,
              ]}
            >
              <Text style={[styles.courtSummarySetScore, set.winner === 'A' && styles.courtSummaryWinnerCellText]}>
                {set.teamAGames}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.courtSummaryDataRow}>
          <View style={styles.courtSummaryNameCell}>
            <Text style={styles.courtSummaryTeamName} numberOfLines={1}>{teamBLabel}</Text>
          </View>
          {setResults.map((set, index) => (
            <View
              key={`b-${index}`}
              style={[
                styles.courtSummarySetCell,
                set.winner === 'B' && styles.courtSummaryWinnerCell,
              ]}
            >
              <Text style={[styles.courtSummarySetScore, set.winner === 'B' && styles.courtSummaryWinnerCellText]}>
                {set.teamBGames}
              </Text>
            </View>
          ))}
        </View>
      </View>
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
  courtRoot: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 20,
  },
  courtTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courtTeamHeader: {
    flex: 1,
    alignItems: 'center',
  },
  courtTeamName: {
    color: '#80a9d3',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  courtTeamNameServing: {
    color: '#ffffff',
  },
  courtGamesValue: {
    color: '#c7dcf3',
    fontSize: 78,
    fontWeight: '900',
    lineHeight: 84,
  },
  courtSetsText: {
    color: '#56779a',
    fontSize: 13,
    letterSpacing: 1.6,
    fontWeight: '700',
    marginTop: -2,
  },
  courtMiddleTag: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  courtMiddleTagText: {
    color: '#37597a',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2.2,
  },
  courtMainScore: {
    width: '100%',
    minHeight: 190,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#1a3552',
    backgroundColor: '#081527',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 18,
  },
  courtPointValue: {
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 150,
    fontWeight: '900',
    lineHeight: 158,
  },
  courtPointSeparator: {
    color: '#3d90ef',
    fontSize: 104,
    fontWeight: '900',
    marginTop: -10,
    marginHorizontal: 4,
  },
  courtInfoRow: {
    marginTop: 8,
    width: '100%',
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
  },
  courtSummaryCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#24486b',
    backgroundColor: '#081527',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 4,
    alignItems: 'center',
  },
  courtSummaryTitle: {
    color: '#ff5f7d',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  courtSummaryWinner: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 10,
  },
  courtSummaryTable: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a4563',
    backgroundColor: '#0b1d32',
  },
  courtSummaryHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#12253f',
  },
  courtSummaryDataRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#233b57',
  },
  courtSummaryNameCell: {
    flex: 1.8,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  courtSummarySetCell: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#233b57',
  },
  courtSummaryHeadText: {
    color: '#89a9ce',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  courtSummaryTeamName: {
    color: '#d4e5fa',
    fontSize: 17,
    fontWeight: '800',
  },
  courtSummarySetScore: {
    color: '#eaf3ff',
    fontSize: 24,
    fontWeight: '900',
  },
  courtSummaryWinnerCell: {
    backgroundColor: '#2c55ff',
  },
  courtSummaryWinnerCellText: {
    color: '#ffffff',
  },
  courtBadge: {
    backgroundColor: '#0050d4',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  courtBadgeDanger: {
    backgroundColor: '#c41e3a',
  },
  courtBadgeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  courtBadgeSubText: {
    color: '#dbe8ff',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '700',
  },
  courtServeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courtServeBall: {
    fontSize: 22,
  },
  courtServeText: {
    color: '#4a9eff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
