import EmptyState from '../components/EmptyState';
import PhaseTimeline from '../components/PhaseTimeline';
import PrincipleBanner from '../components/PrincipleBanner';
import { getPhases } from '../lib/content-source';
import styles from './page.module.css';

export default async function HomePage() {
  const result = await getPhases();

  return (
    <div>
      <section className={styles.hero}>
        <h1 className={styles.title}>A lifelong journey, 0 to 100</h1>
        <p className={styles.lede}>
          Whole-person development across the entire human lifespan — from a
          baby&apos;s first secure attachment to a lifetime of contribution.
          Each phase is practical and hands-on, woven into everyday life rather
          than exams or certificates.
        </p>
      </section>

      <PrincipleBanner />

      <h2 className={styles.sectionTitle}>The twelve-plus phases</h2>
      {result.ok ? (
        <PhaseTimeline entries={result.data} />
      ) : (
        <EmptyState
          title="We could not load the phases"
          message="The curriculum service is unavailable right now. Your journey is safe — please try again shortly."
        />
      )}
    </div>
  );
}
