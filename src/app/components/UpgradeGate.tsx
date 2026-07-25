'use client';

import { useState } from 'react';

interface Props {
  userEmail: string;
  userId: string;
}

export function UpgradeGate({ userEmail, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Eroare la inițierea plății.');
      }
    } catch {
      setError('Eroare de rețea. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #201D16 0%, #2D2410 60%, #D7FF4C 200%)',
      borderRadius: 20,
      padding: '20px 20px 22px',
      marginBottom: '0.875rem',
      border: '1.5px solid rgba(215,255,76,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: '#D7FF4C',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              stroke="#171511" strokeWidth="2" strokeLinejoin="round" fill="#171511"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Abonament necesar</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>25 RON / lună (TVA inclus)</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '0 0 14px', lineHeight: 1.5 }}>
        Adaugă zile noi și accesează toate funcțiile aplicației cu un abonament lunar.
        Istoricul tău rămâne mereu disponibil.
      </p>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          background: loading ? 'rgba(215,255,76,0.5)' : '#D7FF4C',
          color: '#171511',
          border: 'none',
          borderRadius: 100,
          padding: '11px 24px',
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {loading ? 'Se deschide Stripe...' : 'Activează abonament — 25 RON/lună'}
      </button>

      {error && (
        <p style={{ fontSize: 12, color: '#f87171', margin: '8px 0 0', textAlign: 'center' }}>{error}</p>
      )}
    </div>
  );
}
