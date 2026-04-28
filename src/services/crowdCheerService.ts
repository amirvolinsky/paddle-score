import { Audio } from 'expo-av';

let nativeSound: Audio.Sound | null = null;
let audioModeReady = false;

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

/**
 * Crowd cheer after a game ends. Uses expo-av on web + native so bundled MP3 resolves correctly
 * (plain `new Audio(require(...))` breaks on web when require returns a module id).
 */
export function playCrowdCheer(): void {
  stopCrowdCheer();

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
          sound.unloadAsync().catch(() => {});
          if (nativeSound === sound) nativeSound = null;
        }
      });
    } catch (e) {
      console.warn('Crowd cheer playback failed', e);
    }
  })();
}

export function stopCrowdCheer(): void {
  const s = nativeSound;
  nativeSound = null;
  if (!s) return;
  try {
    s.setOnPlaybackStatusUpdate(null);
    s.stopAsync().catch(() => {});
    s.unloadAsync().catch(() => {});
  } catch {
    /* ignore */
  }
}
