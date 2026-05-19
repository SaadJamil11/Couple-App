import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import { summariseGroup } from '../services/timeline';

// TimeCard — a single chapter on the timeline ("Spring 2024", etc).
// Tapping it opens a detail screen showing every item inside the chapter.
//
// Design intent: a slightly rotated paper card to evoke a scrapbook,
// with a terracotta hand-stitched border on the left. Counts of media,
// chats, and notes appear as tiny mono captions.
export default function TimeCard({ group, index, onPress }) {
  const counts = summariseGroup(group);
  // Alternate a subtle tilt to give each card hand-placed feel.
  const rotate = index % 2 === 0 ? '-0.6deg' : '0.8deg';

  return (
    <Pressable
      testID={`timecard-${group.key}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          marginHorizontal: spacing.lg,
          marginBottom: spacing.lg,
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          padding: spacing.lg,
          transform: [{ rotate }, { scale: pressed ? 0.99 : 1 }],
          borderLeftWidth: 3,
          borderLeftColor: colors.terracotta,
        },
        shadows.card,
      ]}
    >
      <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>
        Chapter · {group.items.length} {group.items.length === 1 ? 'moment' : 'moments'}
      </Text>
      <Text style={[text.title, { color: colors.ink, marginBottom: 4 }]}>
        {group.label}
      </Text>
      <Text style={[text.bodySmall, { color: colors.inkSoft, marginBottom: spacing.md }]}>
        {previewLine(group)}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Pill label={`${counts.photo} photos`} hidden={!counts.photo} tone="sage" />
        <Pill label={`${counts.memory} notes`} hidden={!counts.memory} tone="honey" />
        <Pill label={`${counts.voice} voice`} hidden={!counts.voice} tone="sage" />
        <Pill label={`${counts.chat} chats`} hidden={!counts.chat} tone="terracotta" />
        <Pill label={`${counts.occasion} milestones`} hidden={!counts.occasion} tone="ink" />
      </View>
    </Pressable>
  );
}

function previewLine(group) {
  const first = group.items.find((i) => i.kind === 'memory' || i.kind === 'occasion');
  if (first?.data?.title) return first.data.title;
  if (first?.data?.note) return first.data.note;
  return 'Tap to relive this chapter.';
}

function Pill({ label, hidden, tone }) {
  if (hidden) return null;
  const map = {
    sage: { bg: '#E6EFE3', fg: colors.sageDeep },
    honey: { bg: '#F7EAC8', fg: '#8A6620' },
    terracotta: { bg: '#F6D7C7', fg: colors.terracottaDeep },
    ink: { bg: '#E9DFCF', fg: colors.ink },
  };
  const t = map[tone] || map.ink;
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: t.bg,
      }}
    >
      <Text style={[text.caption, { color: t.fg }]}>{label}</Text>
    </View>
  );
}
