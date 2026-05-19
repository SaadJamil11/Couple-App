import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, spacing, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import { formatShortDate } from '../utils/dates';
import { MOODS } from './MoodPicker';

export default function MemoryCard({ memory, onPress }) {
  const mood = MOODS.find((m) => m.id === memory.mood);
  return (
    <Pressable
      testID={`memory-${memory.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          overflow: 'hidden',
          opacity: pressed ? 0.95 : 1,
        },
        shadows.card,
      ]}
    >
      {memory.photoUri ? (
        <Image
          source={{ uri: memory.photoUri }}
          style={{ width: '100%', height: 200 }}
          contentFit="cover"
          transition={250}
        />
      ) : null}
      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={[text.caption, { color: colors.inkFaint }]}>
            {formatShortDate(memory.date || memory.createdAt)}
          </Text>
          {mood ? (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: radius.pill,
                backgroundColor: mood.color + '22',
              }}
            >
              <Text style={[text.caption, { color: mood.color }]}>{mood.label}</Text>
            </View>
          ) : null}
        </View>
        {memory.title ? (
          <Text style={[text.subtitle, { color: colors.ink, marginBottom: 4 }]}>
            {memory.title}
          </Text>
        ) : null}
        {memory.note ? (
          <Text style={[text.body, { color: colors.inkSoft }]} numberOfLines={3}>
            {memory.note}
          </Text>
        ) : null}
        {memory.authorName ? (
          <Text style={[text.caption, { color: colors.inkFaint, marginTop: spacing.sm }]}>
            — {memory.authorName}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
