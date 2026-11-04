import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';

interface StateViewProps {
  loading?: boolean;
  /** An error message to show (from a non-throwing Result). */
  error?: string | null;
  /** True when a request succeeded but returned nothing to show. */
  empty?: boolean;
  emptyMessage?: string;
  /** Optional retry callback; a button is shown when provided. */
  onRetry?: () => void;
}

/**
 * Renders loading, empty, and error states so an unreachable API never crashes
 * the app. Returns null when there is nothing to report so the caller can show
 * its real content.
 */
export function StateView({
  loading,
  error,
  empty,
  emptyMessage = 'Nothing to show yet.',
  onRetry,
}: StateViewProps) {
  if (loading) {
    return (
      <View style={styles.container} accessibilityRole="text">
        <Text style={styles.text}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorPanel]}>
        <Text style={styles.errorHeading} accessibilityRole="header">
          We could not reach the server
        </Text>
        <Text style={styles.errorText}>
          {error}
        </Text>
        <Text style={styles.errorHint}>
          Check that the API is running and reachable, then try again.
        </Text>
        {onRetry ? (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            style={styles.retry}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.container} accessibilityRole="text">
        <Text style={styles.text}>{emptyMessage}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  text: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  errorPanel: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'flex-start',
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
    marginBottom: spacing.xs,
  },
  errorHint: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  retry: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  retryText: {
    color: colors.primaryContrast,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
