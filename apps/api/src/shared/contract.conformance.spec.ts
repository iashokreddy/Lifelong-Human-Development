/**
 * Conformance guard for the mirrored contract (src/shared/contract.ts).
 *
 * These sample literals are typed against the mirrored interfaces. If the mirrored
 * shapes drift from packages/shared/src/index.ts in a way that breaks these literals,
 * the TypeScript compile (and therefore this spec) fails — surfacing the divergence.
 */
import type {
  Catalog,
  CatalogEntry,
  Phase,
  ProgressRecord,
  UserRole,
} from './contract';

describe('shared contract conformance', () => {
  it('accepts a fully-typed CatalogEntry literal', () => {
    const entry: CatalogEntry = {
      id: 'phase-01',
      order: 1,
      slug: '0-3-years',
      title: 'Foundations (0–3 years)',
      ageLabel: '0–3',
      primaryObjective: 'Attachment, safety, sensory exploration',
      file: 'phases/phase-01/phase.json',
    };
    expect(entry.id).toBe('phase-01');
  });

  it('accepts a fully-typed Catalog literal', () => {
    const catalog: Catalog = {
      title: 'Lifelong Human Development — Phase Catalog',
      description: 'Index of all life-stage phases.',
      phases: [],
    };
    expect(Array.isArray(catalog.phases)).toBe(true);
  });

  it('accepts a fully-typed Phase literal', () => {
    const phase: Phase = {
      id: 'phase-01',
      slug: '0-3-years',
      order: 1,
      title: 'Foundations (0–3 years)',
      ageRange: { label: '0–3', startYears: 0, endYears: 3, indicative: true },
      primaryObjective: 'Attachment, safety, sensory exploration',
      summary: 'The earliest years build the foundation for everything that follows.',
      guidingPrinciple: 'Strengthen caregivers; never replace them.',
      developmentDomains: [
        { domain: 'physical-and-motor', focus: 'Gross and fine motor development' },
      ],
      yearPlans: [
        { label: 'Year 1', objectives: ['Build secure attachment'], capabilities: ['Responds to voice'] },
      ],
      activities: {
        daily: [{ title: 'Serve and return', description: 'Respond to the child’s cues.' }],
        weekly: [{ title: 'Sensory play', description: 'Explore textures together.' }],
      },
      parentGuidance: [{ topic: 'Routine', guidance: 'Predictable routines build safety.' }],
      milestones: [{ area: 'motor', description: 'Sits without support', typicalBy: '9 months' }],
      safety: [{ topic: 'Sleep', guidance: 'Place baby on their back to sleep.' }],
      outcomes: ['Secure attachment established'],
      projects: [{ title: 'Memory book', description: 'Record milestones together.' }],
      appFeatures: [
        { feature: 'Milestone tracker', userJourney: 'Caregiver logs observations.', audience: 'parent' },
      ],
      sources: [
        { id: 'who-ncf', title: 'WHO Nurturing Care Framework', org: 'WHO', url: 'https://www.who.int' },
      ],
    };
    expect(phase.order).toBe(1);
    expect(phase.developmentDomains).toHaveLength(1);
  });

  it('accepts a fully-typed ProgressRecord literal', () => {
    const record: ProgressRecord = {
      userId: 'user-1',
      phaseId: 'phase-01',
      itemKey: 'outcome:0',
      status: 'in-progress',
      updatedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(),
    };
    expect(record.status).toBe('in-progress');
  });

  it('accepts every valid UserRole value', () => {
    const roles: UserRole[] = ['learner', 'parent', 'guardian', 'educator', 'admin'];
    expect(roles).toHaveLength(5);
  });
});
