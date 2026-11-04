import Link from 'next/link';
import type { CatalogEntry } from '@lhd/shared';
import EmptyState from '../../../components/EmptyState';
import PhaseView from '../../../components/PhaseView';
import { getPhase, getPhases } from '../../../lib/api';

interface PageProps {
  params: Promise<{ idOrSlug: string }>;
}

function findNeighbours(
  entries: CatalogEntry[],
  phaseId: string,
): { previous: CatalogEntry | null; next: CatalogEntry | null } {
  const ordered = [...entries].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((entry) => entry.id === phaseId);
  if (index === -1) {
    return { previous: null, next: null };
  }
  return {
    previous: index > 0 ? ordered[index - 1] : null,
    next: index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}

export default async function PhaseDetailPage({ params }: PageProps) {
  const { idOrSlug } = await params;
  const [phaseResult, catalogResult] = await Promise.all([
    getPhase(idOrSlug),
    getPhases(),
  ]);

  if (!phaseResult.ok) {
    return (
      <EmptyState
        title="We could not find that phase"
        message="This phase is unavailable right now, or the link may be out of date. Browse all phases to find your way back."
      >
        <p>
          <Link href="/phases">View all phases</Link>
        </p>
      </EmptyState>
    );
  }

  const phase = phaseResult.data;
  const { previous, next } = catalogResult.ok
    ? findNeighbours(catalogResult.data, phase.id)
    : { previous: null, next: null };

  return <PhaseView phase={phase} previous={previous} next={next} />;
}
