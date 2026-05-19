import React from 'react';
import { View, Text } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { text } from '../theme/typography';

// ScreenHeader — editorial title block used at the top of stack screens.
// Mono caption + serif title + optional subtitle. Always left-aligned for
// natural reading.
export default function ScreenHeader({ eyebrow, title, subtitle, right }) {
  return (
    <View
      style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>
            {eyebrow}
          </Text>
        ) : null}
        <Text style={[text.display, { color: colors.ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[text.body, { color: colors.inkSoft, marginTop: 6 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={{ marginLeft: spacing.md }}>{right}</View> : null}
    </View>
  );
}
