import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { AskResult } from '../src/lib/api';
import { askAssistant } from '../src/lib/api';
import { colors } from '../src/theme/colors';
import { spacing, typography } from '../src/theme/typography';

/** Assistant: posts to /api/ai/ask, shows a grounded answer + citations, and
 * always makes the "health/safety questions go to a human" promise visible. */
export default function AssistantScreen() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }
    setLoading(true);
    setError(null);
    setAnswer(null);

    const result = await askAssistant(trimmed);
    if (result.ok) {
      setAnswer(result.data);
    } else if (result.error.includes('401')) {
      setError(
        'The assistant needs you to be signed in. Please sign in and try again.',
      );
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title} accessibilityRole="header">
        A guide, not an answer key
      </Text>
      <Text style={styles.lead}>
        Ask about how to think through a stage of development. Answers are
        grounded in the curriculum and cite their sources.
      </Text>

      <View style={styles.reassurance}>
        <Text style={styles.reassuranceText}>
          This assistant supports you — it never replaces parents, teachers, or
          doctors. Health, safety, and wellbeing questions are routed to a real
          person and professional help.
        </Text>
      </View>

      <Text style={styles.label} accessibilityRole="header">
        Your question
      </Text>
      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="e.g. How can I support curiosity at age four?"
        placeholderTextColor={colors.textMuted}
        multiline
        accessibilityLabel="Your question for the assistant"
      />

      <Pressable
        onPress={ask}
        disabled={loading || question.trim().length === 0}
        accessibilityRole="button"
        accessibilityLabel="Ask the assistant"
        accessibilityState={{ disabled: loading || question.trim().length === 0 }}
        style={[
          styles.button,
          (loading || question.trim().length === 0) && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Asking…' : 'Ask'}
        </Text>
      </Pressable>

      {error ? (
        <View style={styles.errorPanel}>
          <Text style={styles.errorHeading} accessibilityRole="header">
            We could not get an answer
          </Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {answer ? (
        <View style={styles.answerBlock}>
          {answer.routedToHuman ? (
            <View style={styles.routed} accessibilityRole="alert">
              <Text style={styles.routedHeading}>
                Routed to a human
              </Text>
              <Text style={styles.routedText}>
                This looks like a health, safety, or wellbeing question, so it is
                best answered by a trusted person or professional. Please reach
                out to someone who can help in person.
              </Text>
            </View>
          ) : null}

          <Text style={styles.answerHeading} accessibilityRole="header">
            Answer
          </Text>
          <Text style={styles.answerText}>{answer.answer}</Text>

          {answer.citations.length > 0 ? (
            <View style={styles.citations}>
              <Text style={styles.citationsHeading} accessibilityRole="header">
                Sources
              </Text>
              {answer.citations.map((citation, idx) => (
                <View
                  key={`${citation.phaseId}-${idx}`}
                  style={styles.citationRow}
                  accessibilityRole="text"
                >
                  <Text style={styles.citationPhase}>{citation.phaseId}</Text>
                  <Text style={styles.citationText}>{citation.citation}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  lead: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: typography.lineHeight,
    marginBottom: spacing.md,
  },
  reassurance: {
    backgroundColor: colors.accentSurface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  reassuranceText: {
    fontSize: typography.body,
    color: colors.accent,
    lineHeight: typography.lineHeight,
  },
  label: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.primaryContrast,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
  },
  errorPanel: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  errorHeading: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.body,
    color: colors.error,
    lineHeight: typography.lineHeight,
  },
  answerBlock: {
    marginTop: spacing.lg,
  },
  routed: {
    backgroundColor: colors.accentSurface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  routedHeading: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  routedText: {
    fontSize: typography.body,
    color: colors.accent,
    lineHeight: typography.lineHeight,
  },
  answerHeading: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  answerText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.lineHeight,
  },
  citations: {
    marginTop: spacing.md,
  },
  citationsHeading: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  citationRow: {
    marginBottom: spacing.sm,
  },
  citationPhase: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  citationText: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: typography.lineHeight,
  },
});
