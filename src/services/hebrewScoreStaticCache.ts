import rawPhrases from '../data/hebrewScoreStaticPhrases.json';
import { HEBREW_SCORE_STATIC_AUDIO } from './generated/hebrewScoreStaticAudioManifest';

type PhraseEntry = {
  id: string;
  text: string;
  slug: string;
};

const phrases = rawPhrases as PhraseEntry[];

const textToSlug = new Map<string, string>();
for (const entry of phrases) {
  const key = entry.text.trim();
  if (!key || textToSlug.has(key)) continue;
  textToSlug.set(key, entry.slug);
}

export const HEBREW_SCORE_ONLY_TEXTS = [...textToSlug.keys()];

export function getStaticHebrewScoreAssetModule(text: string): number | null {
  const key = text.trim();
  if (!key) return null;
  return HEBREW_SCORE_STATIC_AUDIO[key] ?? null;
}

export function isStaticHebrewScoreText(text: string): boolean {
  return getStaticHebrewScoreAssetModule(text) !== null;
}
