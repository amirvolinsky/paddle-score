import * as Speech from 'expo-speech';
import { GameScore, PlayerNames } from '../types/scoring';
import { buildSpeechText } from '../hooks/usePadelScoring';
import {
  isElevenLabsConfigured,
  speakElevenLabsText,
  stopElevenLabsPlayback,
} from './elevenLabsService';
import { playCrowdCheer, stopCrowdCheer } from './crowdCheerService';

let isSpeaking = false;
let announceGeneration = 0;

const TTS_NAME_PITCH_FALLBACK = 0.88;

let nameVoiceReady = false;
let nameVoiceId: string | undefined;
let nameVoicePickPromise: Promise<string | undefined> | null = null;

async function ensureHebrewMaleVoiceId(): Promise<string | undefined> {
  if (nameVoiceReady) return nameVoiceId;
  if (!nameVoicePickPromise) {
    nameVoicePickPromise = (async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const lang = (v: { language?: string }) => (v.language || '').toLowerCase();
        const he = voices.filter(
          (v) =>
            lang(v).startsWith('he') ||
            lang(v).includes('he-il') ||
            lang(v).includes('he_il') ||
            lang(v) === 'iw'
        );

        const blob = (v: { name?: string; identifier?: string }) =>
          `${v.name || ''} ${v.identifier || ''}`.toLowerCase();

        const maleHints =
          /male|masc|זכר|גבר|man\b|eitan|איתן|asaf|אסף|ido|עידו|omer|עומר|guy|גיא|daniel|david|דוד|zeev|זאב|jonathan|aaron|אהרן|noam|נועם|yaron|ירון|barak|ברק|he-il-x-hed|hed\b/i;

        const explicitMale = he.find((v) => maleHints.test(blob(v)));
        if (explicitMale) {
          nameVoiceId = explicitMale.identifier;
          return nameVoiceId;
        }

        const femaleHints =
          /carmit|קארמיט|female|נקבה|samantha|victoria|karen|zira|sandy|michal|מיכל|shira|שירה|iris/i;
        const notFemale = he.filter((v) => !femaleHints.test(blob(v)));
        if (notFemale.length) {
          nameVoiceId = notFemale[0].identifier;
          return nameVoiceId;
        }

        if (he.length) {
          nameVoiceId = he[0].identifier;
          return nameVoiceId;
        }
      } catch {
        /* getVoices unavailable on some builds */
      }
      nameVoiceId = undefined;
      return nameVoiceId;
    })().finally(() => {
      nameVoiceReady = true;
      nameVoicePickPromise = null;
    });
  }
  return nameVoicePickPromise;
}

export async function warmUpNameVoice(): Promise<void> {
  /** Warm device Hebrew voice even when ElevenLabs is on — hybrid routing uses Speech for number-only lines. */
  await ensureHebrewMaleVoiceId();
}

/**
 * Use ElevenLabs only when the line includes player names or other copy that benefits from the custom voice.
 * Pure score numbers (15–30, שוויון, set/match tally without names) use device TTS to save API characters.
 */
export function shouldUseElevenLabsForAnnouncement(score: GameScore, names: PlayerNames): boolean {
  switch (score.lastEvent) {
    case 'game_won':
      return true;
    case 'match_won':
    case 'set_won':
      return false;
    case 'new_game':
      return false;
    case 'point':
      return pointAnnouncementUsesPlayerNames(score);
    default:
      return false;
  }
}

function pointAnnouncementUsesPlayerNames(score: GameScore): boolean {
  const serverIsA = score.server === 'A';
  const serverPoints = serverIsA ? score.teamA : score.teamB;
  const receiverPoints = serverIsA ? score.teamB : score.teamA;

  if (score.isDeuce && score.teamA === '40' && score.teamB === '40') {
    return false;
  }

  if (serverPoints === 'Ad' || receiverPoints === 'Ad') {
    return true;
  }

  const hasHighScore = serverPoints === '40' || receiverPoints === '40';
  return hasHighScore && serverPoints !== receiverPoints;
}

async function speakSystemTts(text: string, myGen: number): Promise<void> {
  const voice = await ensureHebrewMaleVoiceId();
  if (myGen !== announceGeneration) return;
  await new Promise<void>((resolve) => {
    Speech.speak(text, {
      language: 'he-IL',
      ...(voice ? { voice } : {}),
      pitch: voice ? 1.0 : TTS_NAME_PITCH_FALLBACK,
      rate: 0.78,
      onDone: () => resolve(),
      onError: () => resolve(),
    });
  });
}

/**
 * Crowd after any score that ends a game. Events are mutually exclusive per point (you never get
 * `game_won` and `set_won` together). Matches user request: one cheer per game conclusion, not stacked.
 */
const CHEER_AFTER_GAME_EVENTS = new Set(['game_won', 'set_won', 'match_won']);

export async function announceScore(score: GameScore, names: PlayerNames): Promise<void> {
  const myGen = ++announceGeneration;
  Speech.stop();
  stopElevenLabsPlayback();
  stopCrowdCheer();

  isSpeaking = true;

  try {
    const text = buildSpeechText(score, names).trim();
    if (!text) return;
    if (myGen !== announceGeneration) return;

    if (isElevenLabsConfigured()) {
      try {
        const useEleven = shouldUseElevenLabsForAnnouncement(score, names);
        if (useEleven) {
          await speakElevenLabsText(text, () => myGen === announceGeneration);
        } else {
          await speakSystemTts(text, myGen);
        }
        if (myGen === announceGeneration && CHEER_AFTER_GAME_EVENTS.has(score.lastEvent)) {
          playCrowdCheer();
        }
        return;
      } catch (e) {
        console.warn('ElevenLabs failed, falling back to system TTS', e);
      }
    }

    if (myGen !== announceGeneration) return;
    await speakSystemTts(text, myGen);

    if (myGen === announceGeneration && CHEER_AFTER_GAME_EVENTS.has(score.lastEvent)) {
      playCrowdCheer();
    }
  } finally {
    if (myGen === announceGeneration) {
      isSpeaking = false;
    }
  }
}

export function stopSpeaking(): void {
  announceGeneration++;
  Speech.stop();
  stopElevenLabsPlayback();
  stopCrowdCheer();
  isSpeaking = false;
}
