import type { Passage } from './retriever';

/** DI token for the LlmProvider. Provide the stub by default; swap in a real provider later. */
export const LLM_PROVIDER = 'LLM_PROVIDER';

/**
 * Abstraction over the text-generation backend.
 *
 * The AI assistant depends only on this interface, so the deterministic local
 * stub (StubLlmProvider) satisfies builds and tests without any network or API
 * keys, and a real provider (OpenAI/Bedrock/etc.) can be dropped in by swapping
 * the provider bound to the LLM_PROVIDER token.
 */
export interface LlmProvider {
  /**
   * Generate an answer to the user's question, grounded ONLY in the supplied
   * curriculum passages. Implementations must not introduce facts beyond the
   * provided context.
   */
  generate(prompt: string, context: Passage[]): string;
}
