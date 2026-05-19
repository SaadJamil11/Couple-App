import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme/colors';
import { text } from '../theme/typography';
import PrimaryButton from '../components/PrimaryButton';
import { QUIZ_PACKS } from '../data/quizQuestions';
import { quizScores, getProfile } from '../services/storage';

// QuizPlay: pass-the-phone gameplay. Partner A answers each question
// blind. Partner B then sees the answer and rates 0–3 hearts. We tally
// and save a score so it appears in stats later.
export default function QuizPlayScreen({ route, navigation }) {
  const { packId } = route.params;
  const pack = useMemo(() => QUIZ_PACKS.find((p) => p.id === packId), [packId]);
  const questions = pack?.questions || [];

  const [phase, setPhase] = useState('intro'); // intro | answering | grading | done
  const [answers, setAnswers] = useState({});
  const [grades, setGrades] = useState({});
  const [idx, setIdx] = useState(0);

  if (!pack) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
        <Text style={[text.body, { color: colors.ink, padding: spacing.lg }]}>Pack not found.</Text>
      </SafeAreaView>
    );
  }

  const q = questions[idx];

  const submitAnswer = (textValue) => {
    setAnswers((a) => ({ ...a, [q.id]: textValue }));
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else {
      setIdx(0);
      setPhase('grading');
    }
  };

  const gradeAnswer = (n) => {
    setGrades((g) => ({ ...g, [q.id]: n }));
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else finish({ ...grades, [q.id]: n });
  };

  const finish = async (finalGrades) => {
    const total = Object.values(finalGrades).reduce((s, v) => s + v, 0);
    const max = questions.length * 3;
    const profile = await getProfile();
    await quizScores.add({
      packId: pack.id,
      packTitle: pack.title,
      score: total,
      max,
      answers,
      grades: finalGrades,
      partnerA: profile?.partnerA,
      partnerB: profile?.partnerB,
    });
    setPhase('done');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="qp-back">
            <Text style={[text.title, { color: colors.ink, marginBottom: spacing.md }]}>‹</Text>
          </Pressable>
          <Text style={[text.caption, { color: colors.terracotta, marginBottom: 6 }]}>{pack.title}</Text>

          {phase === 'intro' ? (
            <Intro pack={pack} onStart={() => setPhase('answering')} />
          ) : null}

          {phase === 'answering' ? (
            <Answering
              q={q}
              idx={idx}
              total={questions.length}
              onSubmit={submitAnswer}
            />
          ) : null}

          {phase === 'grading' ? (
            <Grading
              q={q}
              answer={answers[q.id]}
              idx={idx}
              total={questions.length}
              onGrade={gradeAnswer}
            />
          ) : null}

          {phase === 'done' ? (
            <Done
              pack={pack}
              questions={questions}
              answers={answers}
              grades={grades}
              onClose={() => navigation.goBack()}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Intro({ pack, onStart }) {
  return (
    <View>
      <Text style={[text.display, { color: colors.ink, marginBottom: spacing.md }]}>
        Pass the phone.
      </Text>
      <Text style={[text.body, { color: colors.inkSoft, marginBottom: spacing.lg }]}>
        Partner A: answer all {pack.questions.length} questions on your own.
        Then hand the phone to Partner B and let them grade your answers, 0 – 3 hearts each.
      </Text>
      <PrimaryButton label="I\u2019m ready" onPress={onStart} testID="qp-start" />
    </View>
  );
}

function Answering({ q, idx, total, onSubmit }) {
  const [val, setVal] = useState('');
  return (
    <View>
      <Text style={[text.caption, { color: colors.inkFaint, marginBottom: 6 }]}>
        Question {idx + 1} of {total} · Partner A
      </Text>
      <Text style={[text.title, { color: colors.ink, marginBottom: spacing.md }]}>{q.text}</Text>
      <TextInput
        value={val}
        onChangeText={setVal}
        placeholder="Your honest answer…"
        placeholderTextColor={colors.inkFaint}
        multiline
        testID={`qp-answer-${q.id}`}
        style={{
          minHeight: 120,
          padding: 14,
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.edge,
          color: colors.ink,
          fontSize: 16,
          textAlignVertical: 'top',
        }}
      />
      <PrimaryButton
        label="Next"
        onPress={() => { onSubmit(val.trim()); setVal(''); }}
        disabled={!val.trim()}
        testID="qp-next"
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );
}

function Grading({ q, answer, idx, total, onGrade }) {
  return (
    <View>
      <Text style={[text.caption, { color: colors.inkFaint, marginBottom: 6 }]}>
        Question {idx + 1} of {total} · Partner B grades
      </Text>
      <Text style={[text.title, { color: colors.ink, marginBottom: spacing.sm }]}>{q.text}</Text>
      <View
        style={{
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.ivory,
          marginBottom: spacing.lg,
          borderLeftWidth: 3,
          borderLeftColor: colors.honey,
        }}
      >
        <Text style={[text.body, { color: colors.ink, fontStyle: 'italic' }]}>“{answer}”</Text>
      </View>
      <Text style={[text.body, { color: colors.ink, fontWeight: '600', marginBottom: spacing.sm }]}>How close?</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {[0, 1, 2, 3].map((n) => (
          <Pressable
            key={n}
            onPress={() => onGrade(n)}
            testID={`qp-grade-${n}`}
            style={{
              flex: 1,
              paddingVertical: 18,
              alignItems: 'center',
              borderRadius: radius.md,
              backgroundColor: n === 0 ? colors.paperDeep : colors.card,
              borderWidth: 1,
              borderColor: colors.edge,
            }}
          >
            <Text style={{ fontSize: 22, color: colors.terracotta }}>{'♥'.repeat(n) || '·'}</Text>
            <Text style={[text.caption, { color: colors.inkFaint, marginTop: 4 }]}>
              {['nope', 'close', 'warm', 'spot on'][n]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Done({ pack, questions, answers, grades, onClose }) {
  const total = Object.values(grades).reduce((s, v) => s + v, 0);
  const max = questions.length * 3;
  const pct = Math.round((total / max) * 100);
  const verdict =
    pct >= 85 ? 'You two see each other clearly.'
    : pct >= 60 ? 'You know each other well — with room to learn.'
    : pct >= 35 ? 'Good news: there\u2019s still so much to discover.'
    : 'A blank canvas. Use the questions as conversation starters.';
  return (
    <View>
      <Text style={[text.display, { color: colors.ink, marginBottom: spacing.md }]}>
        {pct}% in sync.
      </Text>
      <Text style={[text.body, { color: colors.inkSoft, marginBottom: spacing.lg }]}>
        {verdict}
      </Text>
      {questions.map((q) => (
        <View
          key={q.id}
          style={{
            marginBottom: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.card,
            borderRadius: radius.md,
            borderLeftWidth: 3,
            borderLeftColor: colors.sage,
          }}
        >
          <Text style={[text.bodySmall, { color: colors.inkFaint }]}>{q.text}</Text>
          <Text style={[text.body, { color: colors.ink, marginTop: 4, fontStyle: 'italic' }]}>
            “{answers[q.id]}”
          </Text>
          <Text style={[text.caption, { color: colors.terracotta, marginTop: 4 }]}>
            {'♥'.repeat(grades[q.id] || 0) || '·'} — {(grades[q.id] || 0)}/3
          </Text>
        </View>
      ))}
      <PrimaryButton label="Done" onPress={onClose} testID="qp-done" style={{ marginTop: spacing.lg }} />
    </View>
  );
}
