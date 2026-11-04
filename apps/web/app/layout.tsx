import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Lifelong Human Development',
  description:
    'A platform that supports whole-person development across the entire human lifespan — teaching how to think, not what to think.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <div className="site-header__inner">
            <div>
              <Link className="site-header__brand" href="/">
                Lifelong Human Development
              </Link>
              <p className="site-header__principle">
                We help people learn how to think, how to question, and how to
                create something valuable — not what to think.
              </p>
            </div>
            <nav className="site-nav" aria-label="Primary">
              <Link href="/phases">Phases</Link>
              <Link href="/assistant">Assistant</Link>
            </nav>
          </div>
        </header>
        <main id="main-content" className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <p>
              This platform strengthens and never replaces parents, teachers,
              doctors, or human relationships. Questions about health, safety,
              or wellbeing are always routed to a trusted adult or a qualified
              professional.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
