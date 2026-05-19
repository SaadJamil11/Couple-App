// Firebase sync — fully optional. The app is local-first; if the user
// hasn't configured Firebase, all calls become no-ops. When configured,
// we mirror the local AsyncStorage state to a single Firestore doc
// keyed by the shared "couple code", letting the two partners exchange
// their snapshots over the network.

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { exportAll, importAll, getSyncPair } from './storage';

function readConfig() {
  const cfg = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  if (!cfg.apiKey || !cfg.projectId) return null;
  return cfg;
}

let app = null;
let db = null;

export function firebaseAvailable() {
  return readConfig() !== null;
}

function ensure() {
  if (!firebaseAvailable()) return null;
  if (!app) {
    app = getApps()[0] || initializeApp(readConfig());
    db = getFirestore(app);
  }
  return db;
}

// "Couple code" is a 6-character shared secret the two partners both
// enter on their devices. It becomes the Firestore document ID.
export async function pushSnapshot() {
  const database = ensure();
  if (!database) return { skipped: true };
  const pair = await getSyncPair();
  if (!pair?.code) return { skipped: true };
  const payload = await exportAll();
  await setDoc(doc(database, 'couples', pair.code), {
    ...payload,
    syncedAt: serverTimestamp(),
    lastDevice: pair.deviceLabel || 'unknown',
  });
  return { skipped: false };
}

export async function pullSnapshot() {
  const database = ensure();
  if (!database) return { skipped: true };
  const pair = await getSyncPair();
  if (!pair?.code) return { skipped: true };
  const snap = await getDoc(doc(database, 'couples', pair.code));
  if (!snap.exists()) return { skipped: false, found: false };
  await importAll(snap.data());
  return { skipped: false, found: true };
}

export function subscribePartnerUpdates(onUpdate) {
  const database = ensure();
  if (!database) return () => {};
  let pairRef = null;
  let cancelled = false;

  (async () => {
    const pair = await getSyncPair();
    if (cancelled || !pair?.code) return;
    pairRef = onSnapshot(doc(database, 'couples', pair.code), (snap) => {
      if (snap.exists()) onUpdate(snap.data());
    });
  })();

  return () => {
    cancelled = true;
    if (pairRef) pairRef();
  };
}
