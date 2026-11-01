import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';

interface SectionProps {
  title: string;
  children: ReactNode;
}

/** A titled section with an accessible header. */
export function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text
        style={styles.heading}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
