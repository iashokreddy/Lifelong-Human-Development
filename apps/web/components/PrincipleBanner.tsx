import styles from './PrincipleBanner.module.css';

/**
 * Restates the platform's guiding philosophy and the non-negotiable rule that
 * it supports — and never replaces — parents, teachers, doctors, and human
 * relationships.
 */
export default function PrincipleBanner() {
  return (
    <aside className={styles.banner} aria-label="Our guiding principle">
      <h2 className={styles.heading}>A torch-bearer, not a follower</h2>
      <p className={styles.text}>
        Our aim is to help people learn how to think, how to question, how to
        understand the world, how to treat people, and how to create something
        valuable.
      </p>
      <p className={styles.text}>
        This platform strengthens and never replaces parents, teachers,
        doctors, or human relationships. Questions about health, safety, or
        wellbeing are always routed to a trusted adult or a qualified
        professional.
      </p>
    </aside>
  );
}
