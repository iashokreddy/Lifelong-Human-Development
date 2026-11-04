import { classifyAndGuard, HUMAN_HELP_RESPONSE } from './guardrail';

describe('classifyAndGuard', () => {
  it('routes a health question to human/professional help without authoritative advice', () => {
    const result = classifyAndGuard('My toddler has a high fever, what medicine should I give?');

    expect(result.routedToHuman).toBe(true);
    expect(result.response).toBe(HUMAN_HELP_RESPONSE);
    // The response must direct to humans/professionals and explicitly refuse medical advice.
    expect(result.response?.toLowerCase()).toContain('doctor');
    expect(result.response?.toLowerCase()).toMatch(/cannot provide medical/);
    // It must not contain an authoritative dosage/treatment instruction.
    expect(result.response?.toLowerCase()).not.toMatch(/give \d|take \d|mg|dose of/);
  });

  it('routes mental-health / self-harm questions to human help', () => {
    expect(classifyAndGuard('I think my teenager is depressed and talking about self-harm').routedToHuman).toBe(true);
    expect(classifyAndGuard('what should I do in a medical emergency').routedToHuman).toBe(true);
  });

  it('does NOT route a normal curriculum question', () => {
    const result = classifyAndGuard('what activities help a 1 year old with language?');

    expect(result.routedToHuman).toBe(false);
    expect(result.response).toBeUndefined();
  });

  it('matches health keywords on word boundaries, not inside other words', () => {
    // "skill" contains "ill" but must not be routed; "fallacy" contains "fall".
    expect(classifyAndGuard('how do I build a skill in my child?').routedToHuman).toBe(false);
  });
});
