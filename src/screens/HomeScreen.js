import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';
import {
  getProfile, memories, occasions, letters, blackbox, moods,
} from '../services/storage';
import { pickMemoryOfDay } from '../services/notifications';
import { formatLongDate, yearsSince, nextAnniversary, daysUntil } from '../utils/dates';

// Home — at-a-glance overview: today's mood prompt, days together,
// upcoming relationship milestones, and quick links to every flow.
export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ memories: 0, letters: 0, blackbox: 0, occasions: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [memoryOfDay, setMemoryOfDay] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    const p = await getProfile();
    const [m, o, l, b, mo] = await Promise.all([
      memories.list(), occasions.list(), letters.list(), blackbox.list(), moods.list(),
    ]);
    setProfile(p);
    setCounts({ memories: m.length, letters: l.length, blackbox: b.length, occasions: o.length });
    setMemoryOfDay(pickMemoryOfDay(m));
    // Compute upcoming anniversaries.
    const up = o
      .map((occ) => ({ ...occ, next: nextAnniversary(occ.date), days: daysUntil(nextAnniversary(occ.date)) }))
      .sort((a, b2) => a.days - b2.days)
      .slice(0, 3);
    setUpcoming(up);

    // Today's mood, if any.
    const today = new Date().toISOString().slice(0, 10);
    setTodayMood(mo.find((entry) => entry.date === today));
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const daysTogether = profile?.startDate
    ? Math.floor((Date.now() - new Date(profile.startDate).getTime()) / 86_400_000)
    : 0;
  const yrs = profile?.startDate ? yearsSince(profile.startDate).toFixed(1) : '0.0';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.terracotta} />}
      >
        <ScreenHeader
          eyebrow={profile?.title || 'Welcome home'}
          title={`Good ${greetingHour()},\n${profile?.partnerA || ''}.`}
          subtitle={profile?.startDate ? `It has been ${daysTogether.toLocaleString()} days — ${yrs} years — since ${formatLongDate(profile.startDate)}.` : 'Settle in. Let\u2019s start your shared story.'}
        />

        {/* Today card */}
        <View
          style={{
            marginHorizontal: spacing.lg,
            marginBottom: spacing.lg,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.ink,
            ...shadows.floating,
          }}
        >
          <Text style={[text.caption, { color: colors.honey, marginBottom: 6 }]}>
            Today
          </Text>
          <Text style={[text.title, { color: colors.paper, marginBottom: 10 }]}>
            {todayMood
              ? `You felt ${todayMood.mood} today.`
              : 'How does today feel?'}
          </Text>
          <Text style={[text.body, { color: colors.blush, marginBottom: spacing.md }]}>
            {todayMood?.note || 'A single word, or a whole paragraph. Your partner will see it.'}
          </Text>
          <Pressable
            testID="home-mood-cta"
            onPress={() => navigation.navigate('Mood')}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: radius.pill,
              backgroundColor: colors.terracotta,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={[text.body, { color: colors.paper, fontWeight: '600' }]}>
              {todayMood ? 'Update mood' : 'Share my mood'}
            </Text>
          </Pressable>
        </View>

        {/* Memory of the Day */}
        {memoryOfDay ? (
          <Pressable
            testID="home-mod-card"
            onPress={() => navigation.navigate('MemoryOfDay')}
            style={({ pressed }) => [
              {
                marginHorizontal: spacing.lg,
                marginBottom: spacing.lg,
                padding: spacing.lg,
                borderRadius: radius.lg,
                backgroundColor: colors.ivory,
                borderLeftWidth: 3,
                borderLeftColor: colors.honey,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              },
              shadows.card,
            ]}
          >
            <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>
              Memory of the day · {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
            <Text style={[text.subtitle, { color: colors.ink, marginBottom: 4 }]}>
              {memoryOfDay.title || formatLongDate(memoryOfDay.date || memoryOfDay.createdAt)}
            </Text>
            <Text style={[text.body, { color: colors.inkSoft }]} numberOfLines={3}>
              {memoryOfDay.note || 'Tap to relive this.'}
            </Text>
            <Text style={[text.caption, { color: colors.inkFaint, marginTop: spacing.sm }]}>
              Tap to read in full
            </Text>
          </Pressable>
        ) : null}

        {/* Quick stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg }}>
          <Stat label="Memories" value={counts.memories} tone="terracotta" />
          <Stat label="Letters" value={counts.letters} tone="sage" />
          <Stat label="Vault" value={counts.blackbox} tone="honey" />
        </View>

        {/* Upcoming */}
        <Text style={[text.caption, { color: colors.inkFaint, marginHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
          What\u2019s coming up
        </Text>
        {upcoming.length === 0 ? (
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
              Add the dates that matter — first meet, first kiss, first fight, anniversary — so the calendar can remember them for you.
            </Text>
            <PrimaryButton
              label="Add an occasion"
              onPress={() => navigation.navigate('AddOccasion')}
              testID="home-add-occasion"
            />
          </View>
        ) : (
          upcoming.map((u) => (
            <View
              key={u.id}
              style={{
                marginHorizontal: spacing.lg,
                marginBottom: spacing.sm,
                padding: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: radius.md,
                backgroundColor: colors.card,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeftWidth: 3,
                borderLeftColor: colors.honey,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[text.body, { color: colors.ink, fontWeight: '600' }]}>{u.title}</Text>
                <Text style={[text.bodySmall, { color: colors.inkSoft }]}>
                  {formatLongDate(u.next)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[text.title, { color: colors.terracotta }]}>{u.days}</Text>
                <Text style={[text.caption, { color: colors.inkFaint }]}>
                  {u.days === 1 ? 'day to go' : 'days to go'}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Shortcuts */}
        <Text style={[text.caption, { color: colors.inkFaint, marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Where would you like to go?
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <Shortcut label="Our story" onPress={() => navigation.navigate('Timeline')} testID="sc-timeline" />
          <Shortcut label="A new memory" onPress={() => navigation.navigate('AddMemory')} testID="sc-add-memory" />
          <Shortcut label="Write a letter" onPress={() => navigation.navigate('Letters')} testID="sc-letters" />
          <Shortcut label="Couple quiz" onPress={() => navigation.navigate('Quiz')} testID="sc-quiz" />
          <Shortcut label="Photo library" onPress={() => navigation.navigate('PhotoPicker')} testID="sc-photos" />
          <Shortcut label="Voice notes" onPress={() => navigation.navigate('VoiceNotes')} testID="sc-voice" />
          <Shortcut label="Black box" onPress={() => navigation.navigate('BlackBox')} testID="sc-vault" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, tone }) {
  const map = {
    terracotta: colors.terracotta,
    sage: colors.sageDeep,
    honey: colors.honey,
  };
  return (
    <View
      style={{
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        borderTopWidth: 3,
        borderTopColor: map[tone],
      }}
    >
      <Text style={[text.display, { color: colors.ink, fontSize: 28, lineHeight: 32 }]}>{value}</Text>
      <Text style={[text.caption, { color: colors.inkFaint, marginTop: 4 }]}>{label}</Text>
    </View>
  );
}

function Shortcut({ label, onPress, testID }) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => ({
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: radius.pill,
        backgroundColor: colors.paperDeep,
        borderWidth: 1,
        borderColor: colors.edge,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={[text.bodySmall, { color: colors.ink, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

function greetingHour() {
  const h = new Date().getHours();
  if (h < 5) return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}
