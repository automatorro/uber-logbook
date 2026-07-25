'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setError('verifică-ți emailul pentru a confirma contul.');
        setLoading(false);
        return;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.replace('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Eroare de autentificare. Verifică datele.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    height: 52, borderRadius: 16, background: '#fff', border: '1.5px solid #E7E2D3',
    padding: '0 18px', fontSize: 15, color: '#171511', fontFamily: 'inherit',
    outline: 'none', width: '100%', boxSizing: 'border-box', fontWeight: 500,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F2EEE3', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 420, margin: '0 auto', width: '100%', padding: '80px 28px 40px', boxSizing: 'border-box' }}>

        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#171511', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 17L10 7L14 13L20 5" stroke="#EA6842" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#171511', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          {isRegister ? 'Creează cont' : 'Bine ai revenit'}
        </h1>
        <p style={{ fontSize: 15, color: '#8C8776', margin: '0 0 32px', lineHeight: 1.5 }}>
          {isRegister
            ? 'Înregistrează-te gratuit pentru a gestiona foile de parcurs PFA.'
            : 'Intră în cont ca să continui foaia de parcurs de unde ai rămas.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#171511', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="andrei@firma.ro"
            required
            style={{ ...inputStyle, marginBottom: 16 }}
          />

          <label style={{ fontSize: 13, fontWeight: 600, color: '#171511', marginBottom: 6 }}>Parolă</label>
          <div style={{ position: 'relative', marginBottom: isRegister ? 28 : 12 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="minimum 8 caractere"
              required
              style={{ ...inputStyle, paddingRight: 70 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 600, color: '#EA6842', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showPassword ? 'Ascunde' : 'Arată'}
            </button>
          </div>

          {!isRegister && (
            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#EA6842', cursor: 'pointer' }}>Ai uitat parola?</span>
            </div>
          )}

          {error && (
            <div style={{
              background: error.startsWith('verifică') ? '#f0fdf4' : '#fff5f5',
              border: `1.5px solid ${error.startsWith('verifică') ? '#3FAE6A' : '#C24B2E'}`,
              borderRadius: 12, padding: '10px 14px', fontSize: 13.5,
              color: error.startsWith('verifică') ? '#3FAE6A' : '#C24B2E',
              fontWeight: 600, marginBottom: 20,
            }}>
              {error.charAt(0).toUpperCase() + error.slice(1)}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 56, borderRadius: 100, background: '#EA6842', color: '#fff',
              fontSize: 16, fontWeight: 700, border: 'none', cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 8px 20px rgba(234,104,66,0.35)', marginBottom: 20,
              transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '⏳ Se procesează...' : isRegister ? 'Creează cont gratuit' : 'Intră în cont'}
          </button>

          {!isRegister && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: '#E7E2D3' }} />
                <span style={{ fontSize: 12, color: '#8C8776', fontWeight: 600 }}>SAU</span>
                <div style={{ flex: 1, height: 1, background: '#E7E2D3' }} />
              </div>
              <button
                type="button"
                disabled
                style={{
                  height: 56, borderRadius: 100, background: 'transparent', border: '1.5px solid #171511',
                  fontSize: 16, fontWeight: 700, color: '#171511', cursor: 'not-allowed', opacity: 0.35, marginBottom: 28,
                }}
              >
                Continuă cu Google
              </button>
            </>
          )}
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#8C8776', marginTop: 'auto', paddingTop: 16 }}>
          {isRegister ? 'Ai deja cont? ' : 'Nu ai cont? '}
          <span
            onClick={() => { setIsRegister(v => !v); setError(''); }}
            style={{ color: '#EA6842', fontWeight: 700, cursor: 'pointer' }}
          >
            {isRegister ? 'Conectează-te' : 'Creează unul gratuit'}
          </span>
        </p>
      </div>
    </div>
  );
}
