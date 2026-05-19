import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme/colors';
import { text } from '../theme/typography';
import PrimaryButton from '../components/PrimaryButton';
import { occasions } from '../services/storage';
import { toISODate } from '../utils/dates';

const SUGGESTIONS = [
  'First meeting', 'First date', 'First kiss', 'Anniversary',
  'First fight (and how we made up)', 'Said "I love you"', 'Moved in together',
  'Got engaged', 'Wedding', 'First trip together',
];

export default function AddOccasionScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toISODate(new Date()));
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await occasions.add({ title: title.trim(), date, description: description.trim() });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="occ-back">
            <Text style={[text.title, { color: colors.ink, marginBottom: spacing.md }]}>‹</Text>
          </Pressable>
          <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>New milestone</Text>
          <Text style={[text.display, { color: colors.ink, marginBottom: spacing.lg }]}>
            Which day{'\n'}should we always remember?
          </Text>

          <Field label="Title" placeholder="e.g. The day we met" value={title} onChange={setTitle} testID="occ-title" />
          <Field label="When" placeholder="YYYY-MM-DD" value={date} onChange={setDate} testID="occ-date" />
          <Field label="A short story (optional)" placeholder="What happened?" value={description} onChange={setDescription} testID="occ-desc" multiline />

          <Text style={[text.caption, { color: colors.inkFaint, marginTop: spacing.md, marginBottom: spacing.sm }]}>
            Common milestones
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setTitle(s)}
                testID={`suggest-${s.toLowerCase().replace(/[^a-z]/g, '-')}`}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.edge,
                  backgroundColor: colors.card,
                }}
              >
                <Text style={[text.bodySmall, { color: colors.ink }]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton
            label="Save milestone"
            onPress={save}
            disabled={!title.trim()}
            loading={saving}
            testID="occ-save"
            style={{ marginTop: spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, multiline, testID }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[text.body, { color: colors.ink, fontWeight: '600', marginBottom: 6 }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        multiline={multiline}
        testID={testID}
        style={{
          minHeight: multiline ? 100 : 48,
          paddingVertical: 12,
          paddingHorizontal: 14,
          backgroundColor: colors.card,
          borderRadius: radius.md,
          color: colors.ink,
          textAlignVertical: multiline ? 'top' : 'center',
          borderWidth: 1,
          borderColor: colors.edge,
          fontSize: 16,
        }}
      />
    </View>
  );
}
