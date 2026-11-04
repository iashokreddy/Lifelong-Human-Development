import Link from 'next/link';
import type { CatalogEntry } from '@lhd/shared';
import styles from './PhaseTimeline.module.css';

/**
 * Ordered, keyboard-navigable timeline of every life-stage phase, from the
 * earliest years through to lifelong contribution. Each node links to the
 * phase detail page.
 */
export default function PhaseTimeline({ entries }: { entries: CatalogEntry[] }) {
  const ordered = [...entries].sort((a, b) => a.order - b.order);

  return (
    <nav aria-label="Lifelong development journey">
      <ol className={styles.timeline}>
        {ordered.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <Link className={styles.link} href={`/phases/${entry.slug}`}>
              <span className={styles.node} aria-hidden="true">
                {entry.ageLabel}
              </span>
              <span className={styles.body}>
                <span className={styles.title}>{entry.title}</span>
                <span className={styles.objective}>
                  {entry.primaryObjective}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
