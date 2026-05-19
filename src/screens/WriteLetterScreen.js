import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme/colors';
import { text } from '../theme/typography';
import PrimaryButton from '../components/PrimaryButton';
import { letters, getProfile } from '../services/storage';

const PROMPTS = [
  'What did this week teach me about you?',
  'A small thing you did that made me feel held.',
  'Something I have been carrying alone.',
  'A memory that surfaced this week.',
  'What I want us to try, together, next month.',
  'A part of you I am only just starting to understand.',
];

export default function WriteLetterScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [author, setAuthor] = useState('a');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!body.trim()) return;
    setSaving(true);
    const profile = await getProfile();
    const authorName = author === 'a' ? profile?.partnerA : profile?.partnerB;
    await letters.add({ title: title.trim(), body: body.trim(), author, authorName });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paperDeep }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="letter-back">
            <Text style={[text.title, { color: colors.ink, marginBottom: spacing.md }]}>‹</Text>
          </Pressable>
          <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>A letter, in your own time</Text>
          <Text style={[text.display, { color: colors.ink, marginBottom: spacing.lg }]}>
            Dear you,
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <AuthorPill label="From me" active={author === 'a'} onPress={() => setAuthor('a')} testID="letter-from-a" />
            <AuthorPill label="From my partner" active={author === 'b'} onPress={() => setAuthor('b')} testID="letter-from-b" />
          </View>

          <TextInput
            placeholder="A line that holds it (optional)"
            placeholderTextColor={colors.inkFaint}
            value={title}
            onChangeText={setTitle}
            testID="letter-title"
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
            placeholder="Write freely. They\u2019re reading every word."
            placeholderTextColor={colors.inkFaint}
            value={body}
            onChangeText={setBody}
            multiline
            testID="letter-body"
            style={{
              minHeight: 260,
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.edge,
              color: colors.ink,
              fontSize: 17,
              lineHeight: 26,
              textAlignVertical: 'top',
            }}
          />

          <Text style={[text.caption, { color: colors.inkFaint, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
            Need a prompt?
          </Text>
          <View style={{ gap: 6 }}>
            {PROMPTS.map((p) => (
              <Pressable key={p} onPress={() => setBody((b) => (b ? `${b}\n\n${p}\n` : `${p}\n\n`))}>
                <Text style={[text.bodySmall, { color: colors.sageDeep, fontStyle: 'italic' }]}>· {p}</Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton label="Send to our shelf" onPress={save} loading={saving} disabled={!body.trim()} testID="letter-save" style={{ marginTop: spacing.xl }} />
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
