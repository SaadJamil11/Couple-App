import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { colors, spacing, radius } from '../theme/colors';
import { text } from '../theme/typography';
import PrimaryButton from '../components/PrimaryButton';
import MoodPicker from '../components/MoodPicker';
import { memories, getProfile } from '../services/storage';
import { toISODate } from '../utils/dates';

export default function AddMemoryScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toISODate(new Date()));
  const [mood, setMood] = useState(null);
  const [photoUri, setPhoto] = useState(null);
  const [author, setAuthor] = useState('a');
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (!res.canceled && res.assets?.[0]) setPhoto(res.assets[0].uri);
  };

  const save = async () => {
    if (!note.trim() && !title.trim()) return;
    setSaving(true);
    const profile = await getProfile();
    const authorName = author === 'a' ? profile?.partnerA : profile?.partnerB;
    await memories.add({
      title: title.trim(),
      note: note.trim(),
      date,
      mood,
      photoUri,
      author,
      authorName,
    });
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="add-memory-back">
              <Text style={[text.title, { color: colors.ink }]}>‹</Text>
            </Pressable>
            <Text style={[text.caption, { color: colors.terracotta, marginLeft: spacing.md }]}>New memory</Text>
          </View>
          <Text style={[text.display, { color: colors.ink, marginBottom: spacing.lg }]}>
            What happened?
          </Text>

          <Field label="A short title (optional)" value={title} onChange={setTitle} placeholder="e.g. The night the cake fell" testID="memory-title" />
          <Field label="The story" value={note} onChange={setNote} placeholder="In your own words…" testID="memory-note" multiline />
          <Field label="When" value={date} onChange={setDate} placeholder="YYYY-MM-DD" testID="memory-date" />

          <Text style={[text.body, { color: colors.ink, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm }]}>
            How did it feel?
          </Text>
          <MoodPicker value={mood} onChange={setMood} />

          <Text style={[text.body, { color: colors.ink, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm }]}>
            Written by
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <AuthorPill label="Me" active={author === 'a'} onPress={() => setAuthor('a')} testID="author-a" />
            <AuthorPill label="My partner" active={author === 'b'} onPress={() => setAuthor('b')} testID="author-b" />
          </View>

          <Pressable
            onPress={pickImage}
            testID="memory-pick-photo"
            style={{
              marginTop: spacing.lg,
              padding: photoUri ? 0 : spacing.lg,
              borderRadius: radius.lg,
              borderWidth: photoUri ? 0 : 1.2,
              borderStyle: photoUri ? 'solid' : 'dashed',
              borderColor: colors.edge,
              backgroundColor: colors.card,
              overflow: 'hidden',
            }}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: '100%', height: 220 }} contentFit="cover" />
            ) : (
              <Text style={[text.body, { color: colors.inkFaint, textAlign: 'center' }]}>
                + Add a photo
              </Text>
            )}
          </Pressable>

          <PrimaryButton
            label="Save memory"
            onPress={save}
            loading={saving}
            disabled={!note.trim() && !title.trim()}
            testID="memory-save"
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
        testID={testID}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        multiline={multiline}
        style={{
          minHeight: multiline ? 120 : 48,
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
