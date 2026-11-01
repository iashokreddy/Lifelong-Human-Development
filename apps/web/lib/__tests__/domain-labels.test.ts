import { describe, expect, it } from 'vitest';
import type { DevelopmentDomainKey } from '@lhd/shared';
import { DOMAIN_LABELS, labelForDomain } from '../domain-labels';

const ALL_KEYS: DevelopmentDomainKey[] = [
  'physical-and-motor',
  'safety-and-awareness',
  'health-hygiene-self-care',
  'play-exploration-creativity',
  'communication-and-language',
  'emotional-and-resilience',
  'respect-empathy-relationships',
  'practical-life-skills',
  'scientific-thinking',
  'technology-and-digital',
  'critical-thinking-problem-solving',
  'ethics-responsibility-citizenship',
  'financial-and-professional',
  'innovation-entrepreneurship-leadership',
  'contribution-to-society',
];

describe('domain-labels', () => {
  it('maps all 15 domain keys to a non-empty label distinct from the raw key', () => {
    expect(ALL_KEYS).toHaveLength(15);
    for (const key of ALL_KEYS) {
      const label = labelForDomain(key);
      expect(label).toBeTruthy();
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toBe(key);
      expect(DOMAIN_LABELS[key]).toBe(label);
    }
  });

  it('falls back to a title-cased label for an unknown key', () => {
    expect(labelForDomain('some-unknown-key')).toBe('Some Unknown Key');
  });

  it('returns a non-empty string even for an empty input', () => {
    expect(typeof labelForDomain('')).toBe('string');
  });
});
