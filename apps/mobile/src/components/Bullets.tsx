import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';

interface BulletsProps {
  items: string[];
  label?: string;
}

/** Renders a string[] as an accessible bulleted list. */
export function Bullets({ items, label }: BulletsProps) {
  if (items.length === 0) {
    return null;
  }
  return (
    <View
      accessibilityRole="list"
      accessibilityLabel={label}
      style={styles.list}
    >
      {items.map((item) => (
        <View
          key={item}
          accessibilityRole="text"
          style={styles.row}
        >
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  bullet: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginRight: spacing.sm,
    lineHeight: typography.lineHeight,
  },
  text: {
    flex: 1,
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.lineHeight,
  },
});
