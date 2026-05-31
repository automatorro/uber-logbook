'use client';

import './globals.css';
import Link from 'next/link';
import { useAppwrite } from '@/hooks/useAppwrite';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoaded } = useAppwrite();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // Așteptăm ca isLoaded să fie true înainte de orice redirect
    // altfel facem push('/login') în timp ce sesiunea se încă încarcă
    if (!isLoaded) return;
    if (!user && !isLoginPage) {
      router.replace('/login');
    }
  }, [isLoaded, user, isLoginPage, router]);

  return (
    <html lang="ro">
      <head>
        <title>Uber Foaie de Parcurs</title>
        <meta name="description" content="Management automat pentru foi de parcurs ANAF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {!isLoginPage && (
          <nav className="navbar no-print">
            <div className="container navbar-inner">
              <Link href="/" className="navbar-brand">
                <div className="brand-icon">🚖</div>
                <span>Foaie Parcurs</span>
              </Link>
              <div className="navbar-links">
                {isLoaded && user && (
                  <>
                    <Link href="/report" className="nav-link">
                      📄 Raport
                    </Link>
                    <Link href="/settings" className="nav-link">
                      ⚙️ Setări
                    </Link>
                    <button onClick={logout} className="nav-btn-logout">
                      Ieșire
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
        <main style={{ paddingBottom: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
