import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Platform,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { usePadelScoring } from './src/hooks/usePadelScoring';
import { ScoreDisplay } from './src/components/ScoreDisplay';
import { SimulationPanel } from './src/components/SimulationPanel';
import { ConnectionStatus } from './src/components/StatusBar';
import { NameEntry } from './src/components/NameEntry';
import { BrandHeader } from './src/components/BrandHeader';
import { GlobalTapScoreLayer } from './src/components/GlobalTapScoreLayer';
import { announceScore, warmUpNameVoice } from './src/services/speechService';
import { initBLE, isConnected } from './src/services/bleService';
import { initWatch, sendScoreToWatch } from './src/services/watchService';
import { GameScore, PlayerNames, MatchConfig } from './src/types/scoring';

export default function App() {
  const { score, canUndo, pointTeamA, pointTeamB, undo, reset, initMatch } = usePadelScoring();
  const [bleConnected, setBleConnected] = useState(false);
  const [playerNames, setPlayerNames] = useState<PlayerNames | null>(null);
  const prevScoreRef = useRef<GameScore | null>(null);

  const handleBLEAction = useCallback((action: 'teamA' | 'teamB' | 'undo') => {
    switch (action) {
      case 'teamA': pointTeamA(); break;
      case 'teamB': pointTeamB(); break;
      case 'undo': undo(); break;
    }
  }, [pointTeamA, pointTeamB, undo]);

  useEffect(() => {
    warmUpNameVoice().catch(() => {});
  }, []);

  useEffect(() => {
    const cleanupBLE = initBLE(handleBLEAction);
    const cleanupWatch = initWatch(handleBLEAction);

    const bleCheck = setInterval(() => {
      setBleConnected(isConnected());
    }, 2000);

    return () => {
      cleanupBLE();
      cleanupWatch();
      clearInterval(bleCheck);
    };
  }, [handleBLEAction]);

  useEffect(() => {
    if (!playerNames) return;

    const prev = prevScoreRef.current;
    const scoreChanged = !prev ||
      prev.teamA !== score.teamA ||
      prev.teamB !== score.teamB ||
      prev.gamesA !== score.gamesA ||
      prev.gamesB !== score.gamesB ||
      prev.setsA !== score.setsA ||
      prev.setsB !== score.setsB ||
      prev.matchOver !== score.matchOver ||
      prev.lastEvent !== score.lastEvent;

    if (scoreChanged) {
      announceScore(score, playerNames);
      sendScoreToWatch(score);
    }

    prevScoreRef.current = score;
  }, [score, playerNames]);

  const handleNewMatch = useCallback(() => {
    reset();
    setPlayerNames(null);
    prevScoreRef.current = null;
  }, [reset]);

  const handleMatchStart = useCallback(
    (names: PlayerNames, config: MatchConfig) => {
      initMatch(config);
      setPlayerNames(names);
    },
    [initMatch]
  );

  if (!playerNames) {
    return (
      <View style={styles.nameEntryRoot}>
        <StatusBar style="light" />
        <NameEntry onStart={handleMatchStart} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <GlobalTapScoreLayer
        onTeamA={pointTeamA}
        onTeamB={pointTeamB}
        onUndo={undo}
        canUndo={canUndo}
        style={styles.tapLayer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <BrandHeader size="compact" />
          </View>

          <ConnectionStatus score={score} bleConnected={bleConnected} names={playerNames} />

          <View style={styles.scoreContainer}>
            <ScoreDisplay score={score} names={playerNames} />
          </View>

          <SimulationPanel
            onTeamA={pointTeamA}
            onTeamB={pointTeamB}
            onUndo={undo}
            onReset={handleNewMatch}
            canUndo={canUndo}
            names={playerNames}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Tap anywhere: 1× Team A · 2× Team B · hold 3s Undo · buttons still work
            </Text>
          </View>
        </ScrollView>
      </GlobalTapScoreLayer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nameEntryRoot: {
    flex: 1,
    backgroundColor: '#060d18',
    ...(Platform.OS === 'web'
    ? ({ minHeight: '100vh' } as unknown as ViewStyle)
    : {}),
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#060d18',
  },
  tapLayer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 10,
  },
  scoreContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#2a4a6c',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
