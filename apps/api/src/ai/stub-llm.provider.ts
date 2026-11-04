import { Injectable } from '@nestjs/common';
import type { LlmProvider } from './llm-provider.interface';
import type { Passage } from './retriever';

/**
 * Deterministic, offline LlmProvider used by default.
 *
 * It composes an extractive answer purely from the retrieved curriculum
 * passages — no network, no randomness, no model weights. This keeps builds and
 * tests fully self-contained and, by construction, keeps every answer grounded
 * in the vetted content. A real model-backed provider can replace it by binding
 * a different implementation to the LLM_PROVIDER token.
 */
@Injectable()
export class StubLlmProvider implements LlmProvider {
  generate(prompt: string, context: Passage[]): string {
    if (context.length === 0) {
      return (
        "I could not find anything in the curriculum to answer that. Try rephrasing, " +
        'or explore the phases directly. This platform only answers from its vetted ' +
        'curriculum and never invents information.'
      );
    }

    const lead = `Here is what the curriculum says about "${prompt.trim()}":`;
    const points = context.map((passage) => `- ${passage.text} [${passage.citation}]`);

    const citedPhases = Array.from(new Set(context.map((passage) => passage.phaseId)));
    const sources = `Sources: ${citedPhases.join(', ')}.`;

    return [lead, ...points, sources].join('\n');
  }
}
