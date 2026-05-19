// Voice-note recording + playback with expo-av. Files persist in
// FileSystem.documentDirectory/voice/<uuid>.m4a so they survive app
// restarts and can be exported / synced with the rest of the vault.

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { uuid } from '../utils/uuid';
import { voiceNotes, getProfile } from './storage';

const VOICE_DIR = `${FileSystem.documentDirectory}voice/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(VOICE_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(VOICE_DIR, { intermediates: true });
}

export async function requestMicPermission() {
  const res = await Audio.requestPermissionsAsync();
  return res.status === 'granted';
}

// Start a new recording. Returns a controller with .stop() that resolves
// with the saved voice-note record.
export async function startRecording({ author = 'a', label = '' } = {}) {
  const granted = await requestMicPermission();
  if (!granted) throw new Error('Microphone permission denied');

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  const startedAt = Date.now();

  return {
    recording,
    async stop() {
      try { await recording.stopAndUnloadAsync(); } catch { /* already stopped */ }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });

      const tmpUri = recording.getURI();
      if (!tmpUri) throw new Error('Recording failed (no URI)');

      await ensureDir();
      const id = uuid();
      const dest = `${VOICE_DIR}${id}.m4a`;
      await FileSystem.copyAsync({ from: tmpUri, to: dest });
      const duration = (Date.now() - startedAt) / 1000;

      const profile = await getProfile();
      const authorName = author === 'a' ? profile?.partnerA : profile?.partnerB;

      const saved = await voiceNotes.add({
        id, // overrides storage's auto-id so file <-> record line up
        uri: dest,
        duration,
        author,
        authorName,
        label: label || `Voice note · ${new Date().toLocaleString()}`,
      });
      return saved;
    },
    async cancel() {
      try { await recording.stopAndUnloadAsync(); } catch { /* already stopped */ }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    },
  };
}

// Simple play / stop helper. Caller owns the lifecycle.
export async function loadSound(uri) {
  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
  return sound;
}

export async function deleteVoiceNote(note) {
  try { await FileSystem.deleteAsync(note.uri, { idempotent: true }); } catch { /* file gone */ }
  await voiceNotes.remove(note.id);
}
