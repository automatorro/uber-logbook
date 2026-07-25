'use client';

export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      padding: '1rem 1.25rem',
      marginBottom: '0.625rem',
      border: '1px solid var(--border)',
      display: 'flex', gap: '1rem', alignItems: 'center',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: '14px', width: '100px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '12px', width: '180px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '11px', width: '140px', borderRadius: '6px' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <div className="skeleton" style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          padding: '1rem', border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div className="skeleton" style={{ height: '28px', width: '50px', borderRadius: '6px', margin: '0 auto 0.4rem' }} />
          <div className="skeleton" style={{ height: '10px', width: '70px', borderRadius: '4px', margin: '0 auto' }} />
        </div>
      ))}
    </div>
  );
}
