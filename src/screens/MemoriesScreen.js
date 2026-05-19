import React, { useCallback, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '../theme/colors';
import ScreenHeader from '../components/ScreenHeader';
import MemoryCard from '../components/MemoryCard';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { memories } from '../services/storage';

export default function MemoriesScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const reload = useCallback(async () => {
    const list = await memories.list();
    list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    setItems(list);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <ScreenHeader
        eyebrow="Things we don\u2019t want to forget"
        title="Memories"
        right={
          <PrimaryButton
            label="+ New"
            onPress={() => navigation.navigate('AddMemory')}
            testID="memories-add"
          />
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="Nothing pinned yet."
          body="Capture a small moment — a dinner, a song, a fight you survived — and it will live here forever."
          action={
            <PrimaryButton
              label="Add a memory"
              onPress={() => navigation.navigate('AddMemory')}
              testID="memories-add-empty"
            />
          }
        />
      ) : (
        <FlatList
          testID="memories-list"
          data={items}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MemoryCard memory={item} />}
          contentContainerStyle={{ paddingVertical: spacing.md, paddingBottom: spacing.xxl }}
        />
      )}
    </SafeAreaView>
  );
}
