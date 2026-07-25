'use client';

import './globals.css';
import Link from 'next/link';
import { useSupabase } from '@/hooks/useSupabase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LanguageProvider } from '@/i18n/LanguageContext';
import InstallPrompt from './components/InstallPrompt';
import { ToastProvider } from './components/Toast';

const PUBLIC_PATHS = ['/login', '/landing'];

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useSupabase();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user && !isPublic) router.replace('/login');
  }, [isLoaded, user, isPublic, router]);

  const showTabs = isLoaded && !!user && !isPublic;

  return (
    <>
      <InstallPrompt />
      <main style={{ paddingBottom: showTabs ? '80px' : '2rem' }}>
        {children}
      </main>
      {showTabs && <TabBar pathname={pathname} />}
    </>
  );
}

function TabBar({ pathname }: { pathname: string }) {
  const isHome     = pathname === '/';
  const isReport   = pathname === '/report';
  const isSettings = pathname === '/settings';
  const ink = '#171511';
  const muted = '#8C8776';
  const accent = '#4A5A0F';

  return (
    <nav className="tab-bar no-print">
      <Link href="/" className={`tab-item${isHome ? ' active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z"
            fill={isHome ? accent : 'none'}
            stroke={isHome ? accent : muted}
            strokeWidth="2" strokeLinejoin="round"/>
        </svg>
        <span>Acasă</span>
      </Link>

      <Link href="/#add-form" className="tab-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke={muted} strokeWidth="2.3" strokeLinecap="round"/>
        </svg>
        <span>Adaugă</span>
      </Link>

      <Link href="/report" className={`tab-item${isReport ? ' active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 3h9l3 3v15H6V3z"
            stroke={isReport ? accent : muted} strokeWidth="2"/>
          <path d="M9 10h6M9 14h6M9 18h3"
            stroke={isReport ? accent : muted} strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>Rapoarte</span>
      </Link>

      <Link href="/settings" className={`tab-item${isSettings ? ' active' : ''}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3"
            stroke={isSettings ? accent : muted} strokeWidth="2"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
            stroke={isSettings ? accent : muted} strokeWidth="1.8"/>
        </svg>
        <span>Setări</span>
      </Link>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <title>PFAuto</title>
        <meta name="description" content="Foaie de parcurs automată pentru șoferi Uber & Bolt PFA" />
        <meta name="theme-color" content="#EA6842" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LanguageProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
