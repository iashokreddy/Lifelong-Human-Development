import { render, screen } from '@testing-library/react';
import type { Phase } from '@lhd/shared';
import PhaseView from '../PhaseView';

const samplePhase: Phase = {
  id: 'phase-01',
  slug: '0-3-years',
  order: 1,
  title: 'Phase 01 — Foundations (0–3 years)',
  ageRange: { label: '0–3 years', startYears: 0, endYears: 3, indicative: true },
  primaryObjective: 'Attachment, safety, and sensory exploration.',
  summary: 'The first three years build the foundation for everything after.',
  guidingPrinciple: 'The platform supports the caregiver; it never replaces the relationship.',
  developmentDomains: [
    { domain: 'physical-and-motor', focus: 'Gross and fine motor development.' },
    { domain: 'communication-and-language', focus: 'Babbling, first words, naming.' },
  ],
  yearPlans: [
    {
      label: 'Year 1 (0–12 months)',
      objectives: ['Establish secure attachment through responsive care.'],
      capabilities: ['Holds head steady; rolls over; sits with support.'],
    },
  ],
  activities: {
    daily: [
      {
        title: 'Serve and return',
        description: 'Respond warmly to the baby in turn.',
        domain: 'communication-and-language',
      },
    ],
    weekly: [
      {
        title: 'Sensory exploration tray',
        description: 'Offer safe, varied textures to explore.',
        materials: ['cups', 'spoons'],
      },
    ],
  },
  parentGuidance: [
    {
      topic: 'You are the first teacher',
      guidance: 'Your warm, responsive presence does more than any product.',
    },
  ],
  milestones: [
    {
      area: 'Motor',
      description: 'Sits without support',
      typicalBy: 'by 9 months',
      sourceRef: 'cdc-milestones',
    },
  ],
  safety: [
    {
      topic: 'Safe sleep',
      guidance: 'Follow current safe-sleep guidance and confirm with your paediatrician.',
    },
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
      userJourney: 'A parent sees today’s serve-and-return prompt.',
      audience: 'parent',
    },
  ],
  sources: [
    {
      id: 'cdc-milestones',
      title: 'Developmental Milestones',
      org: 'US CDC',
      url: 'https://www.cdc.gov/act-early/milestones/',
    },
  ],
};

describe('PhaseView', () => {
  beforeEach(() => {
    render(
      <PhaseView
        phase={samplePhase}
        previous={null}
        next={{
          id: 'phase-02',
          order: 2,
          slug: '3-6-years',
          title: 'Curiosity & Communication (3–6 years)',
          ageLabel: '3–6',
          primaryObjective: 'Curiosity, communication, independence',
          file: 'phases/phase-02/phase.json',
        }}
      />,
    );
  });

  it('renders exactly one h1 with the phase title', () => {
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(/Foundations/);
  });

  it('shows development domains with readable labels, not raw keys', () => {
    expect(screen.getByText('Physical & motor')).toBeInTheDocument();
    expect(screen.getByText('Communication & language')).toBeInTheDocument();
    expect(screen.queryByText('physical-and-motor')).not.toBeInTheDocument();
  });

  it('renders the overview summary and guiding principle', () => {
    expect(
      screen.getByText(/first three years build the foundation/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/never replaces the relationship/i)).toBeInTheDocument();
  });

  it('renders a year-plan objective', () => {
    expect(
      screen.getByText(/Establish secure attachment through responsive care/i),
    ).toBeInTheDocument();
  });

  it('renders a daily activity title', () => {
    expect(screen.getByText('Serve and return')).toBeInTheDocument();
  });

  it('renders a parent guidance topic', () => {
    expect(screen.getByText('You are the first teacher')).toBeInTheDocument();
  });

  it('renders a milestone description', () => {
    expect(screen.getByText('Sits without support')).toBeInTheDocument();
  });

  it('renders a safety topic', () => {
    expect(screen.getByText('Safe sleep')).toBeInTheDocument();
  });

  it('renders a learning outcome', () => {
    expect(
      screen.getByText(/The child shows signs of secure attachment/i),
    ).toBeInTheDocument();
  });

  it('renders a project title', () => {
    expect(screen.getByText('Our family routine chart')).toBeInTheDocument();
  });

  it('renders an app feature', () => {
    expect(screen.getByText('Caregiver daily guide')).toBeInTheDocument();
  });

  it('renders a source as a link with the correct href', () => {
    const link = screen.getByRole('link', { name: /Developmental Milestones/i });
    expect(link).toHaveAttribute('href', 'https://www.cdc.gov/act-early/milestones/');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
