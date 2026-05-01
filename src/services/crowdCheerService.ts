import { Audio } from 'expo-av';

let nativeSound: Audio.Sound | null = null;
let audioModeReady = false;

/** Resolves the promise from {@link playCrowdCheer} when playback ends or is stopped. */
let cheerFinishResolver: (() => void) | null = null;
let cheerSafetyTimer: ReturnType<typeof setTimeout> | null = null;

async function ensurePlaybackAudio(): Promise<void> {
  if (audioModeReady) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  audioModeReady = true;
}

function getCheerSource(): number {
  return require('../../assets/audio/crowd_cheer.mp3');
}

function getSetWinVoiceSource(): number {
  return require('../../assets/audio/set_win_stadium_stomp.mp3');
}

function resolveCheerPlayback(): void {
  if (cheerSafetyTimer) {
    clearTimeout(cheerSafetyTimer);
    cheerSafetyTimer = null;
  }
  const r = cheerFinishResolver;
  cheerFinishResolver = null;
  if (r) r();
}

function finishCheerPlayback(sound: Audio.Sound): void {
  sound.unloadAsync().catch(() => {});
  if (nativeSound === sound) nativeSound = null;
  resolveCheerPlayback();
}

const CHEER_MAX_MS = 20_000;

/**
 * Crowd cheer when a game/set/match ends. Resolves when playback finishes or is stopped.
 * Call {@link stopCrowdCheer} to cut short (e.g. new announcement generation).
 */
export function playCrowdCheer(): Promise<void> {
  stopCrowdCheer();

  return new Promise<void>((resolve) => {
    cheerFinishResolver = resolve;

    cheerSafetyTimer = setTimeout(() => {
      cheerSafetyTimer = null;
      resolveCheerPlayback();
    }, CHEER_MAX_MS);

    void (async () => {
      try {
        await ensurePlaybackAudio();
        const { sound } = await Audio.Sound.createAsync(getCheerSource(), {
          shouldPlay: true,
          volume: 0.75,
        });
        nativeSound = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            finishCheerPlayback(sound);
          }
        });
      } catch (e) {
        console.warn('Crowd cheer playback failed', e);
        resolveCheerPlayback();
      }
    })();
  });
}

/**
 * Placeholder for custom set-win audio. Currently plays the provided stadium stomp clip.
 */
export function playSetWinVoice(): Promise<void> {
  stopCrowdCheer();

  return new Promise<void>((resolve) => {
    cheerFinishResolver = resolve;

    cheerSafetyTimer = setTimeout(() => {
      cheerSafetyTimer = null;
      resolveCheerPlayback();
    }, CHEER_MAX_MS);

    void (async () => {
      try {
        await ensurePlaybackAudio();
        const { sound } = await Audio.Sound.createAsync(getSetWinVoiceSource(), {
          shouldPlay: true,
          volume: 0.9,
        });
        nativeSound = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            finishCheerPlayback(sound);
          }
        });
      } catch (e) {
        console.warn('Set win voice playback failed', e);
        resolveCheerPlayback();
      }
    })();
  });
}

export function stopCrowdCheer(): void {
  const s = nativeSound;
  nativeSound = null;
  if (s) {
    try {
      s.setOnPlaybackStatusUpdate(null);
      s.stopAsync().catch(() => {});
      s.unloadAsync().catch(() => {});
    } catch {
      /* ignore */
    }
  }
  resolveCheerPlayback();
}
