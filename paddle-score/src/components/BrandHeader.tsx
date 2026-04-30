import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

type Size = 'large' | 'compact';

export function BrandHeader({ size = 'large' }: { size?: Size }) {
  const large = size === 'large';
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={large ? styles.titleLarge : styles.titleCompact}>PADEL</Text>
        <Text style={large ? styles.flagLarge : styles.flagCompact} accessibilityLabel="Israel flag">
          🇮🇱
        </Text>
        <Text style={large ? styles.israelLarge : styles.israelCompact}>ISRAEL</Text>
      </View>
      <Text style={large ? styles.subLarge : styles.subCompact}>SCOREKEEPER</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 10 : 8,
  },
  titleLarge: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 10,
  },
  titleCompact: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
  },
  flagLarge: {
    fontSize: 36,
    lineHeight: 44,
  },
  flagCompact: {
    fontSize: 28,
    lineHeight: 36,
  },
  israelLarge: {
    color: '#7eb8ff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
  },
  israelCompact: {
    color: '#7eb8ff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },
  subLarge: {
    color: '#3a5a7c',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 6,
    marginTop: 4,
  },
  subCompact: {
    color: '#3a5a7c',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 6,
    marginTop: 2,
  },
});
