import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme/colors';
import { text } from '../theme/typography';
import PrimaryButton from '../components/PrimaryButton';
import { blackbox } from '../services/storage';
import { toISODate, formatLongDate } from '../utils/dates';

const PRESETS = [1, 5, 10, 20, 25];

export default function AddBlackBoxScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [unlockYears, setUnlockYears] = useState(10);
  const [saving, setSaving] = useState(false);

  const computedUnlock = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + unlockYears);
    return d;
  })();

  const save = async () => {
    if (!body.trim()) {
      Alert.alert('Empty letter', 'Write something — even one line will be priceless ten years from now.');
      return;
    }
    setSaving(true);
    await blackbox.add({
      title: title.trim(),
      body: body.trim(),
      unlockDate: toISODate(computedUnlock),
      unlockYears,
    });
    setSaving(false);
    Alert.alert(
      'Sealed.',
      `This will open on ${formatLongDate(computedUnlock)}. Trust your future selves — they\u2019ll need it.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="bb-back">
            <Text style={[text.title, { color: colors.ink, marginBottom: spacing.md }]}>‹</Text>
          </Pressable>
          <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>Seal a letter</Text>
          <Text style={[text.display, { color: colors.ink, marginBottom: spacing.lg }]}>
            For our future{'\n'}selves to find.
          </Text>

          <TextInput
            placeholder="Title (optional) — e.g. About this year"
            placeholderTextColor={colors.inkFaint}
            value={title}
            onChangeText={setTitle}
            testID="bb-title"
            style={{
              fontSize: 18,
              paddingVertical: 12,
              paddingHorizontal: 14,
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.edge,
              color: colors.ink,
              marginBottom: spacing.md,
            }}
          />
          <TextInput
            placeholder="Dear us in the future…"
            placeholderTextColor={colors.inkFaint}
            value={body}
            onChangeText={setBody}
            multiline
            testID="bb-body"
            style={{
              minHeight: 220,
              paddingVertical: 12,
              paddingHorizontal: 14,
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.edge,
              color: colors.ink,
              fontSize: 16,
              textAlignVertical: 'top',
            }}
          />

          <Text style={[text.body, { color: colors.ink, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm }]}>
            Unlock in
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {PRESETS.map((y) => {
              const active = unlockYears === y;
              return (
                <Pressable
                  key={y}
                  onPress={() => setUnlockYears(y)}
                  testID={`bb-preset-${y}`}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: radius.pill,
                    borderWidth: 1.2,
                    borderColor: active ? colors.ink : colors.edge,
                    backgroundColor: active ? colors.ink : 'transparent',
                  }}
                >
                  <Text style={[text.bodySmall, { color: active ? colors.paper : colors.ink, fontWeight: '600' }]}>
                    {y} {y === 1 ? 'year' : 'years'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[text.bodySmall, { color: colors.inkFaint, marginTop: spacing.md, fontStyle: 'italic' }]}>
            Opens on {formatLongDate(computedUnlock)}.
          </Text>

          <PrimaryButton label="Seal" onPress={save} loading={saving} testID="bb-save" style={{ marginTop: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
