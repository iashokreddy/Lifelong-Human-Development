import { render } from '@testing-library/react-native';
import type { Phase } from '@lhd/shared';
import { PhaseDetail } from '../PhaseDetail';

// expo-router's Link needs a router context; stub it to a plain Text so the
// component renders in isolation.
jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return {
    Link: ({ children, ...rest }: { children: React.ReactNode }) => (
      <Text {...rest}>{children}</Text>
    ),
  };
});

// Build a representative Phase inline (shape mirrors packages/content phase.json;
// content is NOT imported).
const phase: Phase = {
  id: 'phase-01',
  slug: '0-3-years',
  order: 1,
  title: 'Foundations (0–3 years)',
  ageRange: { label: '0–3 years', startYears: 0, endYears: 3, indicative: true },
  primaryObjective: 'Attachment, safety, and sensory exploration.',
  summary: 'The first three years build the foundation for everything.',
  guidingPrinciple: 'The platform supports the caregiver; it never replaces the relationship.',
  developmentDomains: [
    { domain: 'physical-and-motor', focus: 'Gross and fine motor development.' },
  ],
  yearPlans: [
    {
      label: 'Year 1 (0–12 months)',
      objectives: ['Establish secure attachment through responsive care.'],
      capabilities: ['Holds head steady; rolls over.'],
    },
  ],
  activities: {
    daily: [
      {
        title: 'Serve and return',
        description: 'Notice the baby and respond warmly in turn.',
      },
    ],
    weekly: [
      {
        title: 'Outdoor exploration',
        description: 'Time outside to watch and touch the natural world.',
        materials: ['a safe outdoor space'],
      },
    ],
  },
  parentGuidance: [
    {
      topic: 'You are the first teacher',
      guidance: 'Your warm, responsive presence does the most for the brain.',
    },
  ],
  milestones: [
    { area: 'Motor', description: 'Sits without support', typicalBy: 'by 9 months' },
  ],
  safety: [
    { topic: 'Safe sleep', guidance: 'Follow current safe-sleep guidance.' },
  ],
  outcomes: ['The child shows signs of secure attachment.'],
  projects: [
    {
      title: 'Our family routine chart',
      description: 'Build a simple visual daily rhythm.',
      skillsPractised: ['routine-building'],
    },
  ],
  appFeatures: [
    {
      feature: 'Caregiver daily guide',
      userJourney: 'A parent opens the app and sees today’s prompt.',
      audience: 'parent',
    },
  ],
  sources: [
    {
      id: 'who-ncf',
      title: 'Nurturing Care Framework',
      org: 'World Health Organization',
      url: 'https://www.who.int/publications/i/item/9789241514064',
    },
  ],
};

describe('PhaseDetail', () => {
  it('renders every major section of the phase', () => {
    const { getByText, queryByText } = render(<PhaseDetail phase={phase} />);

    // Title + overview
    expect(getByText('Foundations (0–3 years)')).toBeTruthy();
    expect(
      getByText('The first three years build the foundation for everything.'),
    ).toBeTruthy();

    // Readable domain label (not the raw kebab key).
    expect(getByText('Physical & motor')).toBeTruthy();
    expect(queryByText('physical-and-motor')).toBeNull();

    // Year plan objective
    expect(
      getByText('Establish secure attachment through responsive care.'),
    ).toBeTruthy();

    // Daily activity
    expect(getByText('Serve and return')).toBeTruthy();

    // Parent guidance topic
    expect(getByText('You are the first teacher')).toBeTruthy();

    // Milestone + indicative-guides note
    expect(getByText('Sits without support')).toBeTruthy();
    expect(
      getByText('Age ranges are indicative guides, not rigid limits.'),
    ).toBeTruthy();

    // Safety topic
    expect(getByText('Safe sleep')).toBeTruthy();

    // Outcome
    expect(
      getByText('The child shows signs of secure attachment.'),
    ).toBeTruthy();

    // Project
    expect(getByText('Our family routine chart')).toBeTruthy();

    // App feature
    expect(getByText('Caregiver daily guide')).toBeTruthy();

    // Source title (via SourceLink)
    expect(
      getByText('Nurturing Care Framework — World Health Organization'),
    ).toBeTruthy();
  });

  it('renders previous/next navigation when provided', () => {
    const next = {
      id: 'phase-02',
      order: 2,
      slug: '3-6-years',
      title: 'Curiosity & Communication',
      ageLabel: '3–6',
      primaryObjective: 'Curiosity, communication, independence',
      file: 'phases/phase-02/phase.json',
    };
    const { getByLabelText } = render(
      <PhaseDetail phase={phase} next={next} />,
    );
    expect(
      getByLabelText('Next phase: Curiosity & Communication'),
    ).toBeTruthy();
  });
});
