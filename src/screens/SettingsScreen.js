import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, Alert, TextInput, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';
import {
  useGoogleAuth, persistAuthResponse, signOutGoogle, getStoredGoogle, isAccessTokenValid,
} from '../services/googleAuth';
import {
  getProfile, clearProfile, getSyncPair, setSyncPair,
} from '../services/storage';
import {
  firebaseAvailable, pushSnapshot, pullSnapshot,
} from '../services/firebaseSync';
import { exportAsText, importFromText, generatePairingCode, getDeviceLabel } from '../services/peerSync';

// expo-clipboard isn't in the original deps; soft-fallback if missing.
async function copy(value) {
  try {
    if (Clipboard?.setStringAsync) await Clipboard.setStringAsync(value);
  } catch {/* clipboard optional */}
}

// "Us" tab — auth, sync, profile, danger zone.
export default function SettingsScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [google, setGoogle] = useState(null);
  const [pair, setPair] = useState(null);
  const [importing, setImporting] = useState('');
  const [syncing, setSyncing] = useState(false);
  const { enabled: googleEnabled, request, response, promptAsync } = useGoogleAuth();

  const reload = useCallback(async () => {
    const [p, g, sp] = await Promise.all([getProfile(), getStoredGoogle(), getSyncPair()]);
    setProfile(p);
    setGoogle(g);
    setPair(sp);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  useEffect(() => {
    if (response?.type === 'success') {
      (async () => {
        const tokens = await persistAuthResponse(response);
        setGoogle(tokens);
        Alert.alert('Signed in', `Welcome, ${tokens?.user?.name || 'friend'}. Google Calendar is now connected.`);
      })();
    }
  }, [response]);

  const signOut = async () => {
    await signOutGoogle();
    setGoogle(null);
  };

  const startPair = async () => {
    const code = generatePairingCode();
    const deviceLabel = await getDeviceLabel();
    await setSyncPair({ code, deviceLabel });
    setPair({ code, deviceLabel });
    Alert.alert(
      'Your code',
      `${code}\n\nTell your partner to open Settings → Sync → "Use existing code" and type this exactly. Both devices will then share through the same vault.`,
      [
        { text: 'Copy', onPress: () => copy(code) },
        { text: 'OK' },
      ],
    );
  };

  const useExistingCode = () => {
    let entered = '';
    Alert.prompt
      ? Alert.prompt(
          'Enter shared code',
          'The same code your partner generated on their phone.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save',
              onPress: async (val) => {
                if (!val) return;
                const deviceLabel = await getDeviceLabel();
                await setSyncPair({ code: val.trim().toUpperCase(), deviceLabel });
                setPair({ code: val.trim().toUpperCase(), deviceLabel });
                Alert.alert('Linked', 'You\u2019re paired. Tap "Sync now" to fetch your partner\u2019s side.');
              },
            },
          ],
          'plain-text',
        )
      : Alert.alert('Type your code below', 'Paste the code in the Sync code input box and tap Save.');
  };

  const syncNow = async (direction) => {
    if (!firebaseAvailable()) {
      Alert.alert('Cloud sync off', 'Add your Firebase keys to .env (see README) to enable cloud sync. Manual export still works offline.');
      return;
    }
    if (!pair?.code) {
      Alert.alert('Pair first', 'Generate or enter a code under "Sync".');
      return;
    }
    setSyncing(true);
    try {
      const result = direction === 'push' ? await pushSnapshot() : await pullSnapshot();
      Alert.alert(direction === 'push' ? 'Sent' : 'Received', result?.found === false ? 'Nothing on the other side yet.' : 'Done.');
    } catch (e) {
      Alert.alert('Sync failed', e?.message || 'Check your connection and Firebase config.');
    } finally {
      setSyncing(false);
    }
  };

  const exportText = async () => {
    const blob = await exportAsText();
    await Share.share({ message: `Tethered backup:\n\n${blob}` });
  };

  const importText = async () => {
    if (!importing.trim()) return;
    try {
      await importFromText(importing);
      Alert.alert('Imported', 'Your partner\u2019s data has been merged in.');
      setImporting('');
    } catch (e) {
      Alert.alert('Could not import', e?.message || 'Make sure the whole code was pasted.');
    }
  };

  const resetAll = () => {
    Alert.alert(
      'Reset everything?',
      'This wipes the profile and onboarding. Your photos and memories stay until you remove them too.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => { await clearProfile(); navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }); },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <ScreenHeader
          eyebrow="Account · Sync · Connections"
          title={profile?.title || 'Us'}
          subtitle={profile ? `${profile.partnerA} & ${profile.partnerB}` : ''}
        />

        {/* Google */}
        <Section title="Google">
          {google?.user ? (
            <Row label={`Signed in as ${google.user.email}`} testID="google-row">
              <PrimaryButton label="Sign out" variant="ghost" onPress={signOut} testID="google-signout" />
            </Row>
          ) : googleEnabled ? (
            <Row label="Connect to Google Calendar">
              <PrimaryButton
                label="Sign in"
                onPress={() => promptAsync()}
                disabled={!request}
                testID="google-signin"
              />
            </Row>
          ) : (
            <Text style={[text.bodySmall, { color: colors.inkFaint, fontStyle: 'italic' }]}>
              Add EXPO_PUBLIC_GOOGLE_*_CLIENT_ID values to .env to enable Google sign-in.
              See README for the 4-minute setup. Until then, the app works fully offline.
            </Text>
          )}
          {google && !isAccessTokenValid(google) ? (
            <Text style={[text.caption, { color: colors.danger, marginTop: spacing.sm }]}>
              Session expired — sign in again to refresh.
            </Text>
          ) : null}
        </Section>

        {/* Sync */}
        <Section title="Sync with your partner">
          <Text style={[text.bodySmall, { color: colors.inkSoft, marginBottom: spacing.md }]}>
            {firebaseAvailable()
              ? 'Cloud sync is set up. Use the same code on both phones.'
              : 'Cloud sync is optional. Without Firebase keys you can still share data manually below.'}
          </Text>
          {pair?.code ? (
            <Row label={`Code: ${pair.code}`} testID="pair-row">
              <PrimaryButton label="Copy" variant="ghost" onPress={() => copy(pair.code)} testID="pair-copy" />
            </Row>
          ) : null}
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <PrimaryButton label="Generate code" variant="ghost" onPress={startPair} testID="sync-generate" />
            <PrimaryButton label="Use existing code" variant="ghost" onPress={useExistingCode} testID="sync-enter" />
          </View>
          {firebaseAvailable() ? (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
              <PrimaryButton label="Push my side" onPress={() => syncNow('push')} loading={syncing} testID="sync-push" />
              <PrimaryButton label="Pull partner\u2019s side" variant="ghost" onPress={() => syncNow('pull')} loading={syncing} testID="sync-pull" />
            </View>
          ) : null}
        </Section>

        {/* Manual share */}
        <Section title="Manual share (no internet needed)">
          <Text style={[text.bodySmall, { color: colors.inkSoft, marginBottom: spacing.md }]}>
            Send a backup of your side to your partner over any chat app. They paste it below to merge.
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <PrimaryButton label="Export my side" onPress={exportText} testID="export-text" />
          </View>
          <TextInput
            value={importing}
            onChangeText={setImporting}
            placeholder="Paste a backup code here…"
            placeholderTextColor={colors.inkFaint}
            multiline
            testID="import-input"
            style={{
              marginTop: spacing.md,
              minHeight: 90,
              padding: 12,
              backgroundColor: colors.card,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.edge,
              color: colors.ink,
              textAlignVertical: 'top',
            }}
          />
          <PrimaryButton
            label="Import"
            variant="ghost"
            onPress={importText}
            disabled={!importing.trim()}
            testID="import-btn"
            style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
          />
        </Section>

        {/* Profile */}
        <Section title="Profile">
          {profile ? (
            <View>
              <Text style={[text.body, { color: colors.ink }]}>{profile.partnerA} & {profile.partnerB}</Text>
              <Text style={[text.bodySmall, { color: colors.inkSoft }]}>Together since {profile.startDate}</Text>
            </View>
          ) : null}
          <PrimaryButton label="Reset and start over" variant="ghost" onPress={resetAll} testID="reset-all" style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
        </Section>

        <Text style={[text.caption, { color: colors.inkFaint, textAlign: 'center', marginTop: spacing.lg }]}>
          Tethered · made for two
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View
      style={[
        {
          marginHorizontal: spacing.lg,
          marginBottom: spacing.lg,
          padding: spacing.lg,
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.edge,
        },
        shadows.card,
      ]}
    >
      <Text style={[text.caption, { color: colors.terracotta, marginBottom: spacing.md }]}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children, testID }) {
  return (
    <View
      testID={testID}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        flexWrap: 'wrap',
        gap: spacing.sm,
      }}
    >
      <Text style={[text.body, { color: colors.ink, flexShrink: 1 }]}>{label}</Text>
      {children}
    </View>
  );
}
