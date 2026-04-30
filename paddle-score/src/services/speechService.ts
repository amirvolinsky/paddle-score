import * as Speech from 'expo-speech';
import { GameScore, PlayerNames } from '../types/scoring';
import { buildSpeechText, buildSpeechTextAfterCrowdCheer } from '../hooks/usePadelScoring';
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
  if (isElevenLabsConfigured()) return;
  await ensureHebrewMaleVoiceId();
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
 * Future: reduce ElevenLabs usage by playing bundled/pre-generated clips for repeated number phrases,
 * reserving the API only for lines with player names. Until then, all announcements use ElevenLabs when configured.
 */
/** Game/set/match end: crowd cheer first, then TTS totals only (see {@link buildSpeechTextAfterCrowdCheer}). */
const CHEER_BEFORE_SPEECH_EVENTS = new Set(['game_won', 'set_won', 'match_won']);

export async function announceScore(score: GameScore, names: PlayerNames): Promise<void> {
  const myGen = ++announceGeneration;
  Speech.stop();
  stopElevenLabsPlayback();
  stopCrowdCheer();

  isSpeaking = true;

  try {
    const cheerFirst = CHEER_BEFORE_SPEECH_EVENTS.has(score.lastEvent);

    if (cheerFirst) {
      await playCrowdCheer();
      if (myGen !== announceGeneration) return;
    }

    const text = (
      cheerFirst ? buildSpeechTextAfterCrowdCheer(score, names) : buildSpeechText(score, names)
    ).trim();
    if (!text) return;
    if (myGen !== announceGeneration) return;

    if (isElevenLabsConfigured()) {
      try {
        await speakElevenLabsText(text, () => myGen === announceGeneration);
        return;
      } catch (e) {
        console.warn('ElevenLabs failed, falling back to system TTS', e);
      }
    }

    if (myGen !== announceGeneration) return;
    await speakSystemTts(text, myGen);
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
