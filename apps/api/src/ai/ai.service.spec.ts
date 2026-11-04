import { ContentService } from '../content/content.service';
import { AiService } from './ai.service';
import { HUMAN_HELP_RESPONSE } from './guardrail';
import { Retriever } from './retriever';
import { StubLlmProvider } from './stub-llm.provider';

describe('AiService', () => {
  const originalContentRoot = process.env.LHD_CONTENT_ROOT;
  let service: AiService;

  beforeAll(() => {
    delete process.env.LHD_CONTENT_ROOT;
    const content = new ContentService();
    content.onModuleInit();
    const retriever = new Retriever(content);
    service = new AiService(retriever, new StubLlmProvider());
  });

  afterAll(() => {
    if (originalContentRoot === undefined) {
      delete process.env.LHD_CONTENT_ROOT;
    } else {
      process.env.LHD_CONTENT_ROOT = originalContentRoot;
    }
  });

  it('answers a curriculum question with content grounded in retrieved phases and at least one citation', () => {
    const result = service.ask('what activities help a 1 year old with language?');

    expect(result.routedToHuman).toBe(false);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations.some((c) => c.phaseId === 'phase-01')).toBe(true);
    // The grounded answer embeds the citation labels from the retrieved passages.
    expect(result.answer).toContain(result.citations[0].citation);
  });

  it('routes a health question to the human-help guardrail response with no citations', () => {
    const result = service.ask('my toddler has a high fever, what medicine should I give?');

    expect(result.routedToHuman).toBe(true);
    expect(result.answer).toBe(HUMAN_HELP_RESPONSE);
    expect(result.citations).toEqual([]);
  });
});
