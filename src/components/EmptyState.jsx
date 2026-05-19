import React from 'react';
import { View, Text } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { text } from '../theme/typography';

// EmptyState — used when a list has no data yet. Encourages first action.
export default function EmptyState({ title, body, action, testID }) {
  return (
    <View
      testID={testID}
      style={{
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'flex-start',
      }}
    >
      <View
        style={{
          width: 56,
          height: 1.5,
          backgroundColor: colors.terracotta,
          marginBottom: spacing.md,
        }}
      />
      <Text style={[text.subtitle, { color: colors.ink, marginBottom: spacing.sm }]}>
        {title}
      </Text>
      <Text style={[text.body, { color: colors.inkSoft, marginBottom: spacing.lg, maxWidth: 320 }]}>
        {body}
      </Text>
      {action}
    </View>
  );
}
