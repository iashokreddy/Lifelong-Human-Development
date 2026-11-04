import type { DevelopmentDomainKey } from '@lhd/shared';

/**
 * Readable labels for the 15 development-domain keys. Keys are kebab-case enum
 * values from @lhd/shared; these map them to human-friendly text for the UI.
 * Kept here (not in content) because they are presentation concerns.
 */
export const DOMAIN_LABELS: Record<DevelopmentDomainKey, string> = {
  'physical-and-motor': 'Physical & motor',
  'safety-and-awareness': 'Safety & awareness',
  'health-hygiene-self-care': 'Health, hygiene & self-care',
  'play-exploration-creativity': 'Play, exploration & creativity',
  'communication-and-language': 'Communication & language',
  'emotional-and-resilience': 'Emotional intelligence & resilience',
  'respect-empathy-relationships': 'Respect, empathy & relationships',
  'practical-life-skills': 'Practical life skills',
  'scientific-thinking': 'Scientific thinking',
  'technology-and-digital': 'Technology & digital',
  'critical-thinking-problem-solving': 'Critical thinking & problem solving',
  'ethics-responsibility-citizenship': 'Ethics, responsibility & citizenship',
  'financial-and-professional': 'Financial & professional',
  'innovation-entrepreneurship-leadership':
    'Innovation, entrepreneurship & leadership',
  'contribution-to-society': 'Contribution to society',
};

/**
 * Title-case a kebab-case key as a fallback when an unknown domain key is
 * encountered (e.g. a new enum value added to content before this map).
 */
function titleCase(key: string): string {
  return key
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Resolve a development-domain key to a readable label, falling back to a
 * title-cased version of the raw key for unknown keys.
 */
export function labelForDomain(key: string): string {
  return DOMAIN_LABELS[key as DevelopmentDomainKey] ?? titleCase(key) ?? key;
}
