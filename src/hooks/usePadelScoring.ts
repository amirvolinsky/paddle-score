import { useReducer, useCallback } from 'react';
import {
  ScoringState,
  ScoringAction,
  GameScore,
  PadelPoint,
  PlayerNames,
  MatchConfig,
} from '../types/scoring';
import type { AnnouncementStep, ClipId } from '../types/announcement';

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  firstServer: 'A',
  deuceMode: 'advantage',
  matchFormat: 'best_of_3',
};

function createInitialScore(config: MatchConfig): GameScore {
  return {
    teamA: '0',
    teamB: '0',
    gamesA: 0,
    gamesB: 0,
    setsA: 0,
    setsB: 0,
    tieBreakPointsA: 0,
    tieBreakPointsB: 0,
    isTieBreak: false,
    setsRequiredToWin: config.matchFormat === 'best_of_5' ? 3 : 2,
    isMatchPoint: false,
    matchPointTeam: null,
    isDeuce: false,
    deuceMode: config.deuceMode,
    server: config.firstServer,
    matchOver: false,
    winner: null,
    lastEvent: 'new_game',
    lastGameWinner: null,
    lastSetWinner: null,
    prevGamesA: 0,
    prevGamesB: 0,
  };
}

const INITIAL_SCORE: GameScore = createInitialScore(DEFAULT_MATCH_CONFIG);

const INITIAL_STATE: ScoringState = {
  current: INITIAL_SCORE,
  history: [],
};

const POINT_SEQUENCE: PadelPoint[] = ['0', '15', '30', '40'];

function nextPoint(current: PadelPoint): PadelPoint {
  const idx = POINT_SEQUENCE.indexOf(current);
  if (idx >= 0 && idx < POINT_SEQUENCE.length - 1) {
    return POINT_SEQUENCE[idx + 1];
  }
  return current;
}

function advanceGame(score: GameScore, scoringTeam: 'A' | 'B'): GameScore {
  if (score.isTieBreak) {
    return advanceTieBreak(score, scoringTeam);
  }

  const next: GameScore = { ...score, lastEvent: 'point' as const, lastGameWinner: null, lastSetWinner: null };
  const scorerKey = `team${scoringTeam}` as 'teamA' | 'teamB';
  const otherTeam = scoringTeam === 'A' ? 'B' : 'A';
  const otherKey = `team${otherTeam}` as 'teamA' | 'teamB';

  const scorerPoints = score[scorerKey];
  const otherPoints = score[otherKey];

  if (scorerPoints === '40' && otherPoints === '40') {
    if (score.deuceMode === 'golden_point') {
      return winGame(score, scoringTeam);
    }
    next[scorerKey] = 'Ad';
    next.isDeuce = true;
    return updateMatchPointState(next);
  }

  if (scorerPoints === 'Ad') {
    return winGame(score, scoringTeam);
  }

  if (otherPoints === 'Ad') {
    next.teamA = '40';
    next.teamB = '40';
    next.isDeuce = true;
    return updateMatchPointState(next);
  }

  if (scorerPoints === '40') {
    return winGame(score, scoringTeam);
  }

  next[scorerKey] = nextPoint(scorerPoints);
  if (next[scorerKey] === '40' && otherPoints === '40') {
    next.isDeuce = true;
  }
  return updateMatchPointState(next);
}

function winGame(score: GameScore, winner: 'A' | 'B'): GameScore {
  const next = { ...score };
  next.teamA = '0';
  next.teamB = '0';
  next.isDeuce = false;
  next.server = next.server === 'A' ? 'B' : 'A';
  next.lastGameWinner = winner;
  next.lastSetWinner = null;

  next.prevGamesA = score.gamesA;
  next.prevGamesB = score.gamesB;

  const gamesKey = winner === 'A' ? 'gamesA' : 'gamesB';
  const otherGamesKey = winner === 'A' ? 'gamesB' : 'gamesA';
  next[gamesKey] = score[gamesKey] + 1;

  const winnerGames = next[gamesKey];
  const otherGames = next[otherGamesKey];

  if (winnerGames >= 6 && winnerGames - otherGames >= 2) {
    return winSet(next, winner);
  }

  if (winnerGames === 6 && otherGames === 6) {
    next.isTieBreak = true;
    next.tieBreakPointsA = 0;
    next.tieBreakPointsB = 0;
    next.lastEvent = 'point';
    return updateMatchPointState(next);
  }

  next.lastEvent = 'game_won';
  return updateMatchPointState(next);
}

function advanceTieBreak(score: GameScore, scoringTeam: 'A' | 'B'): GameScore {
  const next: GameScore = { ...score, lastEvent: 'point' as const, lastGameWinner: null, lastSetWinner: null };
  if (scoringTeam === 'A') {
    next.tieBreakPointsA += 1;
  } else {
    next.tieBreakPointsB += 1;
  }

  const winnerPoints = scoringTeam === 'A' ? next.tieBreakPointsA : next.tieBreakPointsB;
  const loserPoints = scoringTeam === 'A' ? next.tieBreakPointsB : next.tieBreakPointsA;
  if (winnerPoints >= 7 && winnerPoints - loserPoints >= 2) {
    next.isTieBreak = false;
    next.tieBreakPointsA = 0;
    next.tieBreakPointsB = 0;
    next.prevGamesA = score.gamesA;
    next.prevGamesB = score.gamesB;
    if (scoringTeam === 'A') {
      next.gamesA = 7;
      next.gamesB = 6;
    } else {
      next.gamesA = 6;
      next.gamesB = 7;
    }
    next.lastGameWinner = scoringTeam;
    return winSet(next, scoringTeam);
  }

  return updateMatchPointState(next);
}

function winSet(score: GameScore, winner: 'A' | 'B'): GameScore {
  const next = { ...score };
  const setsKey = winner === 'A' ? 'setsA' : 'setsB';
  next[setsKey] = score[setsKey] + 1;
  next.lastSetWinner = winner;
  next.prevGamesA = score.gamesA;
  next.prevGamesB = score.gamesB;
  next.gamesA = 0;
  next.gamesB = 0;
  next.tieBreakPointsA = 0;
  next.tieBreakPointsB = 0;
  next.isTieBreak = false;
  next.isMatchPoint = false;
  next.matchPointTeam = null;

  if (next[setsKey] >= next.setsRequiredToWin) {
    next.matchOver = true;
    next.winner = winner;
    next.lastEvent = 'match_won';
  } else {
    next.lastEvent = 'set_won';
  }

  return next;
}

function updateMatchPointState(score: GameScore): GameScore {
  if (score.matchOver) {
    return { ...score, isMatchPoint: false, matchPointTeam: null };
  }

  const oneSetFromMatchA = score.setsA === score.setsRequiredToWin - 1;
  const oneSetFromMatchB = score.setsB === score.setsRequiredToWin - 1;
  if (!oneSetFromMatchA && !oneSetFromMatchB) {
    return { ...score, isMatchPoint: false, matchPointTeam: null };
  }

  const isTeamAOnePointAway = isOnePointAwayFromWinningSet(score, 'A');
  const isTeamBOnePointAway = isOnePointAwayFromWinningSet(score, 'B');
  if (isTeamAOnePointAway && !isTeamBOnePointAway) {
    return { ...score, isMatchPoint: true, matchPointTeam: 'A' };
  }
  if (isTeamBOnePointAway && !isTeamAOnePointAway) {
    return { ...score, isMatchPoint: true, matchPointTeam: 'B' };
  }

  return { ...score, isMatchPoint: false, matchPointTeam: null };
}

function isOnePointAwayFromWinningSet(score: GameScore, team: 'A' | 'B'): boolean {
  if (score.isTieBreak) {
    const own = team === 'A' ? score.tieBreakPointsA : score.tieBreakPointsB;
    const opp = team === 'A' ? score.tieBreakPointsB : score.tieBreakPointsA;
    return own >= 6 && own - opp >= 1;
  }

  const ownGames = team === 'A' ? score.gamesA : score.gamesB;
  const oppGames = team === 'A' ? score.gamesB : score.gamesA;

  if (ownGames === 6 && oppGames === 5) return true;

  if (ownGames === 5 && oppGames <= 4) {
    const ownPoints = team === 'A' ? score.teamA : score.teamB;
    const oppPoints = team === 'A' ? score.teamB : score.teamA;
    if (score.deuceMode === 'golden_point') {
      return ownPoints === '40' && oppPoints === '40';
    }
    if (ownPoints === 'Ad') return true;
    return ownPoints === '40' && !['40', 'Ad'].includes(oppPoints);
  }

  return false;
}

function scoringReducer(state: ScoringState, action: ScoringAction): ScoringState {
  switch (action.type) {
    case 'POINT_TEAM_A': {
      if (state.current.matchOver) return state;
      const newScore = advanceGame(state.current, 'A');
      return {
        current: newScore,
        history: [...state.history, state.current],
      };
    }
    case 'POINT_TEAM_B': {
      if (state.current.matchOver) return state;
      const newScore = advanceGame(state.current, 'B');
      return {
        current: newScore,
        history: [...state.history, state.current],
      };
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const newHistory = [...state.history];
      const previous = newHistory.pop()!;
      return {
        current: previous,
        history: newHistory,
      };
    }
    case 'RESET':
      return INITIAL_STATE;
    case 'INIT_MATCH':
      return {
        current: createInitialScore(action.payload),
        history: [],
      };
    default:
      return state;
  }
}

export function usePadelScoring() {
  const [state, dispatch] = useReducer(scoringReducer, INITIAL_STATE);

  const pointTeamA = useCallback(() => dispatch({ type: 'POINT_TEAM_A' }), []);
  const pointTeamB = useCallback(() => dispatch({ type: 'POINT_TEAM_B' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const initMatch = useCallback((config: MatchConfig) => dispatch({ type: 'INIT_MATCH', payload: config }), []);

  return {
    score: state.current,
    canUndo: state.history.length > 0,
    pointTeamA,
    pointTeamB,
    undo,
    reset,
    initMatch,
  };
}

export function formatScore(score: GameScore): string {
  if (score.matchOver) {
    return `Match Over. Team ${score.winner} wins!`;
  }
  return `${score.teamA} - ${score.teamB}`;
}

const HEB_NUMBERS: Record<string, string> = {
  '0': 'אפס',
  '1': 'אחת',
  '2': 'שתיים',
  '3': 'שלוש',
  '4': 'ארבע',
  '5': 'חמש',
  '6': 'שש',
  '7': 'שבע',
  '15': 'חמש עשרה',
  '30': 'שלושים',
  '40': 'ארבעים',
};

function hebNum(n: number | string): string {
  return HEB_NUMBERS[String(n)] || String(n);
}

function hebPoint(p: PadelPoint): string {
  if (p === 'Ad') return 'יתרון';
  return hebNum(p);
}

/** In-rally score line for TTS — server’s points then receiver’s, never player names. */
export function buildPointRallySpeechText(score: GameScore, names?: PlayerNames): string {
  if (score.isTieBreak) {
    return `${hebNum(score.tieBreakPointsA)} ${hebNum(score.tieBreakPointsB)}.`;
  }

  const serverIsA = score.server === 'A';
  const serverPoints = serverIsA ? score.teamA : score.teamB;
  const receiverPoints = serverIsA ? score.teamB : score.teamA;
  const serverTeam: 'A' | 'B' = serverIsA ? 'A' : 'B';
  const receiverTeam: 'A' | 'B' = serverIsA ? 'B' : 'A';

  if (score.isDeuce && score.teamA === '40' && score.teamB === '40') {
    return 'שוויון.';
  }

  if (serverPoints === 'Ad' && names) {
    return `יתרון ל${teamName(names, serverTeam)}.`;
  }
  if (receiverPoints === 'Ad' && names) {
    return `יתרון ל${teamName(names, receiverTeam)}.`;
  }
  if (serverPoints === 'Ad') return 'יתרון לסרבר.';
  if (receiverPoints === 'Ad') return 'יתרון למקבל.';

  const hasHighScore = serverPoints === '40' || receiverPoints === '40';

  if (serverPoints === receiverPoints) {
    if (serverPoints === '0') return 'אפס אפס.';
    return `${hebPoint(serverPoints)} ${hebPoint(receiverPoints)}.`;
  }

  if (hasHighScore && names) {
    const leader = serverPoints === '40' ? serverTeam : receiverTeam;
    return `${hebPoint(serverPoints)} ${hebPoint(receiverPoints)} ל${teamName(names, leader)}.`;
  }

  return `${hebPoint(serverPoints)} ${hebPoint(receiverPoints)}.`;
}

function teamName(names: PlayerNames, team: 'A' | 'B'): string {
  const pair = team === 'A' ? names.teamA : names.teamB;
  return `${pair[0]} ו${pair[1]}`;
}

export function buildSpeechText(score: GameScore, names: PlayerNames): string {
  const serverIsA = score.server === 'A';
  const serverTeam: 'A' | 'B' = serverIsA ? 'A' : 'B';
  const receiverTeam: 'A' | 'B' = serverIsA ? 'B' : 'A';
  const serverLabel = teamName(names, serverTeam);
  const receiverLabel = teamName(names, receiverTeam);

  const serverGames = serverIsA ? score.gamesA : score.gamesB;
  const receiverGames = serverIsA ? score.gamesB : score.gamesA;
  const serverSets = serverIsA ? score.setsA : score.setsB;
  const receiverSets = serverIsA ? score.setsB : score.setsA;

  if (score.lastEvent === 'match_won') {
    const winnerSets = score.winner === 'A' ? score.setsA : score.setsB;
    const loserSets = score.winner === 'A' ? score.setsB : score.setsA;
    const winnerTeam = score.winner === 'A' ? teamName(names, 'A') : teamName(names, 'B');
    return `${hebNum(winnerSets)} ${hebNum(loserSets)} - ניצחון - ${winnerTeam}`;
  }

  if (score.lastEvent === 'set_won') {
    const wGames = score.lastSetWinner === 'A' ? score.prevGamesA : score.prevGamesB;
    const lGames = score.lastSetWinner === 'A' ? score.prevGamesB : score.prevGamesA;
    return `גיים וסט. ${hebNum(wGames)}, ${hebNum(lGames)}. סטים: ${hebNum(serverSets)}, ${hebNum(receiverSets)}. סרבים של.`;
  }

  if (score.lastEvent === 'game_won') {
    return `גיים. ${serverLabel} ${hebNum(serverGames)}, ${receiverLabel} ${hebNum(receiverGames)}. סרבים של ${serverLabel}.`;
  }

  if (score.lastEvent === 'new_game') {
    return 'אפס אפס.';
  }

  if (score.lastEvent === 'point') {
    if (score.isTieBreak && score.tieBreakPointsA === 0 && score.tieBreakPointsB === 0) {
      return `Tie Break! ${buildPointRallySpeechText(score, names)}`;
    }
    if (score.isMatchPoint) {
      return `Matchpoint! ${buildPointRallySpeechText(score, names)}`;
    }
    return buildPointRallySpeechText(score, names);
  }

  return '';
}

/**
 * After crowd cheer for game/set/match end: totals only (no leading "גיים…" — cheer marks the break).
 */
export function buildSpeechTextAfterCrowdCheer(score: GameScore, names: PlayerNames): string {
  const serverIsA = score.server === 'A';
  const serverTeam: 'A' | 'B' = serverIsA ? 'A' : 'B';
  const receiverTeam: 'A' | 'B' = serverIsA ? 'B' : 'A';
  const serverLabel = teamName(names, serverTeam);
  const receiverLabel = teamName(names, receiverTeam);

  const serverGames = serverIsA ? score.gamesA : score.gamesB;
  const receiverGames = serverIsA ? score.gamesB : score.gamesA;
  const serverSets = serverIsA ? score.setsA : score.setsB;
  const receiverSets = serverIsA ? score.setsB : score.setsA;

  if (score.lastEvent === 'match_won') {
    const winnerSets = score.winner === 'A' ? score.setsA : score.setsB;
    const loserSets = score.winner === 'A' ? score.setsB : score.setsA;
    return `${hebNum(winnerSets)}, ${hebNum(loserSets)}.`;
  }

  if (score.lastEvent === 'set_won') {
    const wGames = score.lastSetWinner === 'A' ? score.prevGamesA : score.prevGamesB;
    const lGames = score.lastSetWinner === 'A' ? score.prevGamesB : score.prevGamesA;
    return `${hebNum(wGames)}, ${hebNum(lGames)}. סטים: ${hebNum(serverSets)}, ${hebNum(receiverSets)}. סרבים של.`;
  }

  if (score.lastEvent === 'game_won') {
    return `${serverLabel} ${hebNum(serverGames)}, ${receiverLabel} ${hebNum(receiverGames)}. סרבים של ${serverLabel}.`;
  }

  return '';
}

function pointToClip(p: PadelPoint): ClipId {
  switch (p) {
    case '0':
      return 'efes';
    case '15':
      return 'hamesh_esre';
    case '30':
      return 'shloshim';
    case '40':
      return 'arbaim';
    case 'Ad':
      return 'yitron';
    default:
      return 'efes';
  }
}

/**
 * During a rally (`lastEvent === 'point'`): clips if you later want hybrid again.
 * Live app uses TTS-only for points in {@link buildPointRallySpeechText} so bad .m4a cannot add names.
 */
export function buildPointRallyAnnouncementSteps(score: GameScore, names?: PlayerNames): AnnouncementStep[] {
  const serverIsA = score.server === 'A';
  const serverPoints = serverIsA ? score.teamA : score.teamB;
  const receiverPoints = serverIsA ? score.teamB : score.teamA;
  const serverTeam: 'A' | 'B' = serverIsA ? 'A' : 'B';
  const receiverTeam: 'A' | 'B' = serverIsA ? 'B' : 'A';

  if (score.isDeuce && score.teamA === '40' && score.teamB === '40') {
    return [{ type: 'clip', id: 'dius' }];
  }

  if (serverPoints === 'Ad') {
    const steps: AnnouncementStep[] = [{ type: 'clip', id: 'yitron' }];
    if (names) steps.push({ type: 'tts', text: `ל${teamName(names, serverTeam)}` });
    return steps;
  }
  if (receiverPoints === 'Ad') {
    const steps: AnnouncementStep[] = [{ type: 'clip', id: 'yitron' }];
    if (names) steps.push({ type: 'tts', text: `ל${teamName(names, receiverTeam)}` });
    return steps;
  }

  const hasHighScore = serverPoints === '40' || receiverPoints === '40';

  if (serverPoints === receiverPoints) {
    if (serverPoints === '0') {
      return [{ type: 'clip', id: 'efes' }, { type: 'clip', id: 'efes' }];
    }
    const id = pointToClip(serverPoints);
    return [{ type: 'clip', id }, { type: 'clip', id }];
  }

  const steps: AnnouncementStep[] = [
    { type: 'clip', id: pointToClip(serverPoints) },
    { type: 'clip', id: pointToClip(receiverPoints) },
  ];

  if (hasHighScore && names) {
    const leader = serverPoints === '40' ? serverTeam : receiverTeam;
    steps.push({ type: 'tts', text: `ל${teamName(names, leader)}` });
  }

  return steps;
}

function gameCountToClip(n: number): ClipId {
  switch (n) {
    case 0:
      return 'efes';
    case 1:
      return 'achat';
    case 2:
      return 'shtaim';
    case 3:
      return 'shalosh';
    case 4:
      return 'arba';
    case 5:
      return 'hamesh';
    case 6:
      return 'shesh';
    case 7:
      return 'sheva';
    default:
      return 'efes';
  }
}

/**
 * Hybrid announcement: clips for fixed Hebrew words/numbers, TTS for player names.
 */
export function buildAnnouncementSteps(score: GameScore, names: PlayerNames): AnnouncementStep[] {
  const serverIsA = score.server === 'A';
  const serverTeam: 'A' | 'B' = serverIsA ? 'A' : 'B';
  const receiverTeam: 'A' | 'B' = serverIsA ? 'B' : 'A';
  const serverLabel = teamName(names, serverTeam);
  const receiverLabel = teamName(names, receiverTeam);

  const serverGames = serverIsA ? score.gamesA : score.gamesB;
  const receiverGames = serverIsA ? score.gamesB : score.gamesA;
  const serverSets = serverIsA ? score.setsA : score.setsB;
  const receiverSets = serverIsA ? score.setsB : score.setsA;

  const steps: AnnouncementStep[] = [];

  if (score.lastEvent === 'match_won') {
    const winnerSets = score.winner === 'A' ? score.setsA : score.setsB;
    const loserSets = score.winner === 'A' ? score.setsB : score.setsA;
    steps.push({ type: 'clip', id: 'giim' }, { type: 'clip', id: 'set' }, { type: 'clip', id: 'umatch' });
    steps.push({ type: 'clip', id: gameCountToClip(winnerSets) });
    steps.push({ type: 'clip', id: gameCountToClip(loserSets) });
    return steps;
  }

  if (score.lastEvent === 'set_won') {
    const winnerGames = score.lastSetWinner === 'A' ? score.prevGamesA : score.prevGamesB;
    const loserGames = score.lastSetWinner === 'A' ? score.prevGamesB : score.prevGamesA;

    steps.push({ type: 'clip', id: 'giim' }, { type: 'clip', id: 'set' });
    steps.push({ type: 'clip', id: gameCountToClip(winnerGames) });
    steps.push({ type: 'clip', id: gameCountToClip(loserGames) });
    steps.push({ type: 'clip', id: 'setim' });
    steps.push({ type: 'clip', id: gameCountToClip(serverSets) });
    steps.push({ type: 'clip', id: gameCountToClip(receiverSets) });
    steps.push({ type: 'clip', id: 'servim_shel' });
    return steps;
  }

  if (score.lastEvent === 'game_won') {
    steps.push({ type: 'clip', id: 'giim' });
    steps.push({ type: 'tts', text: serverLabel });
    steps.push({ type: 'clip', id: gameCountToClip(serverGames) });
    steps.push({ type: 'tts', text: receiverLabel });
    steps.push({ type: 'clip', id: gameCountToClip(receiverGames) });
    steps.push({ type: 'clip', id: 'servim_shel' });
    steps.push({ type: 'tts', text: serverLabel });
    return steps;
  }

  if (score.lastEvent === 'new_game') {
    steps.push({ type: 'clip', id: 'efes' }, { type: 'clip', id: 'efes' });
    return steps;
  }

  if (score.lastEvent === 'point') {
    return buildPointRallyAnnouncementSteps(score, names);
  }

  return steps;
}
