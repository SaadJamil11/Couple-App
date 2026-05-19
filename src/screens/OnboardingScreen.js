import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme/colors';
import { text } from '../theme/typography';
import { saveProfile } from '../services/storage';
import PrimaryButton from '../components/PrimaryButton';

// Onboarding — set both partners' names, anchor date, and a relationship
// title. Local-only, no Google or Firebase required to get started.
export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [partnerA, setA] = useState('');
  const [partnerB, setB] = useState('');
  const [startDate, setStart] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    setLoading(true);
    await saveProfile({
      partnerA: partnerA.trim() || 'Partner A',
      partnerB: partnerB.trim() || 'Partner B',
      startDate: startDate || new Date().toISOString().slice(0, 10),
      title: title.trim() || 'Us',
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
    navigation.replace('Main');
  };

  return (
    <LinearGradient
      colors={[colors.paper, colors.paperDeep]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[text.caption, { color: colors.terracotta, marginBottom: 8 }]}>
              Tethered · A relationship, kept
            </Text>
            <Text style={[text.displayXL, { color: colors.ink, marginBottom: spacing.lg }]}>
              Two people.{'\n'}One quiet shelf{'\n'}for everything.
            </Text>

            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: radius.lg,
                padding: spacing.lg,
                marginTop: spacing.lg,
                borderWidth: 1,
                borderColor: colors.edge,
              }}
            >
              <Text style={[text.caption, { color: colors.inkFaint, marginBottom: spacing.md }]}>
                Step {step + 1} of 4
              </Text>

              {step === 0 ? (
                <Field
                  label="What\u2019s your name?"
                  placeholder="e.g. Asha"
                  value={partnerA}
                  onChange={setA}
                  testID="onboard-partnerA"
                  autoFocus
                />
              ) : null}
              {step === 1 ? (
                <Field
                  label="And your partner\u2019s?"
                  placeholder="e.g. Rohan"
                  value={partnerB}
                  onChange={setB}
                  testID="onboard-partnerB"
                  autoFocus
                />
              ) : null}
              {step === 2 ? (
                <Field
                  label="When did your story begin?"
                  placeholder="YYYY-MM-DD"
                  value={startDate}
                  onChange={setStart}
                  testID="onboard-startdate"
                  autoFocus
                />
              ) : null}
              {step === 3 ? (
                <Field
                  label="A nickname for the two of you"
                  placeholder="e.g. Asha & Rohan"
                  value={title}
                  onChange={setTitle}
                  testID="onboard-title"
                  autoFocus
                />
              ) : null}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, gap: spacing.sm }}>
                <PrimaryButton
                  label="Back"
                  variant="ghost"
                  onPress={back}
                  disabled={step === 0}
                  testID="onboard-back"
                  style={{ flex: 1 }}
                />
                {step < 3 ? (
                  <PrimaryButton
                    label="Continue"
                    onPress={next}
                    testID="onboard-next"
                    style={{ flex: 1 }}
                  />
                ) : (
                  <PrimaryButton
                    label="Begin"
                    onPress={finish}
                    loading={loading}
                    testID="onboard-finish"
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </View>

            <Text style={[text.bodySmall, { color: colors.inkFaint, marginTop: spacing.xl, fontStyle: 'italic' }]}>
              Everything you write here stays on this phone. Cloud sync is optional, and you can turn it on later from Settings.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Field({ label, placeholder, value, onChange, testID, autoFocus }) {
  return (
    <View>
      <Text style={[text.body, { color: colors.ink, marginBottom: 10, fontWeight: '600' }]}>
        {label}
      </Text>
      <TextInput
        testID={testID}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        value={value}
        onChangeText={onChange}
        autoFocus={autoFocus}
        style={{
          fontSize: 18,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: radius.md,
          backgroundColor: colors.paper,
          color: colors.ink,
          borderWidth: 1,
          borderColor: colors.edge,
        }}
      />
    </View>
  );
}
