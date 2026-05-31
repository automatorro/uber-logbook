'use client';

import { useState, useEffect, useRef } from 'react';
import { account } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useLanguage } from '@/i18n/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const checkSession = async () => {
      try {
        await account.get();
        if (isMounted.current) {
          window.location.href = '/';
        }
      } catch {
        // Nu există sesiune, rămânem pe pagina de login
      }
    };
    checkSession();
    return () => { isMounted.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await account.create(ID.unique(), email, password);
        await account.createEmailPasswordSession(email, password);
      } else {
        await account.createEmailPasswordSession(email, password);
      }
      window.location.href = '/';
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || t.login.error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh' }}>

      {/* Toggle limbă pe pagina de login */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <button
          onClick={toggleLanguage}
          style={{
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.3rem 0.7rem',
            background: 'var(--surface)',
            color: 'var(--foreground)'
          }}
        >
          {lang === 'ro' ? '🇬🇧 EN' : '🇷🇴 RO'}
        </button>
      </div>

      <div className="card" style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚖</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {isRegistering ? t.login.titleRegister : t.login.titleLogin}
          </h1>
        </div>

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label>{t.login.emailLabel}</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t.login.emailPlaceholder}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>{t.login.passwordLabel}</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t.login.passwordPlaceholder}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', background: '#fef2f2', borderRadius: '0.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? t.login.loadingBtn : (isRegistering ? t.login.registerBtn : t.login.loginBtn)}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
          {isRegistering ? t.login.switchToLogin : t.login.switchToRegister}
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            style={{ color: 'var(--primary)', marginLeft: '0.5rem', fontWeight: 600, textDecoration: 'underline' }}
          >
            {isRegistering ? t.login.switchToLoginLink : t.login.switchToRegisterLink}
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>
        {t.login.footer}
      </p>
    </div>
  );
}
