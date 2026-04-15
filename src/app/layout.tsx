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
    if (isLoaded && !user && !isLoginPage) {
      router.push('/login');
    }
  }, [isLoaded, user, isLoginPage, router]);

  return (
    <html lang="ro">
      <head>
        <title>Uber Foaie de Parcurs</title>
        <meta name="description" content="Management automat pentru foi de parcurs ANAF" />
      </head>
      <body>
        {!isLoginPage && (
          <nav className="no-print" style={{ 
            backgroundColor: 'var(--card)', 
            borderBottom: '1px solid var(--border)',
            padding: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: 'var(--shadow)'
          }}>
            <div className="container" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0 1rem' 
            }}>
              <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                🚖 Foaie Parcurs
              </Link>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {isLoaded && user && (
                  <>
                    <Link href="/settings" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      Setări
                    </Link>
                    <button 
                      onClick={logout} 
                      style={{ fontSize: '0.8rem', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontWeight: 'inherit' }}
                    >
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
