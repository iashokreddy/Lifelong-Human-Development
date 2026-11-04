import { apiBaseUrl, askAssistant, getPhase, getPhases } from '../lib/api';

const BASE = 'http://localhost:3001/api';

function okResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

function nonOkResponse(status = 500): Response {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as unknown as Response;
}

describe('api client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('defaults the base URL to the local dev server', () => {
    expect(apiBaseUrl).toBe(BASE);
  });

  it('getPhases() fetches <base>/phases', async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse([]));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await getPhases();

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/phases`);
  });

  it('getPhase() fetches <base>/phases/:idOrSlug', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(okResponse({ id: 'phase-01' }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await getPhase('phase-01');

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/phases/phase-01`);
  });

  it('askAssistant() POSTs <base>/ai/ask with bearer header and JSON body', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        okResponse({ answer: 'a', routedToHuman: false, citations: [] }),
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    await askAssistant('q', 'tok');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/ai/ask`);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(JSON.parse(init.body)).toEqual({ question: 'q' });
  });

  it('askAssistant() omits the Authorization header when no token is given', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        okResponse({ answer: 'a', routedToHuman: false, citations: [] }),
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    await askAssistant('q');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('returns { ok: false } without throwing when fetch rejects (network error)', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('network down'));
    global.fetch = fetchMock as unknown as typeof fetch;

    const phases = await getPhases();
    const phase = await getPhase('phase-01');
    const ask = await askAssistant('q');

    expect(phases).toEqual({ ok: false, error: 'network down' });
    expect(phase.ok).toBe(false);
    expect(ask.ok).toBe(false);
  });

  it('returns { ok: false } without throwing when fetch resolves non-ok', async () => {
    const fetchMock = jest.fn().mockResolvedValue(nonOkResponse(503));
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await getPhases();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('503');
    }
  });
});
