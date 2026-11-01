/**
 * Mirrored from packages/shared/src/index.ts (the single source of truth).
 * Keep in sync; do not diverge.
 *
 * packages/shared ships as raw ESM TypeScript (no build output), which cannot be
 * cleanly consumed by this app's CommonJS nest build. The types below are copied
 * VERBATIM so the API shares exactly the same contract as web and mobile. Any change
 * to the source must be reflected here. A conformance spec (contract.conformance.spec.ts)
 * guards against drift.
 */

export type DevelopmentDomainKey =
  | "physical-and-motor"
  | "safety-and-awareness"
  | "health-hygiene-self-care"
  | "play-exploration-creativity"
  | "communication-and-language"
  | "emotional-and-resilience"
  | "respect-empathy-relationships"
  | "practical-life-skills"
  | "scientific-thinking"
  | "technology-and-digital"
  | "critical-thinking-problem-solving"
  | "ethics-responsibility-citizenship"
  | "financial-and-professional"
  | "innovation-entrepreneurship-leadership"
  | "contribution-to-society";

export type Audience = "learner" | "parent" | "guardian" | "educator";

export interface AgeRange {
  label: string;
  startYears: number;
  endYears: number | null;
  indicative?: boolean;
}

export interface DevelopmentDomain {
  domain: DevelopmentDomainKey;
  focus: string;
}

export interface YearPlan {
  label: string;
  objectives: string[];
  capabilities: string[];
}

export interface Activity {
  title: string;
  description: string;
  domain?: string;
  materials?: string[];
}

export interface GuidanceItem {
  topic: string;
  guidance: string;
}

export interface Milestone {
  area: string;
  description: string;
  typicalBy?: string;
  sourceRef?: string;
}

export interface Project {
  title: string;
  description: string;
  skillsPractised?: string[];
}

export interface AppFeature {
  feature: string;
  userJourney: string;
  audience?: Audience;
}

export interface Source {
  id: string;
  title: string;
  org?: string;
  url: string;
}

export interface Phase {
  id: string;
  slug: string;
  order: number;
  title: string;
  ageRange: AgeRange;
  primaryObjective: string;
  summary: string;
  guidingPrinciple?: string;
  developmentDomains: DevelopmentDomain[];
  yearPlans: YearPlan[];
  activities?: { daily?: Activity[]; weekly?: Activity[] };
  parentGuidance?: GuidanceItem[];
  milestones: Milestone[];
  safety: GuidanceItem[];
  outcomes: string[];
  projects: Project[];
  appFeatures: AppFeature[];
  sources: Source[];
}

export interface CatalogEntry {
  id: string;
  order: number;
  slug: string;
  title: string;
  ageLabel: string;
  primaryObjective: string;
  file: string;
}

export interface Catalog {
  title: string;
  description?: string;
  phases: CatalogEntry[];
}

/** User roles for role-based access control. */
export type UserRole = "learner" | "parent" | "guardian" | "educator" | "admin";

export interface ProgressRecord {
  userId: string;
  phaseId: string;
  itemKey: string; // e.g. "outcome:0" or "project:build-a-ramp"
  status: "not-started" | "in-progress" | "completed";
  updatedAt: string;
}
