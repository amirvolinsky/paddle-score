import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import { getStaticHebrewScoreAssetModule } from './hebrewScoreStaticCache';

const MODEL_ID = 'eleven_v3';

const isWeb = typeof document !== 'undefined';

let currentWebAudio: HTMLAudioElement | null = null;
let currentNativeSound: {
  stopAsync: () => Promise<unknown>;
  unloadAsync: () => Promise<unknown>;
  setOnPlaybackStatusUpdate: (callback: ((status: unknown) => void) | null) => void;
} | null = null;
let fetchAbort: AbortController | null = null;

/**
 * Web: `Constants.expoConfig.extra` often omits dynamic `app.config.js` fields (manifest is `APP_MANIFEST`).
 * Metro inlines `EXPO_PUBLIC_*` from `.env` into the bundle — use those as fallback.
 */
function getElevenLabsCredentials(): { apiKey: string; voiceId: string } {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
  const apiKey = (
    extra.elevenLabsApiKey ??
    process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ??
    ''
  ).trim();
  const voiceId = (
    extra.elevenLabsVoiceId ??
    process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID ??
    ''
  ).trim();
  return { apiKey, voiceId };
}

export function isElevenLabsConfigured(): boolean {
  const { apiKey, voiceId } = getElevenLabsCredentials();
  return Boolean(apiKey && voiceId);
}

export function stopElevenLabsPlayback(): void {
  fetchAbort?.abort();
  fetchAbort = null;

  const nativeSound = currentNativeSound;
  currentNativeSound = null;
  if (nativeSound) {
    try {
      nativeSound.setOnPlaybackStatusUpdate(null);
      nativeSound.stopAsync().catch(() => {});
      nativeSound.unloadAsync().catch(() => {});
    } catch {
      /* ignore */
    }
  }

  if (currentWebAudio) {
    const src = currentWebAudio.src;
    currentWebAudio.pause();
    currentWebAudio.removeAttribute('src');
    currentWebAudio = null;
    if (src.startsWith('blob:')) URL.revokeObjectURL(src);
  }
}

function playBlobAudio(blob: Blob, shouldContinue?: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentWebAudio = audio;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      if (currentWebAudio === audio) currentWebAudio = null;
      audio.pause();
      URL.revokeObjectURL(url);
      resolve();
    };

    const safety = setTimeout(finish, 60_000);

    audio.addEventListener('ended', () => finish());
    audio.addEventListener('error', () => finish());

    if (shouldContinue && !shouldContinue()) { finish(); return; }

    audio.play().catch(() => finish());
  });
}

async function playNativeAudio(arrayBuffer: ArrayBuffer, shouldContinue?: () => boolean): Promise<void> {
  const { Audio: ExpoAudio } = await import('expo-av');
  const FileSystem = await import('expo-file-system/legacy');

  await ExpoAudio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const bytes = new Uint8Array(arrayBuffer);
  const chunk = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  const base64 = btoa(binary);

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) throw new Error('FileSystem.cacheDirectory unavailable');

  const path = `${cacheDir}el-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (shouldContinue && !shouldContinue()) {
    await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
    return;
  }

  const { sound } = await ExpoAudio.Sound.createAsync({ uri: path }, { shouldPlay: false });
  currentNativeSound = sound;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      if (currentNativeSound === sound) currentNativeSound = null;
      sound.setOnPlaybackStatusUpdate(null);
      sound.unloadAsync().catch(() => {});
      FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
      resolve();
    };

    const safety = setTimeout(finish, 60_000);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (shouldContinue && !shouldContinue()) {
        sound.stopAsync().catch(() => finish());
        return;
      }
      if (status.isLoaded && status.didJustFinish) {
        finish();
      }
    });

    sound.playAsync().catch(() => finish());
  });
}

async function playNativeModuleAudio(moduleId: number, shouldContinue?: () => boolean): Promise<void> {
  const { Audio: ExpoAudio } = await import('expo-av');

  await ExpoAudio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  if (shouldContinue && !shouldContinue()) return;
  const { sound } = await ExpoAudio.Sound.createAsync(moduleId, { shouldPlay: false });
  currentNativeSound = sound;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(safety);
      if (currentNativeSound === sound) currentNativeSound = null;
      sound.setOnPlaybackStatusUpdate(null);
      sound.unloadAsync().catch(() => {});
      resolve();
    };

    const safety = setTimeout(finish, 60_000);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (shouldContinue && !shouldContinue()) {
        sound.stopAsync().catch(() => finish());
        return;
      }
      if (status.isLoaded && status.didJustFinish) {
        finish();
      }
    });

    sound.playAsync().catch(() => finish());
  });
}

async function playStaticHebrewScoreAudio(
  text: string,
  shouldContinue?: () => boolean
): Promise<boolean> {
  const moduleId = getStaticHebrewScoreAssetModule(text);
  if (moduleId === null) return false;

  stopElevenLabsPlayback();

  if (shouldContinue && !shouldContinue()) return true;

  if (isWeb) {
    const asset = Asset.fromModule(moduleId);
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;
    if (!uri) return false;

    const audio = new Audio(uri);
    currentWebAudio = audio;

    await new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(safety);
        if (currentWebAudio === audio) currentWebAudio = null;
        audio.pause();
        resolve();
      };

      const safety = setTimeout(finish, 60_000);

      audio.addEventListener('ended', finish);
      audio.addEventListener('error', finish);

      if (shouldContinue && !shouldContinue()) {
        finish();
        return;
      }

      audio.play().catch(() => finish());
    });
  } else {
    await playNativeModuleAudio(moduleId, shouldContinue);
  }

  return true;
}

export async function speakElevenLabsText(
  text: string,
  shouldContinue?: () => boolean
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  if (await playStaticHebrewScoreAudio(trimmed, shouldContinue)) {
    return;
  }

  const { apiKey, voiceId } = getElevenLabsCredentials();
  if (!apiKey || !voiceId) return;

  stopElevenLabsPlayback();
  fetchAbort = new AbortController();
  const signal = fetchAbort.signal;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      signal,
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: MODEL_ID,
      }),
    });
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return;
    throw e;
  }

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`ElevenLabs ${response.status}: ${errBody.slice(0, 200)}`);
  }

  if (shouldContinue && !shouldContinue()) return;

  if (isWeb) {
    const blob = await response.blob();
    if (shouldContinue && !shouldContinue()) return;
    await playBlobAudio(blob, shouldContinue);
  } else {
    const arrayBuffer = await response.arrayBuffer();
    if (shouldContinue && !shouldContinue()) return;
    await playNativeAudio(arrayBuffer, shouldContinue);
  }

  fetchAbort = null;
}
