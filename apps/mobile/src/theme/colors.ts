/**
 * Accessible colour palette. Text colours are dark on light surfaces to keep a
 * strong contrast ratio (WCAG AA for body text).
 */
export const colors = {
  background: '#ffffff',
  surface: '#f5f7fa',
  border: '#d4dae2',
  // #1a2530 on #ffffff ~ 14:1 contrast.
  text: '#1a2530',
  // #475569 on #ffffff ~ 7:1 contrast.
  textMuted: '#475569',
  // #1b4d8f on #ffffff ~ 7.3:1 contrast.
  primary: '#1b4d8f',
  primaryContrast: '#ffffff',
  // #8a4b00 on #fff7ed ~ 6.5:1 contrast — used for the "routed to human" notice.
  accent: '#8a4b00',
  accentSurface: '#fff7ed',
  // #7f1d1d on #fef2f2 ~ 9:1 contrast — error panels.
  error: '#7f1d1d',
  errorSurface: '#fef2f2',
} as const;

export type ColorName = keyof typeof colors;
