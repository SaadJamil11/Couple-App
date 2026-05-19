// Peer-to-peer sync over local Wi-Fi. We expose a tiny HTTP-style
// handshake using fetch + a discoverable code. For Expo Go we cannot
// open arbitrary TCP sockets, so instead we use the simpler approach:
// the user reads aloud / messages a short pairing code, and both
// devices use Firebase as a postbox. If Firebase isn't configured
// the user can manually export/import a JSON file instead.
//
// This module exposes the helpers used by the Settings screen.
import * as Network from 'expo-network';
import { exportAll, importAll } from './storage';

export async function getDeviceLabel() {
  try {
    const ip = await Network.getIpAddressAsync();
    return `device-${(ip || '').split('.').pop() || 'local'}`;
  } catch {
    return 'device-local';
  }
}

// Generate a short, friendly pairing code (e.g. "MOONLIT-739").
const WORDS = [
  'MOONLIT', 'EMBER', 'VELVET', 'AURORA', 'HARBOR', 'CINDER',
  'WILLOW', 'SAFFRON', 'GOLDEN', 'INDIGO', 'CORAL', 'LANTERN',
];
export function generatePairingCode() {
  const w = WORDS[Math.floor(Math.random() * WORDS.length)];
  const n = Math.floor(100 + Math.random() * 900);
  return `${w}-${n}`;
}

// Serialise the whole vault to a base64 string the user can share via
// any chat app. The receiving partner pastes it into Settings → Import.
export async function exportAsText() {
  const data = await exportAll();
  const json = JSON.stringify(data);
  // base64 — kept simple, no extra deps.
  return globalThis.btoa
    ? globalThis.btoa(unescape(encodeURIComponent(json)))
    : Buffer.from(json, 'utf8').toString('base64');
}

export async function importFromText(text) {
  const decoded = globalThis.atob
    ? decodeURIComponent(escape(globalThis.atob(text.trim())))
    : Buffer.from(text.trim(), 'base64').toString('utf8');
  const payload = JSON.parse(decoded);
  await importAll(payload);
  return payload;
}
