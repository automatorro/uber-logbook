'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      try {
        await account.get();
        router.push('/');
      } catch (err) {
        // Not logged in, stay on page
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // Create account
        await account.create(ID.unique(), email, password);
        // Login after registration
        await account.createEmailPasswordSession(email, password);
      } else {
        // Standard login
        await account.createEmailPasswordSession(email, password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Eroare de autentificare. Verifică datele.');
    } finally {
      setLoading(false);
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
              placeholder="********"
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Se procesează...' : (isRegistering ? 'Înregistrare' : 'Conectare')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
          {isRegistering ? 'Ai deja cont?' : 'Nu ai cont?'} 
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
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
