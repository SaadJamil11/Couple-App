import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme/colors';
import { text } from '../theme/typography';
import PrimaryButton from '../components/PrimaryButton';
import MoodPicker, { MOODS } from '../components/MoodPicker';
import { moods, getProfile } from '../services/storage';
import { toISODate, formatLongDate } from '../utils/dates';

// Daily mood check-in. One per day per partner.
export default function MoodScreen({ navigation }) {
  const today = toISODate(new Date());
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState('a');
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await moods.list();
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(list.slice(0, 10));
      const existing = list.find((m) => m.date === today);
      if (existing) { setMood(existing.mood); setNote(existing.note || ''); setAuthor(existing.author || 'a'); }
    })();
  }, [today]);

  const save = async () => {
    if (!mood) return;
    setSaving(true);
    const profile = await getProfile();
    const authorName = author === 'a' ? profile?.partnerA : profile?.partnerB;
    const list = await moods.list();
    const existing = list.find((m) => m.date === today);
    if (existing) {
      await moods.update(existing.id, { mood, note, author, authorName });
    } else {
      await moods.add({ date: today, mood, note, author, authorName });
    }
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="mood-back">
            <Text style={[text.title, { color: colors.ink, marginBottom: spacing.md }]}>‹</Text>
          </Pressable>
          <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>Today</Text>
          <Text style={[text.display, { color: colors.ink, marginBottom: spacing.lg }]}>
            How does today feel?
          </Text>

          <MoodPicker value={mood} onChange={setMood} />

          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="One line for your partner, if you want…"
            placeholderTextColor={colors.inkFaint}
            testID="mood-note"
            style={{
              marginTop: spacing.lg,
              minHeight: 100,
              padding: 14,
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.edge,
              color: colors.ink,
              fontSize: 16,
              textAlignVertical: 'top',
            }}
          />

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <AuthorPill label="Me" active={author === 'a'} onPress={() => setAuthor('a')} testID="mood-author-a" />
            <AuthorPill label="My partner" active={author === 'b'} onPress={() => setAuthor('b')} testID="mood-author-b" />
          </View>

          <PrimaryButton
            label="Save today"
            onPress={save}
            disabled={!mood}
            loading={saving}
            testID="mood-save"
            style={{ marginTop: spacing.xl }}
          />

          <Text style={[text.caption, { color: colors.inkFaint, marginTop: spacing.xl, marginBottom: spacing.sm }]}>
            Recent days
          </Text>
          {history.map((h) => {
            const m = MOODS.find((x) => x.id === h.mood);
            return (
              <View
                key={h.id}
                style={{
                  marginBottom: spacing.sm,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.card,
                  borderLeftWidth: 3,
                  borderLeftColor: m?.color || colors.terracotta,
                }}
              >
                <Text style={[text.caption, { color: colors.inkFaint }]}>{formatLongDate(h.date)}</Text>
                <Text style={[text.body, { color: colors.ink }]}>{m?.label || h.mood} · {h.authorName || ''}</Text>
                {h.note ? (
                  <Text style={[text.bodySmall, { color: colors.inkSoft, marginTop: 2 }]}>{h.note}</Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthorPill({ label, active, onPress, testID }) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: radius.pill,
        borderWidth: 1.2,
        borderColor: active ? colors.ink : colors.edge,
        backgroundColor: active ? colors.ink : 'transparent',
      }}
    >
      <Text style={[text.bodySmall, { color: active ? colors.paper : colors.ink, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}
