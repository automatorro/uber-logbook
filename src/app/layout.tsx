'use client';

import './globals.css';
import Link from 'next/link';
import { useAppwrite } from '@/hooks/useAppwrite';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';

function NavBar() {
  const { user, logout, isLoaded } = useAppwrite();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const { lang, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user && !isLoginPage) {
      router.replace('/login');
    }
  }, [isLoaded, user, isLoginPage, router]);

  if (isLoginPage) return null;

  return (
    <nav className="navbar no-print">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand">
          <div className="brand-icon">🚖</div>
          <span>{t.nav.brand}</span>
        </Link>
        <div className="navbar-links">
          {isLoaded && user && (
            <>
              <Link href="/report" className="nav-link">
                📄 {t.nav.report}
              </Link>
              <Link href="/settings" className="nav-link">
                ⚙️ {t.nav.settings}
              </Link>
              <button onClick={logout} className="nav-btn-logout">
                {t.nav.logout}
              </button>
            </>
          )}
          {/* Language toggle — always visible */}
          <button
            onClick={toggleLanguage}
            className="nav-link"
            title={lang === 'ro' ? 'Switch to English' : 'Schimbă în Română'}
            style={{ fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem' }}
          >
            {lang === 'ro' ? '🇬🇧 EN' : '🇷🇴 RO'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <head>
        <title>Uber Foaie de Parcurs</title>
        <meta name="description" content="Management automat pentru foi de parcurs ANAF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LanguageProvider>
          <NavBar />
          <main style={{ paddingBottom: '2rem' }}>
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
