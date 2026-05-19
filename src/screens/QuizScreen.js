import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';
import ScreenHeader from '../components/ScreenHeader';
import { QUIZ_PACKS } from '../data/quizQuestions';

const PACK_TONES = {
  terracotta: { bg: '#F6D7C7', accent: colors.terracottaDeep },
  sage: { bg: '#E6EFE3', accent: colors.sageDeep },
  honey: { bg: '#F7EAC8', accent: '#8A6620' },
};

// Quiz home — choose a pack, then pick a play mode in QuizPlay.
export default function QuizScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="quiz-back">
          <Text style={[text.title, { color: colors.ink }]}>‹</Text>
        </Pressable>
      </View>
      <ScreenHeader
        eyebrow="How well do we know each other?"
        title="Couple Quiz"
        subtitle="Not a test. A way to start the conversation."
      />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        <View
          style={{
            marginHorizontal: spacing.lg,
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.ink,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={[text.caption, { color: colors.honey, marginBottom: 6 }]}>How it works</Text>
          <Text style={[text.body, { color: colors.paper }]}>
            One partner answers. The other grades. Then trade places. Every round opens something
            small you didn\u2019t know to ask.
          </Text>
        </View>
        {QUIZ_PACKS.map((pack) => {
          const tone = PACK_TONES[pack.accent] || PACK_TONES.terracotta;
          return (
            <Pressable
              key={pack.id}
              onPress={() => navigation.navigate('QuizPlay', { packId: pack.id })}
              testID={`pack-${pack.id}`}
              style={({ pressed }) => [
                {
                  marginHorizontal: spacing.lg,
                  marginBottom: spacing.md,
                  padding: spacing.lg,
                  borderRadius: radius.lg,
                  backgroundColor: tone.bg,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
                shadows.card,
              ]}
            >
              <Text style={[text.caption, { color: tone.accent, marginBottom: 6 }]}>
                {pack.questions.length} questions
              </Text>
              <Text style={[text.title, { color: colors.ink, marginBottom: 4 }]}>{pack.title}</Text>
              <Text style={[text.body, { color: colors.inkSoft }]}>{pack.subtitle}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
