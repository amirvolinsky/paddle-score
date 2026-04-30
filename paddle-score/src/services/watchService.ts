import { Platform } from 'react-native';
import { GameScore } from '../types/scoring';
import { formatScore } from '../hooks/usePadelScoring';

type WatchCallback = (action: 'teamA' | 'teamB' | 'undo') => void;

let watchConnectivity: any = null;
let messageSubscription: any = null;

function getWatchConnectivity() {
  if (!watchConnectivity && Platform.OS === 'ios') {
    try {
      watchConnectivity = require('react-native-watch-connectivity');
    } catch {
      console.warn('Watch connectivity not available');
    }
  }
  return watchConnectivity;
}

export function initWatch(callback: WatchCallback): () => void {
  const wc = getWatchConnectivity();
  if (!wc) {
    console.log('Watch connectivity not available');
    return () => {};
  }

  messageSubscription = wc.watchEvents.addListener('message', (message: any) => {
    if (message?.action === 'pointA') {
      callback('teamA');
    } else if (message?.action === 'pointB') {
      callback('teamB');
    } else if (message?.action === 'undo') {
      callback('undo');
    }
  });

  return () => {
    messageSubscription?.remove();
    messageSubscription = null;
  };
}

export function sendScoreToWatch(score: GameScore): void {
  const wc = getWatchConnectivity();
  if (!wc) return;

  try {
    wc.updateApplicationContext({
      teamA: score.teamA,
      teamB: score.teamB,
      gamesA: score.gamesA,
      gamesB: score.gamesB,
      setsA: score.setsA,
      setsB: score.setsB,
      displayScore: formatScore(score),
      matchOver: score.matchOver,
      winner: score.winner || '',
    });
  } catch (err) {
    console.warn('Failed to send score to watch:', err);
  }
}
