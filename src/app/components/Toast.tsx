'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  confirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  confirm: async () => false,
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);
  const counter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const confirm = useCallback((message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const icons: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const colors: Record<ToastType, string> = {
    success: '#10b981',
    error: '#ef4444',
    info: '#6366f1',
    warning: '#f59e0b',
  };

  return (
    <ToastContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Toast-uri */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1rem',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        maxWidth: 'calc(100vw - 2rem)', width: '340px',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'var(--surface)',
            border: `1.5px solid ${colors[t.type]}`,
            borderLeft: `4px solid ${colors[t.type]}`,
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            fontSize: '0.875rem', fontWeight: 500,
            animation: 'fadeInUp 0.25s ease',
            pointerEvents: 'auto',
          }}>
            <span>{icons[t.type]}</span>
            <span style={{ flex: 1, color: 'var(--foreground)' }}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Dialog confirmare */}
      {confirmState && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            maxWidth: '380px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 0.2s ease',
          }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleConfirm(true)}
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-sm)',
                  background: 'var(--gradient-hero)', color: 'white',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: 'none',
                }}
              >
                Da
              </button>
              <button
                onClick={() => handleConfirm(false)}
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)', color: 'var(--foreground)',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  border: '1.5px solid var(--border)',
                }}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
