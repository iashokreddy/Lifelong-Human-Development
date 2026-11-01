/**
 * Safety guardrail for the AI assistant.
 *
 * Non-negotiable product rule (see .kiro/steering/guiding-principles.md): the
 * platform strengthens and never replaces parents, teachers, doctors, or human
 * relationships. Any health, safety, or wellbeing question must be routed to a
 * human or professional — the assistant must never diagnose, prescribe, or give
 * authoritative medical advice.
 *
 * This runs BEFORE retrieval/generation in AiService. When a question matches
 * the health/safety/wellbeing intent, we return a fixed, non-authoritative
 * response directing the user to a caregiver, teacher, doctor, or emergency help.
 */

/** Fixed, non-authoritative response returned when a question is routed to human help. */
export const HUMAN_HELP_RESPONSE =
  'This platform supports caregivers, teachers, and doctors — it never replaces them. ' +
  'For questions about health, safety, illness, injury, medication, or emotional wellbeing, ' +
  'please speak with a parent or guardian, a teacher, or a qualified doctor or health ' +
  'professional. If this is an emergency or someone may be in danger, contact your local ' +
  'emergency services or a crisis helpline right away. I cannot provide medical, diagnostic, ' +
  'or treatment advice.';

/**
 * Keyword / phrase signals for health, safety, and wellbeing intent. Kept broad
 * and conservative: it is safer to over-route a borderline question to human help
 * than to answer it. Matched case-insensitively on word boundaries.
 */
const HEALTH_SAFETY_KEYWORDS: readonly string[] = [
  // symptoms & illness
  'fever',
  'temperature',
  'sick',
  'ill',
  'illness',
  'disease',
  'infection',
  'rash',
  'vomit',
  'vomiting',
  'diarrhea',
  'diarrhoea',
  'cough',
  'cold',
  'flu',
  'pain',
  'ache',
  'headache',
  'symptom',
  'symptoms',
  'allergy',
  'allergic',
  'seizure',
  'choking',
  'bleeding',
  'unconscious',
  'breathing',
  // injury
  'injury',
  'injured',
  'hurt',
  'wound',
  'burn',
  'fracture',
  'broken bone',
  'bruise',
  'fell',
  'fall',
  // medication / treatment
  'medicine',
  'medication',
  'drug',
  'dose',
  'dosage',
  'prescription',
  'antibiotic',
  'vaccine',
  'vaccination',
  'treatment',
  'cure',
  'diagnose',
  'diagnosis',
  'therapy',
  // mental health / self-harm / wellbeing
  'depression',
  'depressed',
  'anxiety',
  'anxious',
  'suicide',
  'suicidal',
  'self-harm',
  'self harm',
  'harm myself',
  'kill myself',
  'panic attack',
  'mental health',
  'eating disorder',
  // safety / emergency / abuse
  'emergency',
  'poison',
  'poisoning',
  'overdose',
  'abuse',
  'abused',
  'neglect',
  'danger',
  'hospital',
  'doctor',
  'paediatrician',
  'pediatrician',
];

/** Result of classifying a question through the guardrail. */
export interface GuardrailResult {
  /** True when the question was routed to human/professional help. */
  routedToHuman: boolean;
  /** The fixed human-help response to return, present only when routedToHuman is true. */
  response?: string;
  /** The keyword that triggered routing, for logging/debugging. */
  matchedKeyword?: string;
}

/**
 * Classify a question and apply the health/safety/wellbeing guardrail.
 *
 * Returns routedToHuman=true with the fixed human-help response when the question
 * matches the health/safety/wellbeing intent; otherwise routedToHuman=false so
 * the caller may proceed to curriculum retrieval.
 */
export function classifyAndGuard(question: string): GuardrailResult {
  const text = (question ?? '').toLowerCase();

  for (const keyword of HEALTH_SAFETY_KEYWORDS) {
    if (matchesKeyword(text, keyword)) {
      return {
        routedToHuman: true,
        response: HUMAN_HELP_RESPONSE,
        matchedKeyword: keyword,
      };
    }
  }

  return { routedToHuman: false };
}

/**
 * Match a keyword against the (already lowercased) text on word boundaries so,
 * for example, "ill" does not match "skill" and "fall" does not match "fallacy".
 */
function matchesKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`);
  return pattern.test(text);
}
