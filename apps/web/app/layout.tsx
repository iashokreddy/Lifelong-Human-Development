import type { ReactNode } from 'react';

export const metadata = {
  title: 'Lifelong Human Development',
  description:
    'A platform that supports whole-person development across the entire human lifespan.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
