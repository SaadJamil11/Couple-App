import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { letters } from '../services/storage';
import { formatLongDate } from '../utils/dates';

export default function LettersScreen({ navigation }) {
  const [list, setList] = useState([]);

  const reload = useCallback(async () => {
    const items = await letters.list();
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setList(items);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="letters-back">
          <Text style={[text.title, { color: colors.ink }]}>‹</Text>
        </Pressable>
      </View>
      <ScreenHeader
        eyebrow="Slow conversations"
        title="Letters"
        subtitle="Write your partner once a week, or once a month. Old letters become time capsules."
        right={
          <PrimaryButton
            label="+ Write"
            onPress={() => navigation.navigate('WriteLetter')}
            testID="letters-write"
          />
        }
      />

      {list.length === 0 ? (
        <EmptyState
          title="No letters yet."
          body="A weekly letter is the easiest way to say the things daily life keeps interrupting."
          action={<PrimaryButton label="Write your first letter" onPress={() => navigation.navigate('WriteLetter')} testID="letters-write-empty" />}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ paddingVertical: spacing.md, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => (
            <Pressable
              testID={`letter-${item.id}`}
              style={[
                {
                  marginHorizontal: spacing.lg,
                  marginBottom: spacing.md,
                  padding: spacing.lg,
                  borderRadius: radius.lg,
                  backgroundColor: colors.card,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.sage,
                },
                shadows.card,
              ]}
            >
              <Text style={[text.caption, { color: colors.inkFaint }]}>
                {formatLongDate(item.createdAt)} · from {item.authorName || (item.author === 'a' ? 'me' : 'partner')}
              </Text>
              {item.title ? (
                <Text style={[text.subtitle, { color: colors.ink, marginTop: 6 }]}>{item.title}</Text>
              ) : null}
              <Text style={[text.body, { color: colors.inkSoft, marginTop: 6 }]} numberOfLines={5}>
                {item.body}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
