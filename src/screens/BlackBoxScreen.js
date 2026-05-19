import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { blackbox } from '../services/storage';
import { formatLongDate, daysUntil } from '../utils/dates';

// Black Box — letters/photos/notes locked until a future date (default
// 10 years). Until they unlock, the user only sees the title + countdown.
export default function BlackBoxScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [now, setNow] = useState(Date.now());

  const reload = useCallback(async () => {
    const list = await blackbox.list();
    list.sort((a, b) => new Date(a.unlockDate) - new Date(b.unlockDate));
    setItems(list);
    setNow(Date.now());
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const openIfReady = (item) => {
    const unlocked = new Date(item.unlockDate).getTime() <= now;
    if (!unlocked) {
      const days = daysUntil(item.unlockDate);
      Alert.alert('Still sealed', `This one opens in ${days} days — on ${formatLongDate(item.unlockDate)}. Patience is the point.`);
      return;
    }
    Alert.alert(item.title || 'A message from your past selves', item.body || '(empty letter)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <ScreenHeader
        eyebrow="A decade-deep promise"
        title="Black Box"
        subtitle="Write things you don\u2019t want to read yet. They\u2019ll unlock on the day you choose."
        right={
          <PrimaryButton
            label="+ Seal one"
            onPress={() => navigation.navigate('AddBlackBox')}
            testID="bb-add"
          />
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="The vault is empty."
          body="Write a letter to your future selves. Set a date — five, ten, twenty years out. The app will keep it sealed until then."
          action={<PrimaryButton label="Seal a letter" onPress={() => navigation.navigate('AddBlackBox')} testID="bb-add-empty" />}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingVertical: spacing.md, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => {
            const days = daysUntil(item.unlockDate);
            const unlocked = days <= 0;
            return (
              <Pressable
                onPress={() => openIfReady(item)}
                testID={`bb-${item.id}`}
                style={[
                  {
                    marginHorizontal: spacing.lg,
                    marginBottom: spacing.md,
                    padding: spacing.lg,
                    borderRadius: radius.lg,
                    backgroundColor: unlocked ? colors.honey : colors.ink,
                  },
                  shadows.card,
                ]}
              >
                <Text style={[text.caption, { color: unlocked ? colors.ink : colors.honey, marginBottom: 6 }]}>
                  {unlocked ? 'OPEN · Tap to read' : `Sealed until ${formatLongDate(item.unlockDate)}`}
                </Text>
                <Text style={[text.title, { color: unlocked ? colors.ink : colors.paper, marginBottom: 6 }]}>
                  {item.title || 'A letter to our future selves'}
                </Text>
                {!unlocked ? (
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={[text.display, { color: colors.honey, fontSize: 36 }]}>{days}</Text>
                    <Text style={[text.body, { color: colors.blush }]}>days to go</Text>
                  </View>
                ) : (
                  <Text style={[text.body, { color: colors.ink }]} numberOfLines={2}>
                    {item.body}
                  </Text>
                )}
                <Text style={[text.caption, { color: unlocked ? colors.inkSoft : colors.inkFaint, marginTop: spacing.sm }]}>
                  Sealed {formatLongDate(item.createdAt)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
