import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { text } from '../theme/typography';

const MOODS = [
  { id: 'glow',     label: 'glowing',   icon: '☀',  color: '#D9A441' },
  { id: 'warm',     label: 'warm',      icon: '✿',  color: '#C0532F' },
  { id: 'quiet',    label: 'quiet',     icon: '◐',  color: '#6E8F6C' },
  { id: 'tender',   label: 'tender',    icon: '♡',  color: '#B0432A' },
  { id: 'restless', label: 'restless',  icon: '∿',  color: '#8E3A1C' },
  { id: 'far',      label: 'far away',  icon: '◌',  color: '#9C8775' },
];

export default function MoodPicker({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {MOODS.map((m) => {
        const active = value === m.id;
        return (
          <Pressable
            key={m.id}
            testID={`mood-${m.id}`}
            onPress={() => onChange(m.id)}
            style={({ pressed }) => ({
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: radius.pill,
              borderWidth: 1.2,
              borderColor: active ? m.color : colors.edge,
              backgroundColor: active ? m.color : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 14, color: active ? colors.paper : m.color }}>{m.icon}</Text>
            <Text style={[text.bodySmall, { color: active ? colors.paper : colors.ink, fontWeight: '600' }]}>
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export { MOODS };
