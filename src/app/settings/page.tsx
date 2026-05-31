'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppwrite } from '@/hooks/useAppwrite';
import { Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { useLanguage } from '@/i18n/LanguageContext';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, isLoaded, saveSettings } = useAppwrite();
  const { t } = useLanguage();
  const [localSettings, setLocalSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (isLoaded) {
      setLocalSettings(settings);
    }
  }, [isLoaded, settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: name === 'fuelNorm' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    await saveSettings(localSettings);
    router.push('/');
  };

  if (!isLoaded) return (
    <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
      <p style={{ color: 'var(--muted)', fontWeight: 500 }}>{t.settings.loading}</p>
    </div>
  );

  return (
    <div className="container no-print" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{t.settings.title}</h1>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>{t.settings.sectionPfa}</h2>
        <div className="form-group">
          <label>{t.settings.pfaName}</label>
          <input className="form-control" name="pfaName" value={localSettings.pfaName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>{t.settings.pfaCif}</label>
          <input className="form-control" name="pfaCif" value={localSettings.pfaCif} onChange={handleChange} />
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>{t.settings.sectionVehicle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>{t.settings.carBrand}</label>
            <input className="form-control" name="carBrand" value={localSettings.carBrand} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>{t.settings.carModel}</label>
            <input className="form-control" name="carModel" value={localSettings.carModel} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>{t.settings.carPlate}</label>
          <input className="form-control" name="carPlate" value={localSettings.carPlate} onChange={handleChange} />
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>{t.settings.sectionAnaf}</h2>
        <div className="form-group">
          <label>{t.settings.driverName}</label>
          <input className="form-control" name="driverName" value={localSettings.driverName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>{t.settings.fuelNorm}</label>
          <input className="form-control" type="number" step="0.1" name="fuelNorm" value={localSettings.fuelNorm} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>{t.settings.defaultZone}</label>
          <input className="form-control" name="defaultZone" value={localSettings.defaultZone} onChange={handleChange} />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '0.5rem' }}>
        {t.settings.saveBtn}
      </button>
    </div>
  );
}
