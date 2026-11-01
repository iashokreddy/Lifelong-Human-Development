import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';
import { spacing, typography } from '../src/theme/typography';

/** Home screen: the lifelong journey, the guiding philosophy, and the
 * "supports, never replaces" commitment. */
export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.kicker}>The lifelong journey · 0 → 40+</Text>
      <Text style={styles.title} accessibilityRole="header">
        Grow a torch-bearer, not a follower
      </Text>

      <Text style={styles.lead}>
        A whole-person development companion that spans every stage of life, from
        the first years through adulthood and beyond.
      </Text>

      <View style={styles.philosophyCard}>
        <Text style={styles.philosophyHeading} accessibilityRole="header">
          How we teach
        </Text>
        <Text style={styles.philosophyText}>
          We help people learn how to think, how to question, how to understand
          the world, how to treat people, and how to create something valuable —
          not what to think.
        </Text>
      </View>

      <View style={styles.commitmentCard}>
        <Text style={styles.commitmentHeading} accessibilityRole="header">
          Supports, never replaces
        </Text>
        <Text style={styles.commitmentText}>
          This platform strengthens and never replaces parents, teachers,
          doctors, or human relationships. Health, safety, and wellbeing
          questions always route to a real person and professional help.
        </Text>
      </View>

      <Link
        href="/phases"
        style={styles.primaryButton}
        accessibilityRole="link"
        accessibilityLabel="Explore the phases of the lifelong journey"
      >
        Explore the phases
      </Link>

      <Link
        href="/assistant"
        style={styles.secondaryButton}
        accessibilityRole="link"
        accessibilityLabel="Open the guided assistant"
      >
        Ask the guided assistant
      </Link>
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
  kicker: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  lead: {
    fontSize: typography.bodyLarge,
    color: colors.textMuted,
    lineHeight: typography.lineHeight,
    marginBottom: spacing.lg,
  },
  philosophyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  philosophyHeading: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  philosophyText: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.lineHeight,
  },
  commitmentCard: {
    backgroundColor: colors.accentSurface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  commitmentHeading: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  commitmentText: {
    fontSize: typography.body,
    color: colors.accent,
    lineHeight: typography.lineHeight,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    color: colors.primaryContrast,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    borderColor: colors.primary,
    borderWidth: 1,
    color: colors.primary,
    fontSize: typography.bodyLarge,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
