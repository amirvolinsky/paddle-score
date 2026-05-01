import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

/** If second tap arrives in this forgiving window, convert to Team B. */
const DOUBLE_TAP_MAX_GAP_MS = 1500;
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
  const pendingTeamAForDoubleRef = useRef(false);
  const firstTapAtRef = useRef<number>(0);
  const doubleTapWindowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longUndoFiredRef = useRef(false);
  const pressStartedAtRef = useRef<number>(0);

  const clearDoubleTapWindow = useCallback(() => {
    if (doubleTapWindowTimerRef.current) {
      clearTimeout(doubleTapWindowTimerRef.current);
      doubleTapWindowTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearDoubleTapWindow(), [clearDoubleTapWindow]);

  const handlePressIn = useCallback(() => {
    longUndoFiredRef.current = false;
    pressStartedAtRef.current = Date.now();
  }, []);

  const handleLongPress = useCallback(() => {
    if (!canUndo) return;
    longUndoFiredRef.current = true;
    clearDoubleTapWindow();
    pendingTeamAForDoubleRef.current = false;
    firstTapAtRef.current = 0;
    onUndo();
  }, [canUndo, onUndo, clearDoubleTapWindow]);

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
    const prevFirstTap = firstTapAtRef.current;

    if (pendingTeamAForDoubleRef.current && prevFirstTap > 0 && now - prevFirstTap <= DOUBLE_TAP_MAX_GAP_MS) {
      clearDoubleTapWindow();
      pendingTeamAForDoubleRef.current = false;
      firstTapAtRef.current = 0;
      // First tap already awarded Team A instantly; undo it and apply Team B.
      onUndo();
      onTeamB();
      return;
    }

    onTeamA();
    pendingTeamAForDoubleRef.current = true;
    firstTapAtRef.current = now;
    clearDoubleTapWindow();
    doubleTapWindowTimerRef.current = setTimeout(() => {
      pendingTeamAForDoubleRef.current = false;
      firstTapAtRef.current = 0;
      doubleTapWindowTimerRef.current = null;
    }, DOUBLE_TAP_MAX_GAP_MS);
  }, [onTeamA, onTeamB, onUndo, clearDoubleTapWindow]);

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
