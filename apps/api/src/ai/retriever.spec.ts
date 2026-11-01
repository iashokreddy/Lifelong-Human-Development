import { ContentService } from '../content/content.service';
import { Retriever, tokenise } from './retriever';

describe('Retriever', () => {
  const originalContentRoot = process.env.LHD_CONTENT_ROOT;
  let content: ContentService;
  let retriever: Retriever;

  beforeAll(() => {
    // Exercise the same walk-up resolution the app uses at runtime.
    delete process.env.LHD_CONTENT_ROOT;
    content = new ContentService();
    content.onModuleInit();
    retriever = new Retriever(content);
  });

  afterAll(() => {
    if (originalContentRoot === undefined) {
      delete process.env.LHD_CONTENT_ROOT;
    } else {
      process.env.LHD_CONTENT_ROOT = originalContentRoot;
    }
  });

  it('returns phase-01 passages for a serve-and-return / language query', () => {
    const results = retriever.retrieve('serve and return language development for a baby');

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((passage) => passage.phaseId === 'phase-01')).toBe(true);
    // Scores are ordered high to low.
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
    // Each passage carries a citation.
    expect(results[0].citation.length).toBeGreaterThan(0);
  });

  it('respects the k limit', () => {
    const results = retriever.retrieve('language play exploration', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('returns nothing for a query with no content-word overlap', () => {
    expect(retriever.retrieve('zzzxxyy')).toEqual([]);
  });

  it('tokenise strips stopwords and short tokens', () => {
    expect(tokenise('What is the a language')).toEqual(['language']);
  });
});
