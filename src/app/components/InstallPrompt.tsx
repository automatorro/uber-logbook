'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'pwa-install-dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari) {
      setShowIOS(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      dismiss();
    }
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShowAndroid(false);
    setShowIOS(false);
  };

  if (!showAndroid && !showIOS) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.85rem 1.1rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      maxWidth: '360px',
      width: 'calc(100vw - 2rem)',
    }}>
      <span style={{ fontSize: '1.5rem' }}>🚖</span>
      <div style={{ flex: 1 }}>
        {showAndroid ? (
          <>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.15rem' }}>Instalează aplicația</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Acces rapid de pe ecranul principal</p>
          </>
        ) : (
          <>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.15rem' }}>Instalează pe iPhone</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Apasă <strong>Share</strong> → <strong>Add to Home Screen</strong></p>
          </>
        )}
      </div>
      {showAndroid && (
        <button
          className="btn btn-primary"
          onClick={handleInstall}
          style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.8rem', flexShrink: 0 }}
        >
          Instalează
        </button>
      )}
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1, flexShrink: 0, padding: '0.2rem' }}
        aria-label="Închide"
      >
        ✕
      </button>
    </div>
  );
}
