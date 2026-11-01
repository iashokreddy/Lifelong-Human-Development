import { Inject, Injectable } from '@nestjs/common';
import { classifyAndGuard } from './guardrail';
import { LLM_PROVIDER, type LlmProvider } from './llm-provider.interface';
import { Retriever } from './retriever';

/** A citation to a source phase included with a grounded answer. */
export interface AnswerCitation {
  phaseId: string;
  citation: string;
}

/** The result of asking the AI assistant a question. */
export interface AskResult {
  /** The answer text: either a grounded curriculum answer or the human-help response. */
  answer: string;
  /** True when the guardrail routed the question to human/professional help. */
  routedToHuman: boolean;
  /** Citations to the source phases, present only for grounded curriculum answers. */
  citations: AnswerCitation[];
}

/**
 * The curriculum-grounded AI assistant.
 *
 * Flow: the safety guardrail runs FIRST. Any health/safety/wellbeing question is
 * routed to human/professional help and returns no curriculum answer. Otherwise
 * the question is answered ONLY from passages retrieved out of the vetted
 * curriculum, composed by a swappable LlmProvider, and returned with citations
 * to the source phases.
 */
@Injectable()
export class AiService {
  constructor(
    private readonly retriever: Retriever,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
  ) {}

  ask(question: string): AskResult {
    // 1) Guardrail first — never give authoritative health/safety/wellbeing advice.
    const guard = classifyAndGuard(question);
    if (guard.routedToHuman) {
      return {
        answer: guard.response ?? '',
        routedToHuman: true,
        citations: [],
      };
    }

    // 2) Retrieve grounding passages from the vetted curriculum.
    const passages = this.retriever.retrieve(question);

    // 3) Compose a grounded answer; the stub/provider only uses the passages.
    const answer = this.llm.generate(question, passages);

    const citations: AnswerCitation[] = passages.map((passage) => ({
      phaseId: passage.phaseId,
      citation: passage.citation,
    }));

    return {
      answer,
      routedToHuman: false,
      citations,
    };
  }
}
