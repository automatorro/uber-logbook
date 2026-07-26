'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/app/components/Toast';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, isLoaded, saveSettings, logout, user } = useSupabase();
  const { t, lang, toggleLanguage } = useLanguage();
  const { showToast } = useToast();
  const [localSettings, setLocalSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoaded) setLocalSettings(settings);
  }, [isLoaded, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: name === 'fuelNorm' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await saveSettings(localSettings);
    setSaving(false);
    showToast('Setările au fost salvate.', 'success');
  };

  const initials = (() => {
    if (localSettings.driverName) {
      const parts = localSettings.driverName.trim().split(' ');
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'PF';
  })();

  if (!isLoaded) return (
    <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--muted)', fontWeight: 500 }}>Se încarcă...</p>
    </div>
  );

  const RowInput = ({ label, name, value, type = 'text', step }: { label: string; name: string; value: string | number; type?: string; step?: string }) => (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      <input
        className="form-control"
        name={name}
        value={value}
        type={type}
        step={step}
        onChange={handleChange}
        style={{ height: 36, borderRadius: 10, fontSize: '0.88rem', textAlign: 'right', maxWidth: 180 }}
      />
    </div>
  );

  return (
    <div className="container no-print" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>

      {/* Profile card */}
      <div className="animate-in" style={{ background: 'linear-gradient(135deg, #201D16 0%, #3A2A1F 60%, #EA6842 130%)', borderRadius: 24, padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: '#fff', flexShrink: 0, letterSpacing: '-0.02em' }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {localSettings.driverName || 'Șofer PFA'}
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || ''}
          </div>
        </div>
      </div>

      {/* Date firmă */}
      <p className="settings-section-label animate-in" style={{ animationDelay: '0.04s' }}>Date firmă</p>
      <div className="settings-card animate-in" style={{ animationDelay: '0.06s' }}>
        <RowInput label={t.settings.pfaName} name="pfaName" value={localSettings.pfaName} />
        <RowInput label={t.settings.pfaCif} name="pfaCif" value={localSettings.pfaCif} />
        <RowInput label={t.settings.driverName} name="driverName" value={localSettings.driverName} />
      </div>

      {/* Vehicul */}
      <p className="settings-section-label animate-in" style={{ animationDelay: '0.08s' }}>Vehicul</p>
      <div className="settings-card animate-in" style={{ animationDelay: '0.1s' }}>
        <RowInput label={t.settings.carBrand} name="carBrand" value={localSettings.carBrand} />
        <RowInput label={t.settings.carModel} name="carModel" value={localSettings.carModel} />
        <RowInput label={t.settings.carPlate} name="carPlate" value={localSettings.carPlate} />
      </div>

      {/* Configurări ANAF */}
      <p className="settings-section-label animate-in" style={{ animationDelay: '0.12s' }}>Configurări ANAF</p>
      <div className="settings-card animate-in" style={{ animationDelay: '0.14s' }}>
        <RowInput label={t.settings.fuelNorm} name="fuelNorm" value={localSettings.fuelNorm || ''} type="number" step="0.1" />
        <RowInput label={t.settings.defaultZone} name="defaultZone" value={localSettings.defaultZone} />
      </div>

      {/* Aplicație */}
      <p className="settings-section-label animate-in" style={{ animationDelay: '0.16s' }}>Aplicație</p>
      <div className="settings-card animate-in" style={{ animationDelay: '0.18s' }}>
        <div className="settings-row">
          <span className="settings-row-label">Limbă</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['ro', 'en'] as const).map(l => (
              <button key={l} onClick={() => lang !== l && toggleLanguage()} style={{ padding: '4px 14px', borderRadius: 100, fontSize: 13, fontWeight: 700, border: '1.5px solid', borderColor: lang === l ? 'var(--accent)' : 'var(--border)', background: lang === l ? 'var(--accent-light)' : 'transparent', color: lang === l ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <button className="btn btn-primary animate-in" onClick={handleSave} disabled={saving} style={{ animationDelay: '0.2s' }}>
        {saving ? '⏳ Se salvează...' : t.settings.saveBtn}
      </button>

      {/* Logout */}
      <button onClick={logout} style={{ display: 'block', width: '100%', marginTop: '1rem', padding: '0.75rem', background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}>
        Deconectează-te
      </button>

    </div>
  );
}
