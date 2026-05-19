import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import { memories, occasions, chats, getSelectedPhotoIds } from '../services/storage';
import { getAssetsByIds } from '../services/photos';
import { buildTimeline } from '../services/timeline';
import { formatLongDate } from '../utils/dates';
import { MOODS } from '../components/MoodPicker';

// TimelineDetail — every item inside a chosen chapter, in chronological
// order. Photos render as a quilted gallery; memories as serif notes;
// chats as message bubbles; milestones as inline markers.
export default function TimelineDetailScreen({ route, navigation }) {
  const { groupKey, label } = route.params;
  const [items, setItems] = useState([]);

  const reload = useCallback(async () => {
    const [m, o, c, photoIds] = await Promise.all([
      memories.list(), occasions.list(), chats.list(), getSelectedPhotoIds(),
    ]);
    let assets = [];
    try { assets = await getAssetsByIds(photoIds); } catch { /* offline / no permission */ }
    const groups = buildTimeline({ memories: m, chats: c, occasions: o, assets });
    const group = groups.find((g) => g.key === groupKey);
    setItems(group ? group.items.slice().reverse() : []);
  }, [groupKey]);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => navigation.goBack()}
          testID="detail-back"
          hitSlop={12}
          style={{ marginRight: spacing.md }}
        >
          <Text style={[text.title, { color: colors.ink }]}>‹</Text>
        </Pressable>
        <Text style={[text.caption, { color: colors.terracotta }]}>Chapter</Text>
      </View>
      <ScreenHeader title={label} subtitle={`${items.length} ${items.length === 1 ? 'moment' : 'moments'}`} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {items.map((it) => (
          <Item key={it.id} item={it} />
        ))}
        {items.length === 0 ? (
          <Text style={[text.body, { color: colors.inkFaint, marginHorizontal: spacing.lg }]}>
            Nothing yet in this chapter.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Item({ item }) {
  const when = item.when ? formatLongDate(item.when) : '';
  if (item.kind === 'photo') {
    const uri = item.data?.localUri || item.data?.uri;
    return (
      <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <Text style={[text.caption, { color: colors.inkFaint, marginBottom: 6 }]}>{when}</Text>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: 260, borderRadius: radius.lg, backgroundColor: colors.paperDeep }}
          contentFit="cover"
        />
      </View>
    );
  }
  if (item.kind === 'memory') {
    const mood = MOODS.find((m) => m.id === item.data.mood);
    return (
      <View
        style={[
          {
            marginHorizontal: spacing.lg,
            marginBottom: spacing.md,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.card,
            borderLeftWidth: 3,
            borderLeftColor: mood?.color || colors.terracotta,
          },
          shadows.card,
        ]}
      >
        <Text style={[text.caption, { color: colors.inkFaint, marginBottom: 4 }]}>{when}</Text>
        {item.data.title ? (
          <Text style={[text.subtitle, { color: colors.ink, marginBottom: 6 }]}>{item.data.title}</Text>
        ) : null}
        <Text style={[text.body, { color: colors.inkSoft }]}>{item.data.note}</Text>
        {item.data.authorName ? (
          <Text style={[text.caption, { color: colors.inkFaint, marginTop: spacing.sm }]}>— {item.data.authorName}</Text>
        ) : null}
      </View>
    );
  }
  if (item.kind === 'occasion') {
    return (
      <View
        style={{
          marginHorizontal: spacing.lg,
          marginBottom: spacing.md,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.ivory,
          borderWidth: 1,
          borderColor: colors.honey,
        }}
      >
        <Text style={[text.caption, { color: colors.honey, marginBottom: 4 }]}>Milestone · {when}</Text>
        <Text style={[text.subtitle, { color: colors.ink }]}>{item.data.title}</Text>
        {item.data.description ? (
          <Text style={[text.bodySmall, { color: colors.inkSoft, marginTop: 4 }]}>{item.data.description}</Text>
        ) : null}
      </View>
    );
  }
  if (item.kind === 'chat') {
    const fromA = item.data.from === 'a';
    return (
      <View style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm, alignItems: fromA ? 'flex-start' : 'flex-end' }}>
        <View
          style={{
            maxWidth: '78%',
            padding: 12,
            borderRadius: radius.lg,
            backgroundColor: fromA ? colors.paperDeep : colors.ink,
          }}
        >
          <Text style={[text.body, { color: fromA ? colors.ink : colors.paper }]}>{item.data.text}</Text>
        </View>
        <Text style={[text.caption, { color: colors.inkFaint, marginTop: 4 }]}>{when}</Text>
      </View>
    );
  }
  return null;
}
