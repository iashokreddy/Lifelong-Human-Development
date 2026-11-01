/**
 * Readable type scale. Base body text is 16 so it meets minimum readable sizes
 * on phones; headings step up from there.
 */
export const typography = {
  body: 16,
  bodyLarge: 18,
  caption: 14,
  h1: 28,
  h2: 22,
  h3: 18,
  lineHeight: 24,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
