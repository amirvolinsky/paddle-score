import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

/** Delay before single tap commits (allows double tap to cancel). */
const SINGLE_TAP_DELAY_MS = 320;
/** Two releases closer than this count as double tap → Team B. */
const DOUBLE_TAP_MAX_GAP_MS = 350;
/** After holding this long, release does not count as a tap (covers undo hold & non-undo long press). */
const LONG_HOLD_IGNORE_TAP_MS = 2800;
const UNDO_LONG_PRESS_MS = 3000;

interface Props {
  children: React.ReactNode;
  onTeamA: () => void;
  onTeamB: () => void;
  onUndo: () => void;
  canUndo: boolean;
  style?: ViewStyle;
}

/**
 * Full-area tap routing for external click devices:
 * - Single tap → Team A (after delay so double tap can override)
 * - Double tap (two releases within window) → Team B
 * - Long press 3s → Undo (when allowed)
 *
 * Inner Touchables (simulation buttons, etc.) still receive touches first on their regions.
 */
export function GlobalTapScoreLayer({
  children,
  onTeamA,
  onTeamB,
  onUndo,
  canUndo,
  style,
}: Props) {
  const pendingSingleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstReleaseAtRef = useRef<number>(0);
  const longUndoFiredRef = useRef(false);
  const pressStartedAtRef = useRef<number>(0);

  const clearPendingSingle = useCallback(() => {
    if (pendingSingleRef.current) {
      clearTimeout(pendingSingleRef.current);
      pendingSingleRef.current = null;
    }
  }, []);

  useEffect(() => () => clearPendingSingle(), [clearPendingSingle]);

  const handlePressIn = useCallback(() => {
    longUndoFiredRef.current = false;
    pressStartedAtRef.current = Date.now();
  }, []);

  const handleLongPress = useCallback(() => {
    if (!canUndo) return;
    longUndoFiredRef.current = true;
    clearPendingSingle();
    firstReleaseAtRef.current = 0;
    onUndo();
  }, [canUndo, onUndo, clearPendingSingle]);

  const handlePressOut = useCallback(() => {
    if (longUndoFiredRef.current) {
      longUndoFiredRef.current = false;
      return;
    }

    const duration = Date.now() - pressStartedAtRef.current;
    if (duration >= LONG_HOLD_IGNORE_TAP_MS) {
      return;
    }

    const now = Date.now();
    const prevFirst = firstReleaseAtRef.current;

    if (prevFirst > 0 && now - prevFirst < DOUBLE_TAP_MAX_GAP_MS) {
      clearPendingSingle();
      firstReleaseAtRef.current = 0;
      onTeamB();
      return;
    }

    firstReleaseAtRef.current = now;
    clearPendingSingle();
    pendingSingleRef.current = setTimeout(() => {
      pendingSingleRef.current = null;
      firstReleaseAtRef.current = 0;
      onTeamA();
    }, SINGLE_TAP_DELAY_MS);
  }, [onTeamA, onTeamB, clearPendingSingle]);

  return (
    <Pressable
      style={[styles.fill, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={UNDO_LONG_PRESS_MS}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
