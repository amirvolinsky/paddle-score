const fs = require('fs');
const path = require('path');
const { loadProjectEnv } = require('@expo/env');

// Load `.env` / `.env.local` before reading keys (see `.env.example`; `.env` is gitignored).
loadProjectEnv(__dirname, {
  mode: process.env.NODE_ENV || 'development',
  silent: true,
});

const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'app.json'), 'utf8'));

/** @returns {import('@expo/config').ExpoConfig} */
module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      elevenLabsApiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY ?? '',
      elevenLabsVoiceId: process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID ?? '',
    },
  },
});
