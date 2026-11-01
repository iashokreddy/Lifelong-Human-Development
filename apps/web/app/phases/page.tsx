import EmptyState from '../../components/EmptyState';
import PhaseCard from '../../components/PhaseCard';
import { getPhases } from '../../lib/api';
import styles from './page.module.css';

export default async function PhasesPage() {
  const result = await getPhases();

  return (
    <div>
      <h1 className={styles.title}>Development phases</h1>
      <p className={styles.lede}>
        Every phase is a stage of the lifelong journey. Age ranges are
        indicative guides, not rigid limits — explore any phase to see its
        practical activities, guidance, and outcomes.
      </p>

      {result.ok ? (
        <ul className={styles.grid}>
          {[...result.data]
            .sort((a, b) => a.order - b.order)
            .map((entry) => (
              <li key={entry.id}>
                <PhaseCard entry={entry} />
              </li>
            ))}
        </ul>
      ) : (
        <EmptyState
          title="We could not load the phases"
          message="The curriculum service is unavailable right now. Please try again shortly."
        />
      )}
    </div>
  );
}
