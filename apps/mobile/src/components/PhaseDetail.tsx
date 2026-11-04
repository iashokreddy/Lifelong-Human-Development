import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Activity, CatalogEntry, Phase } from '@lhd/shared';
import { labelForDomain } from '../lib/domain-labels';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';
import { Bullets } from './Bullets';
import { Card } from './Card';
import { Section } from './Section';
import { SourceLink } from './SourceLink';

interface PhaseDetailProps {
  phase: Phase;
  /** Previous phase in catalog order, if any. */
  previous?: CatalogEntry | null;
  /** Next phase in catalog order, if any. */
  next?: CatalogEntry | null;
}

function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <>
      {activities.map((activity) => (
        <Card key={activity.title} title={activity.title}>
          <Text style={styles.body}>{activity.description}</Text>
          {activity.materials && activity.materials.length > 0 ? (
            <Bullets items={activity.materials} label="Materials" />
          ) : null}
        </Card>
      ))}
    </>
  );
}

/**
 * Renders every section of a Phase as scrollable, accessible content:
 * overview, development domains (readable labels), year plans, daily/weekly
 * activities, parent guidance, milestones, safety, outcomes, projects, app
 * features, cited sources, and previous/next navigation.
 */
export function PhaseDetail({ phase, previous, next }: PhaseDetailProps) {
  const daily = phase.activities?.daily ?? [];
  const weekly = phase.activities?.weekly ?? [];
  const parentGuidance = phase.parentGuidance ?? [];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.ageRange}>Ages {phase.ageRange.label}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {phase.title}
        </Text>
        <Text style={styles.objective}>{phase.primaryObjective}</Text>
      </View>

      <Section title="Overview">
        <Text style={styles.body}>{phase.summary}</Text>
        {phase.guidingPrinciple ? (
          <Text style={styles.principle}>{phase.guidingPrinciple}</Text>
        ) : null}
      </Section>

      <Section title="Development domains">
        {phase.developmentDomains.map((domain) => (
          <Card key={domain.domain} title={labelForDomain(domain.domain)}>
            <Text style={styles.body}>{domain.focus}</Text>
          </Card>
        ))}
      </Section>

      <Section title="Year plans">
        {phase.yearPlans.map((plan) => (
          <Card key={plan.label} title={plan.label}>
            <Text style={styles.subHeading}>Objectives</Text>
            <Bullets items={plan.objectives} label="Objectives" />
            <Text style={styles.subHeading}>Capabilities</Text>
            <Bullets items={plan.capabilities} label="Capabilities" />
          </Card>
        ))}
      </Section>

      {daily.length > 0 || weekly.length > 0 ? (
        <Section title="Activities">
          {daily.length > 0 ? (
            <>
              <Text style={styles.subHeading}>Daily</Text>
              <ActivityList activities={daily} />
            </>
          ) : null}
          {weekly.length > 0 ? (
            <>
              <Text style={styles.subHeading}>Weekly</Text>
              <ActivityList activities={weekly} />
            </>
          ) : null}
        </Section>
      ) : null}

      {parentGuidance.length > 0 ? (
        <Section title="Parent & caregiver guidance">
          {parentGuidance.map((item) => (
            <Card key={item.topic} title={item.topic}>
              <Text style={styles.body}>{item.guidance}</Text>
            </Card>
          ))}
        </Section>
      ) : null}

      <Section title="Milestones">
        <Text style={styles.note}>
          Age ranges are indicative guides, not rigid limits.
        </Text>
        {phase.milestones.map((milestone) => (
          <Card
            key={`${milestone.area}-${milestone.description}`}
            title={milestone.area}
          >
            <Text style={styles.body}>{milestone.description}</Text>
            {milestone.typicalBy ? (
              <Text style={styles.caption}>Typically {milestone.typicalBy}</Text>
            ) : null}
          </Card>
        ))}
      </Section>

      <Section title="Safety">
        {phase.safety.map((item) => (
          <Card key={item.topic} title={item.topic}>
            <Text style={styles.body}>{item.guidance}</Text>
          </Card>
        ))}
      </Section>

      <Section title="Learning outcomes">
        <Bullets items={phase.outcomes} label="Learning outcomes" />
      </Section>

      <Section title="Projects">
        {phase.projects.map((project) => (
          <Card key={project.title} title={project.title}>
            <Text style={styles.body}>{project.description}</Text>
            {project.skillsPractised && project.skillsPractised.length > 0 ? (
              <Bullets
                items={project.skillsPractised}
                label="Skills practised"
              />
            ) : null}
          </Card>
        ))}
      </Section>

      <Section title="How the platform helps">
        {phase.appFeatures.map((feature) => (
          <Card key={feature.feature} title={feature.feature}>
            <Text style={styles.body}>{feature.userJourney}</Text>
            {feature.audience ? (
              <Text style={styles.caption}>For: {feature.audience}</Text>
            ) : null}
          </Card>
        ))}
      </Section>

      <Section title="Sources">
        {phase.sources.map((source) => (
          <SourceLink key={source.id} source={source} />
        ))}
      </Section>

      {previous || next ? (
        <View style={styles.pager} accessibilityLabel="Phase navigation">
          {previous ? (
            <Link
              href={`/phases/${previous.slug}`}
              style={styles.pagerLink}
              accessibilityRole="link"
              accessibilityLabel={`Previous phase: ${previous.title}`}
            >
              {`\u2190 ${previous.title}`}
            </Link>
          ) : (
            <View />
          )}
          {next ? (
            <Link
              href={`/phases/${next.slug}`}
              style={[styles.pagerLink, styles.pagerNext]}
              accessibilityRole="link"
              accessibilityLabel={`Next phase: ${next.title}`}
            >
              {`${next.title} \u2192`}
            </Link>
          ) : (
            <View />
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  ageRange: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  objective: {
    fontSize: typography.bodyLarge,
    color: colors.textMuted,
    lineHeight: typography.lineHeight,
  },
  body: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: typography.lineHeight,
  },
  principle: {
    fontSize: typography.body,
    color: colors.accent,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    lineHeight: typography.lineHeight,
  },
  subHeading: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  note: {
    fontSize: typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  caption: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  pager: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  pagerLink: {
    fontSize: typography.body,
    color: colors.primary,
    fontWeight: '600',
    flexShrink: 1,
  },
  pagerNext: {
    textAlign: 'right',
  },
});
