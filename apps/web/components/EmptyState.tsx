import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  detail?: string;
  children?: ReactNode;
}

/**
 * Friendly, non-alarming empty/error state shown when a data fetch returns
 * { ok: false } (e.g. the API is unavailable). Never throws; invites a retry.
 */
export default function EmptyState({
  title = 'Nothing to show just yet',
  message = 'We could not load this content right now. Please try again in a moment.',
  detail,
  children,
}: EmptyStateProps) {
  return (
    <div className={styles.empty} role="status">
      <h2 className={styles.heading}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {children}
      {detail ? <p className={styles.detail}>{detail}</p> : null}
    </div>
  );
}
