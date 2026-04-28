import { Audio } from 'expo-av';
import type { ClipId } from '../types/announcement';
import { ALL_CLIP_IDS } from '../types/announcement';

/** Metro static requires for each clip (must match assets/audio/*.m4a) */
const CLIP_SOURCES: Record<ClipId, number> = {
  efes: require('../../assets/audio/efes.m4a'),
  hamesh_esre: require('../../assets/audio/hamesh_esre.m4a'),
  shloshim: require('../../assets/audio/shloshim.m4a'),
  arbaim: require('../../assets/audio/arbaim.m4a'),
  achat: require('../../assets/audio/achat.m4a'),
  shtaim: require('../../assets/audio/shtaim.m4a'),
  shalosh: require('../../assets/audio/shalosh.m4a'),
  arba: require('../../assets/audio/arba.m4a'),
  hamesh: require('../../assets/audio/hamesh.m4a'),
  shesh: require('../../assets/audio/shesh.m4a'),
  sheva: require('../../assets/audio/sheva.m4a'),
  dius: require('../../assets/audio/dius.m4a'),
  yitron: require('../../assets/audio/yitron.m4a'),
  giim: require('../../assets/audio/giim.m4a'),
  set: require('../../assets/audio/set.m4a'),
  umatch: require('../../assets/audio/umatch.m4a'),
  lekol: require('../../assets/audio/lekol.m4a'),
  le: require('../../assets/audio/le.m4a'),
  servim_shel: require('../../assets/audio/servim_shel.m4a'),
  setim: require('../../assets/audio/setim.m4a'),
};

const GAP_MS = 0;

const soundCache = new Map<ClipId, Audio.Sound>();
let audioModeConfigured = false;
let preloadPromise: Promise<void> | null = null;

async function ensureAudioMode(): Promise<void> {
  if (audioModeConfigured) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  audioModeConfigured = true;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function getOrLoadSound(id: ClipId): Promise<Audio.Sound> {
  const existing = soundCache.get(id);
  if (existing) return existing;
  await ensureAudioMode();
  const { sound } = await Audio.Sound.createAsync(CLIP_SOURCES[id], { shouldPlay: false });
  soundCache.set(id, sound);
  return sound;
}

/**
 * Preload all announcement clips (call once on app startup).
 */
export async function preloadAudioClips(): Promise<void> {
  if (preloadPromise) return preloadPromise;
  preloadPromise = (async () => {
    await ensureAudioMode();
    await Promise.all(ALL_CLIP_IDS.map((id) => getOrLoadSound(id)));
  })();
  return preloadPromise;
}

export async function stopAllClips(): Promise<void> {
  await Promise.all(
    ALL_CLIP_IDS.map(async (id) => {
      const s = soundCache.get(id);
      if (!s) return;
      try {
        await s.stopAsync();
        await s.setPositionAsync(0);
      } catch {
        /* ignore */
      }
    })
  );
}

/**
 * @param shouldContinue If provided and returns false, playback stops immediately (newer announce took over).
 */
export async function playClip(id: ClipId, shouldContinue?: () => boolean): Promise<void> {
  if (shouldContinue && !shouldContinue()) return;

  const sound = await getOrLoadSound(id);
  try {
    if (shouldContinue && !shouldContinue()) return;

    await sound.setPositionAsync(0);
    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(safety);
        sound.setOnPlaybackStatusUpdate(null);
        resolve();
      };
      const safety = setTimeout(done, 15_000);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (shouldContinue && !shouldContinue()) {
          sound.stopAsync().catch(() => {});
          done();
          return;
        }
        if (status.isLoaded && status.didJustFinish) {
          done();
        }
      });
      sound.playAsync().catch(() => done());
    });
  } catch (e) {
    console.warn('playClip failed', id, e);
  }
}

export async function playClipSequence(ids: ClipId[]): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await playClip(ids[i]);
    if (i < ids.length - 1) await sleep(GAP_MS);
  }
}

export async function unloadAudioClips(): Promise<void> {
  await Promise.all(
    ALL_CLIP_IDS.map(async (id) => {
      const s = soundCache.get(id);
      if (s) {
        try {
          await s.unloadAsync();
        } catch {
          /* ignore */
        }
        soundCache.delete(id);
      }
    })
  );
  preloadPromise = null;
}
