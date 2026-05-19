import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import PrimaryButton from '../components/PrimaryButton';
import { memories } from '../services/storage';
import { pickMemoryOfDay } from '../services/notifications';
import { formatLongDate } from '../utils/dates';
import { MOODS } from '../components/MoodPicker';

// Full-screen "Memory of the Day" — same selection logic as the daily
// notification, so what the user sees here always matches what their
// 9 a.m. ping references.
export default function MemoryOfDayScreen({ navigation }) {
  const [today, setToday] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const list = await memories.list();
    setToday(pickMemoryOfDay(list));
    setLoaded(true);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const mood = today ? MOODS.find((m) => m.id === today.mood) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paperDeep }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="mod-back">
          <Text style={[text.title, { color: colors.ink }]}>‹</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <Text style={[text.display, { color: colors.ink, marginBottom: spacing.lg }]}>
          Memory of the day
        </Text>

        {!loaded ? (
          <Text style={[text.body, { color: colors.inkFaint }]}>Loading…</Text>
        ) : !today ? (
          <View
            style={{
              padding: spacing.lg,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.edge,
              borderStyle: 'dashed',
            }}
          >
            <Text style={[text.body, { color: colors.inkSoft, marginBottom: spacing.md }]}>
              You haven\u2019t added any memories yet. Add the first one and
              Tethered will resurface one every morning, gently.
            </Text>
            <PrimaryButton
              label="Add a memory"
              onPress={() => { navigation.replace('AddMemory'); }}
              testID="mod-add"
            />
          </View>
        ) : (
          <View style={[
            {
              borderRadius: radius.lg,
              backgroundColor: colors.card,
              overflow: 'hidden',
              borderLeftWidth: 3,
              borderLeftColor: mood?.color || colors.terracotta,
            },
            shadows.card,
          ]}>
            {today.photoUri ? (
              <Image source={{ uri: today.photoUri }} style={{ width: '100%', height: 280 }} contentFit="cover" transition={250} />
            ) : null}
            <View style={{ padding: spacing.lg }}>
              <Text style={[text.caption, { color: colors.inkFaint, marginBottom: 6 }]}>
                {formatLongDate(today.date || today.createdAt)}{mood ? ` · felt ${mood.label}` : ''}
              </Text>
              {today.title ? (
                <Text style={[text.title, { color: colors.ink, marginBottom: spacing.sm }]}>
                  {today.title}
                </Text>
              ) : null}
              <Text style={[text.body, { color: colors.ink, lineHeight: 26 }]}>
                {today.note}
              </Text>
              {today.authorName ? (
                <Text style={[text.caption, { color: colors.inkFaint, marginTop: spacing.md }]}>
                  — {today.authorName}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <Text style={[text.bodySmall, { color: colors.inkSoft, marginTop: spacing.xl, fontStyle: 'italic', lineHeight: 22 }]}>
          The same memory shows up across the day so you can return to it
          whenever you have a quiet minute together. Tomorrow brings another.
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap' }}>
          <PrimaryButton
            label="See full timeline"
            variant="ghost"
            onPress={() => navigation.navigate('Main', { screen: 'Timeline' })}
            testID="mod-timeline"
          />
          <PrimaryButton
            label="Add today\u2019s memory"
            onPress={() => navigation.navigate('AddMemory')}
            testID="mod-add-new"
          />
        </View>

        {today ? (
          <Pressable
            onPress={() => Alert.alert('Saved', 'This memory has been picked for today. Tomorrow another will surface.')}
            style={{ marginTop: spacing.lg }}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
