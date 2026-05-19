// Google Sign-In via expo-auth-session. No backend, no server callbacks.
// We hold the access_token in AsyncStorage. When it expires we re-prompt
// the user — this avoids storing client_secret on-device (which OAuth
// best practice forbids for installed apps).

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getGoogleTokens, saveGoogleTokens, clearGoogleTokens } from './storage';

WebBrowser.maybeCompleteAuthSession();

const SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar',
];

// React hook wrapper. Components call useGoogleAuth() to get
// { request, promptAsync, signOut, user, tokens }.
export function useGoogleAuth() {
  // Pull client IDs from EXPO_PUBLIC_* env. Missing IDs leave the hook
  // disabled rather than crashing — Google is optional.
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;

  const enabled = Boolean(iosClientId || androidClientId || webClientId || expoClientId);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId,
    androidClientId,
    webClientId,
    expoClientId,
    scopes: SCOPES,
  });

  return { enabled, request, response, promptAsync };
}

export async function persistAuthResponse(response) {
  if (!response || response.type !== 'success') return null;
  const { authentication } = response;
  if (!authentication?.accessToken) return null;

  // Fetch user profile so we can show name/email in settings.
  const me = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${authentication.accessToken}` },
  }).then((r) => r.json()).catch(() => null);

  const tokens = {
    accessToken: authentication.accessToken,
    idToken: authentication.idToken,
    issuedAt: Date.now(),
    expiresIn: authentication.expiresIn,
    scope: authentication.scope,
    user: me ? { id: me.id, email: me.email, name: me.name, picture: me.picture } : null,
  };

  await saveGoogleTokens(tokens);
  return tokens;
}

export async function getStoredGoogle() {
  return getGoogleTokens();
}

export async function signOutGoogle() {
  await clearGoogleTokens();
}

export function isAccessTokenValid(tokens) {
  if (!tokens?.accessToken) return false;
  if (!tokens.expiresIn) return true;
  const expiry = (tokens.issuedAt || 0) + tokens.expiresIn * 1000;
  return Date.now() < expiry - 30_000;
}
