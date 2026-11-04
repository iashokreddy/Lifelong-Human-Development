import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';

interface CardProps {
  title?: string;
  children: ReactNode;
}

/** A bordered content container with an optional sub-heading. */
export function Card({ title, children }: CardProps) {
  return (
    <View style={styles.card}>
      {title ? (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
});
