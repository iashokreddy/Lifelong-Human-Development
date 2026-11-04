import { DOMAIN_LABELS, labelForDomain } from '../lib/domain-labels';

describe('domain labels', () => {
  const keys = Object.keys(DOMAIN_LABELS);

  it('maps all 15 development-domain keys', () => {
    expect(keys).toHaveLength(15);
  });

  it('maps each key to a non-empty label distinct from the raw key', () => {
    for (const key of keys) {
      const label = labelForDomain(key);
      expect(label.length).toBeGreaterThan(0);
      expect(label).not.toBe(key);
    }
  });

  it('title-cases an unknown key as a fallback', () => {
    expect(labelForDomain('future-unknown-domain')).toBe(
      'Future Unknown Domain',
    );
  });
});
