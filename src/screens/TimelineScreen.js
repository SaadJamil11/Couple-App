import React, { useCallback, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import TimeCard from '../components/TimeCard';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { memories, occasions, chats, getSelectedPhotoIds } from '../services/storage';
import { getAssetsByIds } from '../services/photos';
import { buildTimeline } from '../services/timeline';

// Timeline — the editorial spine of the app. Combines memories, photos,
// chats, and milestones into seasonal "chapters". Tap a chapter to open
// the full Timeline detail screen.
export default function TimelineScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [m, o, c, photoIds] = await Promise.all([
      memories.list(), occasions.list(), chats.list(), getSelectedPhotoIds(),
    ]);
    let assets = [];
    try {
      assets = await getAssetsByIds(photoIds);
    } catch {
      assets = [];
    }
    setGroups(buildTimeline({ memories: m, chats: c, occasions: o, assets }));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <ScreenHeader
        eyebrow="Our story, in chapters"
        title="Timeline"
        subtitle="Each card holds a season. Tap to relive every photo, note, and milestone inside."
      />
      {loading ? (
        <Text style={[text.body, { color: colors.inkFaint, marginHorizontal: spacing.lg }]}>
          Gathering your moments…
        </Text>
      ) : groups.length === 0 ? (
        <EmptyState
          title="Your story starts with one moment."
          body="Add a memory, mark an occasion, or pick a few photos from your library — they\u2019ll appear here as time cards."
          action={
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <PrimaryButton label="Add memory" onPress={() => navigation.navigate('AddMemory')} testID="timeline-add-memory" />
              <PrimaryButton label="Pick photos" variant="ghost" onPress={() => navigation.navigate('PhotoPicker')} testID="timeline-pick-photos" />
            </View>
          }
        />
      ) : (
        <FlatList
          testID="timeline-list"
          data={groups}
          keyExtractor={(g) => g.key}
          renderItem={({ item, index }) => (
            <TimeCard
              group={item}
              index={index}
              onPress={() => navigation.navigate('TimelineDetail', { groupKey: item.key, label: item.label })}
            />
          )}
          contentContainerStyle={{ paddingVertical: spacing.md, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
