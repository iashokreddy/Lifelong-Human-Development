import Link from 'next/link';
import type { CatalogEntry, Phase } from '@lhd/shared';
import { labelForDomain } from '../lib/domain-labels';
import styles from './PhaseView.module.css';

interface PhaseViewProps {
  phase: Phase;
  /** Previous phase in catalog order, if any. */
  previous?: CatalogEntry | null;
  /** Next phase in catalog order, if any. */
  next?: CatalogEntry | null;
}

/**
 * Renders every section of a Phase as semantic, accessible content: overview,
 * development domains (with readable labels), year plans, daily/weekly
 * activities, parent guidance, milestones, safety, outcomes, projects, app
 * features, and cited sources.
 */
export default function PhaseView({ phase, previous, next }: PhaseViewProps) {
  const daily = phase.activities?.daily ?? [];
  const weekly = phase.activities?.weekly ?? [];
  const parentGuidance = phase.parentGuidance ?? [];

  return (
    <article className={styles.phase}>
      <header className={styles.header}>
        <p className={styles.ageRange}>Ages {phase.ageRange.label}</p>
        <h1 className={styles.title}>{phase.title}</h1>
        <p className={styles.objective}>{phase.primaryObjective}</p>
      </header>

      <section className={styles.section} aria-labelledby="overview-heading">
        <h2 id="overview-heading">Overview</h2>
        <p>{phase.summary}</p>
        {phase.guidingPrinciple ? (
          <p className={styles.principle}>{phase.guidingPrinciple}</p>
        ) : null}
      </section>

      <section className={styles.section} aria-labelledby="domains-heading">
        <h2 id="domains-heading">Development domains</h2>
        <div className={styles.grid}>
          {phase.developmentDomains.map((domain) => (
            <div key={domain.domain} className={styles.item}>
              <span className={styles.domainLabel}>
                {labelForDomain(domain.domain)}
              </span>
              <p>{domain.focus}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="yearplans-heading">
        <h2 id="yearplans-heading">Year plans</h2>
        <div className={styles.grid}>
          {phase.yearPlans.map((plan) => (
            <div key={plan.label} className={styles.item}>
              <h3>{plan.label}</h3>
              <h4>Objectives</h4>
              <ul className={styles.list}>
                {plan.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
              <h4>Capabilities</h4>
              <ul className={styles.list}>
                {plan.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="activities-heading">
        <h2 id="activities-heading">Activities</h2>
        {daily.length > 0 ? (
          <>
            <h3>Daily</h3>
            <div className={styles.grid}>
              {daily.map((activity) => (
                <div key={activity.title} className={styles.item}>
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                  {activity.materials && activity.materials.length > 0 ? (
                    <ul className={styles.materials}>
                      {activity.materials.map((material) => (
                        <li key={material}>{material}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}
        {weekly.length > 0 ? (
          <>
            <h3>Weekly</h3>
            <div className={styles.grid}>
              {weekly.map((activity) => (
                <div key={activity.title} className={styles.item}>
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                  {activity.materials && activity.materials.length > 0 ? (
                    <ul className={styles.materials}>
                      {activity.materials.map((material) => (
                        <li key={material}>{material}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </section>

      {parentGuidance.length > 0 ? (
        <section className={styles.section} aria-labelledby="guidance-heading">
          <h2 id="guidance-heading">Parent &amp; caregiver guidance</h2>
          <div className={styles.grid}>
            {parentGuidance.map((item) => (
              <div key={item.topic} className={styles.item}>
                <h3>{item.topic}</h3>
                <p>{item.guidance}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="milestones-heading">
        <h2 id="milestones-heading">Milestones</h2>
        <p>Age ranges are indicative guides, not rigid limits.</p>
        <div className={styles.grid}>
          {phase.milestones.map((milestone) => (
            <div
              key={`${milestone.area}-${milestone.description}`}
              className={styles.item}
            >
              <h3>{milestone.area}</h3>
              <p>{milestone.description}</p>
              {milestone.typicalBy ? (
                <p className={styles.typicalBy}>Typically {milestone.typicalBy}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="safety-heading">
        <h2 id="safety-heading">Safety</h2>
        <div className={styles.grid}>
          {phase.safety.map((item) => (
            <div key={item.topic} className={styles.item}>
              <h3>{item.topic}</h3>
              <p>{item.guidance}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="outcomes-heading">
        <h2 id="outcomes-heading">Learning outcomes</h2>
        <ul className={styles.list}>
          {phase.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="projects-heading">
        <h2 id="projects-heading">Projects</h2>
        <div className={styles.grid}>
          {phase.projects.map((project) => (
            <div key={project.title} className={styles.item}>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {project.skillsPractised && project.skillsPractised.length > 0 ? (
                <ul className={styles.materials}>
                  {project.skillsPractised.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="features-heading">
        <h2 id="features-heading">How the platform helps</h2>
        <div className={styles.grid}>
          {phase.appFeatures.map((feature) => (
            <div key={feature.feature} className={styles.item}>
              <h3>{feature.feature}</h3>
              <p>{feature.userJourney}</p>
              {feature.audience ? (
                <p className={styles.audience}>For: {feature.audience}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="sources-heading">
        <h2 id="sources-heading">Sources</h2>
        <ul className={styles.sources}>
          {phase.sources.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title}
              </a>
              {source.org ? ` — ${source.org}` : null}
            </li>
          ))}
        </ul>
      </section>

      {previous || next ? (
        <nav className={styles.pager} aria-label="Phase navigation">
          {previous ? (
            <Link href={`/phases/${previous.slug}`}>
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/phases/${next.slug}`}>{next.title} →</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </article>
  );
}
