export type PadelPoint = '0' | '15' | '30' | '40' | 'Ad';

/** Standard advantage deuce (Ad), or next point wins at 40–40 (golden point). */
export type DeuceMode = 'advantage' | 'golden_point';
export type MatchFormat = 'best_of_3' | 'best_of_5';

export interface MatchConfig {
  firstServer: 'A' | 'B';
  firstServerPlayerA: 0 | 1;
  firstServerPlayerB: 0 | 1;
  deuceMode: DeuceMode;
  matchFormat: MatchFormat;
}

export interface PlayerNames {
  teamA: [string, string];
  teamB: [string, string];
}

export interface SetResult {
  teamAGames: number;
  teamBGames: number;
  winner: 'A' | 'B';
}

export type ScoreEvent =
  | 'point'
  | 'game_won'
  | 'set_won'
  | 'match_won'
  | 'new_game';

export interface GameScore {
  teamA: PadelPoint;
  teamB: PadelPoint;
  gamesA: number;
  gamesB: number;
  setsA: number;
  setsB: number;
  tieBreakPointsA: number;
  tieBreakPointsB: number;
  isTieBreak: boolean;
  setsRequiredToWin: number;
  isMatchPoint: boolean;
  matchPointTeam: 'A' | 'B' | null;
  isDeuce: boolean;
  /** Locked for the match from {@link MatchConfig}. */
  deuceMode: DeuceMode;
  /**
   * Once true for the current game: non–forty-love 40 lines no longer append the leading team’s name
   * (first such line with names includes the leader; pure 40–0 / 0–40 omits names). Resets each new game/set.
   */
  highScoreLeaderNamesSpokenThisGame: boolean;
  server: 'A' | 'B';
  /** Current server within each team: 0 => first listed player, 1 => second listed player. */
  serverPlayerA: 0 | 1;
  serverPlayerB: 0 | 1;
  /** Tie-break service anchor (first point server in the tie-break). */
  tieBreakFirstServer: 'A' | 'B' | null;
  tieBreakStartServerPlayerA: 0 | 1;
  tieBreakStartServerPlayerB: 0 | 1;
  matchOver: boolean;
  winner: 'A' | 'B' | null;
  lastEvent: ScoreEvent;
  lastGameWinner: 'A' | 'B' | null;
  lastSetWinner: 'A' | 'B' | null;
  prevGamesA: number;
  prevGamesB: number;
  setResults: SetResult[];
  matchStartedAt: number | null;
  matchEndedAt: number | null;
}

export type ScoringAction =
  | { type: 'POINT_TEAM_A' }
  | { type: 'POINT_TEAM_B' }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'INIT_MATCH'; payload: MatchConfig }
  | { type: 'LOAD_TEST_PRE_TIEBREAK'; payload: MatchConfig }
  | { type: 'LOAD_TEST_PRE_GAME_WIN'; payload: MatchConfig };

export interface ScoringState {
  current: GameScore;
  history: GameScore[];
}
