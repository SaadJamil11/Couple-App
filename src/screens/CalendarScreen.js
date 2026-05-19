import React, { useCallback, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';
import { occasions } from '../services/storage';
import { formatLongDate, nextAnniversary, daysUntil } from '../utils/dates';
import { getStoredGoogle, isAccessTokenValid } from '../services/googleAuth';
import { pushOccasion } from '../services/googleCalendar';

// Relationship Calendar. Hand-edited milestones, marked on a clean
// month grid. Long-press an occasion to push it to Google Calendar.
export default function CalendarScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [googleReady, setGoogleReady] = useState(false);

  const reload = useCallback(async () => {
    const items = await occasions.list();
    items.sort((a, b) => new Date(a.date) - new Date(b.date));
    setList(items);
    const t = await getStoredGoogle();
    setGoogleReady(isAccessTokenValid(t));
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  // Build markedDates for the react-native-calendars view.
  const marked = useMemo(() => {
    const map = {};
    for (const occ of list) {
      const d = occ.date?.slice(0, 10);
      if (!d) continue;
      map[d] = { marked: true, dotColor: colors.terracotta };
    }
    return map;
  }, [list]);

  const pushToGoogle = async (occ) => {
    try {
      await pushOccasion(occ);
      Alert.alert('Added to Google Calendar', `${occ.title} now repeats every year on your Google Calendar.`);
    } catch (e) {
      Alert.alert('Could not push', e?.message || 'Make sure you\u2019re signed in to Google.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader
          eyebrow="Days that built us"
          title="Calendar"
          subtitle="Mark the dates that matter. The app will remind you, every year."
          right={
            <PrimaryButton
              label="+ Add"
              onPress={() => navigation.navigate('AddOccasion')}
              testID="cal-add"
            />
          }
        />

        <View
          style={{
            marginHorizontal: spacing.lg,
            borderRadius: radius.lg,
            overflow: 'hidden',
            ...shadows.card,
          }}
        >
          <Calendar
            markedDates={marked}
            theme={{
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              textSectionTitleColor: colors.inkFaint,
              dayTextColor: colors.ink,
              monthTextColor: colors.ink,
              arrowColor: colors.terracotta,
              todayTextColor: colors.terracotta,
              selectedDayBackgroundColor: colors.terracotta,
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
            }}
          />
        </View>

        <Text style={[text.caption, { color: colors.inkFaint, marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          {list.length === 0 ? 'Add your first milestone' : `${list.length} milestones`}
        </Text>

        {list.length === 0 ? (
          <View
            style={{
              marginHorizontal: spacing.lg,
              padding: spacing.lg,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.edge,
              borderStyle: 'dashed',
            }}
          >
            <Text style={[text.body, { color: colors.inkSoft, marginBottom: spacing.md }]}>
              The day you met. Your first kiss. Your first big fight. Mark each as an occasion — they\u2019ll repeat yearly so you never miss one.
            </Text>
            <PrimaryButton label="Mark first occasion" onPress={() => navigation.navigate('AddOccasion')} testID="cal-empty-add" />
          </View>
        ) : (
          list.map((occ) => {
            const next = nextAnniversary(occ.date);
            const days = daysUntil(next);
            return (
              <Pressable
                key={occ.id}
                testID={`occasion-${occ.id}`}
                onLongPress={() => googleReady ? pushToGoogle(occ) : Alert.alert('Connect Google first', 'Sign in to Google from Settings to push occasions to your Google Calendar.')}
                style={{
                  marginHorizontal: spacing.lg,
                  marginBottom: spacing.sm,
                  padding: spacing.md,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.md,
                  backgroundColor: colors.card,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.honey,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[text.body, { color: colors.ink, fontWeight: '600' }]}>{occ.title}</Text>
                  <Text style={[text.bodySmall, { color: colors.inkSoft }]}>{formatLongDate(occ.date)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[text.title, { color: colors.terracotta }]}>{days}</Text>
                  <Text style={[text.caption, { color: colors.inkFaint }]}>days</Text>
                </View>
              </Pressable>
            );
          })
        )}

        {!googleReady ? (
          <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Text style={[text.bodySmall, { color: colors.inkFaint, fontStyle: 'italic' }]}>
              Tip: sign in to Google from the "Us" tab to also push these occasions to your Google Calendar (yearly repeat).
            </Text>
          </View>
        ) : (
          <Text style={[text.bodySmall, { color: colors.sageDeep, marginHorizontal: spacing.lg, marginTop: spacing.lg, fontStyle: 'italic' }]}>
            Long-press any occasion to send it to your Google Calendar.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
