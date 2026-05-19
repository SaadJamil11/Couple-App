import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { getProfile } from './src/services/storage';
import { colors } from './src/theme/colors';

// Top-level app shell. We decide the initial route based on whether the
// couple has completed onboarding (saved a profile in AsyncStorage).
export default function App() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Onboarding');

  const bootstrap = useCallback(async () => {
    try {
      const profile = await getProfile();
      setInitialRoute(profile?.partnerA && profile?.partnerB ? 'Main' : 'Onboarding');
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.terracotta} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator initialRoute={initialRoute} />
    </>
  );
}
