import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { Source } from '@lhd/shared';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';

interface SourceLinkProps {
  source: Source;
}

/** A tappable source citation that opens its URL in the browser. */
export function SourceLink({ source }: SourceLinkProps) {
  const label = source.org
    ? `${source.title} — ${source.org}`
    : source.title;

  return (
    <Pressable
      onPress={() => {
        // openURL rejects on failure; swallow so a bad URL never crashes the app.
        Linking.openURL(source.url).catch(() => undefined);
      }}
      accessibilityRole="link"
      accessibilityLabel={`Open source: ${label}`}
      style={styles.row}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: typography.body,
    color: colors.primary,
    textDecorationLine: 'underline',
    lineHeight: typography.lineHeight,
  },
});
