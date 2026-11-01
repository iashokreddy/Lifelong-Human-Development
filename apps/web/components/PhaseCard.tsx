import Link from 'next/link';
import type { CatalogEntry } from '@lhd/shared';
import styles from './PhaseCard.module.css';

/**
 * Summary card for a single phase in the catalog grid. The whole card is a
 * clickable target via a stretched link on the title.
 */
export default function PhaseCard({ entry }: { entry: CatalogEntry }) {
  return (
    <article className={`${styles.card} ${styles.cardWrap}`}>
      <p className={styles.meta}>
        <span className={styles.order}>Phase {entry.order}</span>
        <span>Ages {entry.ageLabel}</span>
      </p>
      <h3 className={styles.title}>
        <Link href={`/phases/${entry.slug}`}>{entry.title}</Link>
      </h3>
      <p className={styles.objective}>{entry.primaryObjective}</p>
    </article>
  );
}
