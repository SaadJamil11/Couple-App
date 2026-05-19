import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { voiceNotes } from '../services/storage';
import {
  startRecording, loadSound, deleteVoiceNote,
} from '../services/voice';
import { formatLongDate } from '../utils/dates';

// Voice Notes — record up to a few minutes, listen back, delete.
// Keeps a single Sound instance around so play/stop is responsive.
export default function VoiceNotesScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [author, setAuthor] = useState('a');
  const [recording, setRecording] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const elapsedTimer = useRef(null);
  const [playingId, setPlayingId] = useState(null);
  const soundRef = useRef(null);

  const reload = useCallback(async () => {
    const items = await voiceNotes.list();
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setList(items);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  // Cleanup on unmount
  useEffect(() => () => {
    if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
    if (recording) recording.cancel().catch(() => {});
  }, [recording]);

  const startRec = async () => {
    try {
      const ctrl = await startRecording({ author });
      setRecording(ctrl);
      setElapsed(0);
      elapsedTimer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (e) {
      Alert.alert('Could not record', e?.message || 'Grant microphone permission and try again.');
    }
  };

  const stopRec = async () => {
    if (!recording) return;
    try {
      const ctrl = recording;
      setRecording(null);
      if (elapsedTimer.current) clearInterval(elapsedTimer.current);
      await ctrl.stop();
      reload();
    } catch (e) {
      Alert.alert('Save failed', e?.message || 'Recording could not be saved.');
    }
  };

  const togglePlay = async (note) => {
    try {
      if (playingId === note.id) {
        await soundRef.current?.stopAsync();
        await soundRef.current?.unloadAsync();
        soundRef.current = null;
        setPlayingId(null);
        return;
      }
      // Stop any current sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const sound = await loadSound(note.uri);
      soundRef.current = sound;
      setPlayingId(note.id);
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.didJustFinish) {
          setPlayingId(null);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
      await sound.playAsync();
    } catch (e) {
      Alert.alert('Cannot play', e?.message || 'The file may be missing.');
    }
  };

  const remove = (note) => {
    Alert.alert('Delete voice note?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteVoiceNote(note); reload(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="voice-back">
          <Text style={[text.title, { color: colors.ink }]}>‹</Text>
        </Pressable>
      </View>
      <ScreenHeader
        eyebrow="The way your voice sounds today"
        title="Voice Notes"
        subtitle="Whisper a thought. Sing a lullaby. The phone keeps it safe."
      />

      {/* Recorder */}
      <View
        style={[
          {
            marginHorizontal: spacing.lg,
            marginBottom: spacing.lg,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: recording ? colors.terracotta : colors.card,
            borderWidth: 1,
            borderColor: recording ? colors.terracotta : colors.edge,
          },
          shadows.card,
        ]}
      >
        <Text style={[text.caption, { color: recording ? colors.paper : colors.terracotta, marginBottom: 6 }]}>
          {recording ? 'Recording…' : 'Tap to record'}
        </Text>
        <Text style={[text.title, { color: recording ? colors.paper : colors.ink }]}>
          {recording ? fmtTime(elapsed) : 'Hold the moment'}
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
          <AuthorPill label="Me" active={author === 'a'} inverted={!!recording} onPress={() => setAuthor('a')} testID="voice-author-a" />
          <AuthorPill label="My partner" active={author === 'b'} inverted={!!recording} onPress={() => setAuthor('b')} testID="voice-author-b" />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          {recording ? (
            <PrimaryButton
              label="Stop & save"
              onPress={stopRec}
              variant="ghost"
              style={{ borderColor: colors.paper }}
              testID="voice-stop"
            />
          ) : (
            <PrimaryButton label="Start recording" onPress={startRec} testID="voice-start" />
          )}
        </View>
      </View>

      {list.length === 0 ? (
        <EmptyState
          title="No voice notes yet."
          body="A 10-second hello, an apology that needed to be heard, a song you wrote in the car — your voice belongs in this story too."
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => {
            const isPlaying = playingId === item.id;
            return (
              <View
                style={[
                  {
                    marginBottom: spacing.md,
                    padding: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: colors.card,
                    borderLeftWidth: 3,
                    borderLeftColor: colors.sage,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                  },
                  shadows.card,
                ]}
              >
                <Pressable
                  onPress={() => togglePlay(item)}
                  testID={`voice-play-${item.id}`}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isPlaying ? colors.terracotta : colors.ink,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.paper, fontSize: 18 }}>{isPlaying ? '■' : '▶'}</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={[text.body, { color: colors.ink, fontWeight: '600' }]} numberOfLines={1}>
                    {item.label || 'Voice note'}
                  </Text>
                  <Text style={[text.caption, { color: colors.inkFaint }]}>
                    {fmtTime(Math.round(item.duration || 0))} · {formatLongDate(item.createdAt)} {item.authorName ? `· ${item.authorName}` : ''}
                  </Text>
                </View>
                <Pressable onPress={() => remove(item)} hitSlop={8} testID={`voice-delete-${item.id}`}>
                  <Text style={{ color: colors.inkFaint, fontSize: 18 }}>×</Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function AuthorPill({ label, active, onPress, inverted, testID }) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        borderWidth: 1.2,
        borderColor: active ? (inverted ? colors.paper : colors.ink) : (inverted ? 'rgba(255,255,255,0.4)' : colors.edge),
        backgroundColor: active ? (inverted ? colors.paper : colors.ink) : 'transparent',
      }}
    >
      <Text style={[text.caption, {
        color: active
          ? (inverted ? colors.ink : colors.paper)
          : (inverted ? colors.paper : colors.ink),
        fontWeight: '700',
      }]}>{label}</Text>
    </Pressable>
  );
}

function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
