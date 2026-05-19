// Local-first storage. Everything lives in AsyncStorage as JSON arrays —
// simple, robust, works fully offline. Photos themselves stay in the OS
// media library; we only persist URIs + metadata.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { uuid } from '../utils/uuid';

const K = {
  profile: '@tethered:profile',
  memories: '@tethered:memories',
  occasions: '@tethered:occasions',
  letters: '@tethered:letters',
  blackbox: '@tethered:blackbox',
  moods: '@tethered:moods',
  chats: '@tethered:chats',
  voiceNotes: '@tethered:voicenotes',
  quizScores: '@tethered:quizscores',
  selectedPhotos: '@tethered:selectedphotos',
  googleTokens: '@tethered:googletokens',
  firebaseConfig: '@tethered:firebaseconfig',
  syncPair: '@tethered:syncpair',
};

async function readList(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function writeList(key, list) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
  return list;
}

// ----- Profile -----
export async function getProfile() {
  const raw = await AsyncStorage.getItem(K.profile);
  return raw ? JSON.parse(raw) : null;
}
export async function saveProfile(p) {
  await AsyncStorage.setItem(K.profile, JSON.stringify(p));
  return p;
}
export async function clearProfile() {
  await AsyncStorage.removeItem(K.profile);
}

// ----- Generic list CRUD factory -----
function makeCrud(key) {
  return {
    list: () => readList(key),
    add: async (item) => {
      const list = await readList(key);
      const next = { id: uuid(), createdAt: new Date().toISOString(), ...item };
      list.push(next);
      await writeList(key, list);
      return next;
    },
    update: async (id, patch) => {
      const list = await readList(key);
      const idx = list.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
      await writeList(key, list);
      return list[idx];
    },
    remove: async (id) => {
      const list = await readList(key);
      const next = list.filter((x) => x.id !== id);
      await writeList(key, next);
      return next;
    },
    replaceAll: (items) => writeList(key, items),
  };
}

export const memories = makeCrud(K.memories);
export const occasions = makeCrud(K.occasions);
export const letters = makeCrud(K.letters);
export const blackbox = makeCrud(K.blackbox);
export const moods = makeCrud(K.moods);
export const chats = makeCrud(K.chats);
export const voiceNotes = makeCrud(K.voiceNotes);
export const quizScores = makeCrud(K.quizScores);

// ----- Selected photo IDs from device library -----
export async function getSelectedPhotoIds() {
  return readList(K.selectedPhotos);
}
export async function setSelectedPhotoIds(ids) {
  return writeList(K.selectedPhotos, ids);
}

// ----- Google tokens (kept here for simplicity; SecureStore could be swapped later) -----
export async function saveGoogleTokens(tokens) {
  await AsyncStorage.setItem(K.googleTokens, JSON.stringify(tokens));
}
export async function getGoogleTokens() {
  const raw = await AsyncStorage.getItem(K.googleTokens);
  return raw ? JSON.parse(raw) : null;
}
export async function clearGoogleTokens() {
  await AsyncStorage.removeItem(K.googleTokens);
}

// ----- Sync pairing -----
export async function getSyncPair() {
  const raw = await AsyncStorage.getItem(K.syncPair);
  return raw ? JSON.parse(raw) : null;
}
export async function setSyncPair(p) {
  await AsyncStorage.setItem(K.syncPair, JSON.stringify(p));
}

// ----- Export / Import (for manual sharing or backup) -----
export async function exportAll() {
  const [profile, m, o, l, b, mo, c, v, q, photos] = await Promise.all([
    getProfile(),
    memories.list(), occasions.list(), letters.list(),
    blackbox.list(), moods.list(), chats.list(),
    voiceNotes.list(), quizScores.list(),
    getSelectedPhotoIds(),
  ]);
  return {
    schema: 'tethered/v1',
    exportedAt: new Date().toISOString(),
    profile,
    memories: m,
    occasions: o,
    letters: l,
    blackbox: b,
    moods: mo,
    chats: c,
    voiceNotes: v,
    quizScores: q,
    selectedPhotos: photos,
  };
}

export async function importAll(payload) {
  if (!payload || payload.schema !== 'tethered/v1') {
    throw new Error('Unrecognised backup format');
  }
  if (payload.profile) await saveProfile(payload.profile);
  await Promise.all([
    memories.replaceAll(payload.memories || []),
    occasions.replaceAll(payload.occasions || []),
    letters.replaceAll(payload.letters || []),
    blackbox.replaceAll(payload.blackbox || []),
    moods.replaceAll(payload.moods || []),
    chats.replaceAll(payload.chats || []),
    voiceNotes.replaceAll(payload.voiceNotes || []),
    quizScores.replaceAll(payload.quizScores || []),
    setSelectedPhotoIds(payload.selectedPhotos || []),
  ]);
}
