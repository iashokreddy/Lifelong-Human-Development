'use client';

import { useState } from 'react';
import Link from 'next/link';
import { askAssistant, type AskResult } from '../../lib/api';
import styles from './page.module.css';

export default function AssistantPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }
    setLoading(true);
    setError(null);
    setAnswer(null);

    const result = await askAssistant(trimmed);
    if (result.ok) {
      setAnswer(result.data);
    } else {
      setError(
        'The assistant is unavailable right now. Please try again in a moment — and remember a trusted adult or professional can always help.',
      );
    }
    setLoading(false);
  }

  return (
    <div>
      <h1 className={styles.title}>Learning assistant</h1>
      <p className={styles.lede}>
        Ask about the curriculum and ideas for practical, hands-on learning.
        The assistant answers only from the vetted curriculum and helps you
        learn how to think — not what to think.
      </p>

      <div className={styles.reassurance} role="note">
        <p>
          This assistant strengthens and never replaces a parent, teacher, or
          doctor. Questions about health, safety, or wellbeing are routed to a
          human or qualified professional rather than answered here.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="assistant-question">
          Your question
        </label>
        <textarea
          id="assistant-question"
          className={styles.textarea}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. What are good hands-on activities for a two-year-old?"
          required
        />
        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Asking…' : 'Ask the assistant'}
        </button>
      </form>

      {error ? (
        <div className={styles.answer} role="status">
          <p>{error}</p>
        </div>
      ) : null}

      {answer ? (
        <section
          className={`${styles.answer} ${
            answer.routedToHuman ? styles.routedToHuman : ''
          }`}
          aria-label="Assistant response"
        >
          {answer.routedToHuman ? (
            <p>
              <strong>This is a question for a trusted human.</strong>{' '}
              {answer.answer}
            </p>
          ) : (
            <p>{answer.answer}</p>
          )}

          {answer.citations.length > 0 ? (
            <>
              <h2>Sources from the curriculum</h2>
              <ul className={styles.citations}>
                {answer.citations.map((citation, index) => (
                  <li key={`${citation.phaseId}-${index}`}>
                    <Link href={`/phases/${citation.phaseId}`}>
                      {citation.citation}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
