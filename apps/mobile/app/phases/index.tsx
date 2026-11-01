import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { CatalogEntry } from '@lhd/shared';
import { getPhases } from '../../src/lib/api';
import { StateView } from '../../src/components/StateView';
import { colors } from '../../src/theme/colors';
import { spacing, typography } from '../../src/theme/typography';

/** Phases list: every phase from GET /api/phases, each navigating to detail. */
export default function PhasesScreen() {
  const [phases, setPhases] = useState<CatalogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPhases();
    if (result.ok) {
      setPhases(result.data);
    } else {
      setError(result.error);
      setPhases(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || error || (phases && phases.length === 0)) {
    return (
      <View style={styles.stateWrap}>
        <StateView
          loading={loading}
          error={error}
          empty={!!phases && phases.length === 0}
          emptyMessage="No phases are available yet."
          onRetry={load}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={phases ?? []}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <Text style={styles.intro}>
          Twelve life stages plus a legacy phase, from the first years to lifelong
          contribution.
        </Text>
      }
      renderItem={({ item }) => (
        <Link
          href={`/phases/${item.slug}`}
          accessibilityRole="link"
          accessibilityLabel={`Open phase ${item.title}, ages ${item.ageLabel}`}
          style={styles.card}
        >
          <View>
            <Text style={styles.ageLabel}>Ages {item.ageLabel}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.objective}>{item.primaryObjective}</Text>
          </View>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  stateWrap: {
    flex: 1,
    backgroundColor: colors.background,
  },
  intro: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: typography.lineHeight,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  ageLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  objective: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: typography.lineHeight,
  },
});
