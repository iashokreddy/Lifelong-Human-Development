import { Injectable } from '@nestjs/common';
import { ContentService } from '../content/content.service';
import type { Phase } from '../shared/contract';

/**
 * A single retrievable passage of curriculum text, tagged with its source phase
 * and a human-readable citation label.
 */
export interface Passage {
  /** The phase this passage was extracted from. */
  phaseId: string;
  /** Human-readable citation, e.g. "Phase 01 — Foundations (0–3 years) › Serve and return". */
  citation: string;
  /** The passage text. */
  text: string;
}

/** A retrieved passage with its keyword-overlap score. */
export interface ScoredPassage extends Passage {
  score: number;
}

/**
 * Very small English stopword set, enough to keep keyword scoring focused on
 * content words without pulling in a dependency.
 */
const STOPWORDS = new Set<string>([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does', 'for',
  'from', 'how', 'i', 'in', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or',
  'should', 'that', 'the', 'their', 'them', 'they', 'this', 'to', 'up', 'was',
  'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with', 'you', 'your',
]);

/**
 * Real keyword retrieval over the vetted curriculum.
 *
 * An in-memory index of passages is built lazily from every loaded phase (via
 * ContentService). retrieve() tokenises the query, scores each passage by
 * TF-style keyword overlap, and returns the top-k passages with citations.
 * There is NO stubbed/hardcoded answer here — retrieval is performed over the
 * actual content so answers can only be grounded in the curriculum.
 */
@Injectable()
export class Retriever {
  private index: Passage[] | null = null;

  constructor(private readonly content: ContentService) {}

  /** Retrieve the top-k passages whose keywords overlap the query. */
  retrieve(query: string, k = 4): ScoredPassage[] {
    const passages = this.getIndex();
    const queryTerms = tokenise(query);
    if (queryTerms.length === 0) {
      return [];
    }

    const scored: ScoredPassage[] = [];
    for (const passage of passages) {
      const score = scorePassage(queryTerms, passage.text);
      if (score > 0) {
        scored.push({ ...passage, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.max(0, k));
  }

  /** Build (once) and return the passage index over all loaded phases. */
  private getIndex(): Passage[] {
    if (this.index === null) {
      this.index = this.buildIndex();
    }
    return this.index;
  }

  private buildIndex(): Passage[] {
    const passages: Passage[] = [];
    for (const entry of this.content.getCatalogEntries()) {
      const phase = this.content.getPhase(entry.id);
      if (phase) {
        extractPassages(phase, passages);
      }
    }
    return passages;
  }
}

/**
 * Extract passages from a phase. Pulls summary, domain focuses, year-plan
 * objectives/capabilities, daily/weekly activity titles+descriptions, parent
 * guidance, outcomes, and projects — each tagged with the phase id and a
 * citation that names the phase and the source field.
 */
function extractPassages(phase: Phase, out: Passage[]): void {
  const add = (label: string, text: string | undefined): void => {
    if (text && text.trim().length > 0) {
      out.push({ phaseId: phase.id, citation: `${phase.title} › ${label}`, text: text.trim() });
    }
  };

  add('Summary', phase.summary);

  for (const domain of phase.developmentDomains) {
    add(`Domain: ${domain.domain}`, domain.focus);
  }

  for (const plan of phase.yearPlans) {
    for (const objective of plan.objectives) {
      add(`${plan.label} objective`, objective);
    }
    for (const capability of plan.capabilities) {
      add(`${plan.label} capability`, capability);
    }
  }

  for (const activity of phase.activities?.daily ?? []) {
    add(`Daily activity: ${activity.title}`, `${activity.title}. ${activity.description}`);
  }
  for (const activity of phase.activities?.weekly ?? []) {
    add(`Weekly activity: ${activity.title}`, `${activity.title}. ${activity.description}`);
  }

  for (const guidance of phase.parentGuidance ?? []) {
    add(`Parent guidance: ${guidance.topic}`, guidance.guidance);
  }

  for (const outcome of phase.outcomes) {
    add('Outcome', outcome);
  }

  for (const project of phase.projects) {
    add(`Project: ${project.title}`, `${project.title}. ${project.description}`);
  }
}

/** Lowercase, split on non-letters/digits, and drop stopwords and 1-char tokens. */
export function tokenise(text: string): string[] {
  return (text ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/**
 * TF-style score: for each distinct query term, count how often it appears in
 * the passage. Rewards passages that mention more of the query terms more often.
 */
function scorePassage(queryTerms: string[], passageText: string): number {
  const passageTerms = tokenise(passageText);
  if (passageTerms.length === 0) {
    return 0;
  }

  const counts = new Map<string, number>();
  for (const term of passageTerms) {
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }

  let score = 0;
  for (const term of new Set(queryTerms)) {
    score += counts.get(term) ?? 0;
  }
  return score;
}
