# Padel Scorekeeper

A React Native / Expo POC for tracking Padel match scores — with voice announcements, BLE button input, and Apple Watch integration. **No Xcode required** — uses EAS Cloud Builds.

## Features

- **Full Padel Scoring**: 0 → 15 → 30 → 40 → Deuce → Advantage → Game → Set → Match
- **Voice Announcements**: iPhone speaks the score after every point (works in background)
- **BLE Button Support**: 1 click = Team A, 2 clicks = Team B, Long press = Undo
- **Apple Watch App**: SwiftUI companion app with live score display + scoring buttons
- **Simulation Mode**: Test all logic without hardware — 3 buttons on the main screen
- **Undo/History**: Full state history stack — undo any point with one tap
- **High-Contrast Dark UI**: Designed for bright outdoor (Israeli sun) visibility

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo dev server (logic testing in Expo Go)
npx expo start

# Login to EAS (one-time)
npx eas login

# Build for iOS (cloud build, no Xcode needed)
eas build --platform ios --profile development
```

## Static Hebrew Score Audio Cache

Score-only Hebrew phrases can be pre-generated once and served locally, while name-containing lines still use live ElevenLabs.

1. Copy `.env.example` to `.env` and set:
   - `EXPO_PUBLIC_ELEVENLABS_API_KEY`
   - `EXPO_PUBLIC_ELEVENLABS_VOICE_ID`
2. Generate static files + manifest:

```bash
npm run audio:generate:hebrew-scores
```

This writes MP3 files to `assets/audio/static-hebrew-scores/` and updates `src/services/generated/hebrewScoreStaticAudioManifest.ts`.

### Validation checklist

- Score-only calls such as `אפס אפס.` and `שוויון.` play from local files (no ElevenLabs request).
- Name phrases (for example `... ל<teamName>.`) still use ElevenLabs.
- If ElevenLabs fails for non-cached lines, system TTS fallback still speaks.

## Project Structure

```
paddle-score/
├── App.tsx                      # Main app entry point
├── src/
│   ├── hooks/
│   │   └── usePadelScoring.ts   # Scoring reducer + history stack
│   ├── components/
│   │   ├── ScoreDisplay.tsx      # Score UI (sets, games, points)
│   │   ├── SimulationPanel.tsx   # Sim buttons (Team A, Team B, Undo, Reset)
│   │   └── StatusBar.tsx         # BLE/Speech connection status
│   ├── services/
│   │   ├── speechService.ts      # expo-speech voice announcements
│   │   ├── bleService.ts         # BLE button manager
│   │   └── watchService.ts       # Apple Watch connectivity
│   └── types/
│       └── scoring.ts            # TypeScript interfaces
├── plugins/
│   └── withWatchApp.js           # Expo Config Plugin — adds WatchOS target
├── watch-app/                    # Reference SwiftUI source files
│   ├── PadelWatchApp.swift
│   └── ContentView.swift
├── app.json                      # Expo config (permissions, background modes)
└── eas.json                      # EAS Build profiles
```

## Before Your First Build

1. **Create an Expo account** at [expo.dev](https://expo.dev)
2. Run `npx eas login` in the terminal
3. Run `eas build:configure` to link your project
4. Update `app.json` → `extra.eas.projectId` with your project ID
5. Run `eas build --platform ios --profile development`

## Scoring Rules (Padel)

| Points | Display |
|--------|---------|
| 0      | Love    |
| 1      | 15      |
| 2      | 30      |
| 3      | 40      |
| Both at 40 | Deuce |
| Win from Deuce | Advantage |
| Win from Advantage | Game |
| 6 games (2-game lead) | Set |
| 2 sets | Match |

## BLE Button Protocol

| Input | Action |
|-------|--------|
| 1 Click | Point for Team A |
| 2 Clicks (within 400ms) | Point for Team B |
| Long Press (>800ms) | Undo last point |
