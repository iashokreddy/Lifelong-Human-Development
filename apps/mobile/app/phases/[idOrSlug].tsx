import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CatalogEntry, Phase } from '@lhd/shared';
import { getPhase, getPhases } from '../../src/lib/api';
import { PhaseDetail } from '../../src/components/PhaseDetail';
import { StateView } from '../../src/components/StateView';
import { colors } from '../../src/theme/colors';
import { spacing, typography } from '../../src/theme/typography';

/** Phase detail: renders the full Phase plus previous/next navigation. */
export default function PhaseDetailScreen() {
  const params = useLocalSearchParams<{ idOrSlug: string }>();
  const idOrSlug = params.idOrSlug;

  const [phase, setPhase] = useState<Phase | null>(null);
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!idOrSlug) {
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);

    const [phaseResult, phasesResult] = await Promise.all([
      getPhase(idOrSlug),
      getPhases(),
    ]);

    if (phaseResult.ok) {
      setPhase(phaseResult.data);
    } else if (phaseResult.error.includes('404')) {
      setNotFound(true);
      setPhase(null);
    } else {
      setError(phaseResult.error);
      setPhase(null);
    }

    setCatalog(phasesResult.ok ? phasesResult.data : []);
    setLoading(false);
  }, [idOrSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (notFound) {
    return (
      <View style={styles.stateWrap}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundHeading} accessibilityRole="header">
            Phase not found
          </Text>
          <Text style={styles.notFoundText}>
            We could not find a phase for “{idOrSlug}”. It may have moved. Head
            back to the phase list to pick another stage.
          </Text>
        </View>
      </View>
    );
  }

  if (loading || error || !phase) {
    return (
      <View style={styles.stateWrap}>
        <StateView
          loading={loading}
          error={error}
          empty={!loading && !error && !phase}
          emptyMessage="This phase has no content yet."
          onRetry={load}
        />
      </View>
    );
  }

  const index = catalog.findIndex((entry) => entry.id === phase.id);
  const previous = index > 0 ? catalog[index - 1] : null;
  const next =
    index >= 0 && index < catalog.length - 1 ? catalog[index + 1] : null;

  return <PhaseDetail phase={phase} previous={previous} next={next} />;
}

const styles = StyleSheet.create({
  stateWrap: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    padding: spacing.lg,
  },
  notFoundHeading: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notFoundText: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: typography.lineHeight,
  },
});
