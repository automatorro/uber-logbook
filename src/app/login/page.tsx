'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { ID } from 'appwrite';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Dacă există deja o sesiune activă, du direct pe dashboard
    const checkSession = async () => {
      try {
        await account.get();
        if (isMounted.current) {
          // router.replace nu lasă /login în history (nu poți da Back)
          router.replace('/');
        }
      } catch {
        // Nu există sesiune, rămânem pe pagina de login
      }
    };

    checkSession();

    return () => {
      isMounted.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // router este stabil, nu e nevoie în deps

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

      // Folosim replace ca să nu lăsăm /login în stiva de navigare
      router.replace('/');
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || 'Eroare de autentificare. Verifică datele.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {isRegistering ? 'Creare Cont Uber Log' : 'Autentificare'}
        </h1>

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@exemplu.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Parolă</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="minimum 8 caractere"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', background: '#fef2f2', borderRadius: '0.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? '⏳ Se procesează...' : (isRegistering ? '✅ Înregistrare' : '🔑 Conectare')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
          {isRegistering ? 'Ai deja cont?' : 'Nu ai cont?'}
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            style={{ color: 'var(--primary)', marginLeft: '0.5rem', fontWeight: 600, textDecoration: 'underline' }}
          >
            {isRegistering ? 'Conectează-te' : 'Creează unul'}
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>
        Aplicație personală pentru gestiunea foilor de parcurs.
      </p>
    </div>
  );
}
