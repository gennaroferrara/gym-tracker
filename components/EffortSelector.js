import React from 'react';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';

const palette = ['#2e7d32', '#f9a825', '#c62828']; // verde‑giallo‑rosso

export default function EffortSelector({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
      {[0, 1, 2].map(v => (
        <Chip
          key={v}
          selected={value === v}
          style={{ backgroundColor: palette[v], width: 32, height: 32 }}
          onPress={() => onChange(v)}
        />
      ))}
    </View>
  );
}
