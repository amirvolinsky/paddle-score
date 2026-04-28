export type PadelPoint = '0' | '15' | '30' | '40' | 'Ad';

/** Standard advantage deuce (Ad), or next point wins at 40–40 (golden point). */
export type DeuceMode = 'advantage' | 'golden_point';

export interface MatchConfig {
  firstServer: 'A' | 'B';
  deuceMode: DeuceMode;
}

export interface PlayerNames {
  teamA: [string, string];
  teamB: [string, string];
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
  isDeuce: boolean;
  /** Locked for the match from {@link MatchConfig}. */
  deuceMode: DeuceMode;
  server: 'A' | 'B';
  matchOver: boolean;
  winner: 'A' | 'B' | null;
  lastEvent: ScoreEvent;
  lastGameWinner: 'A' | 'B' | null;
  lastSetWinner: 'A' | 'B' | null;
  prevGamesA: number;
  prevGamesB: number;
}

export type ScoringAction =
  | { type: 'POINT_TEAM_A' }
  | { type: 'POINT_TEAM_B' }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'INIT_MATCH'; payload: MatchConfig };

export interface ScoringState {
  current: GameScore;
  history: GameScore[];
}
