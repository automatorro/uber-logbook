'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppwrite } from '@/hooks/useAppwrite';
import { Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants/defaults';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, isLoaded, saveSettings } = useAppwrite();
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

  if (!isLoaded) return <div className="container">Incarcare...</div>;

  return (
    <div className="container">
      <div className="no-print">
        <h1 style={{ marginBottom: '1.5rem' }}>Setări Aplicație</h1>
        
        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Informații PFA</h2>
          <div className="form-group">
            <label>Nume PFA (Unitatea)</label>
            <input 
              className="form-control"
              name="pfaName"
              value={localSettings.pfaName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>CIF PFA</label>
            <input 
              className="form-control"
              name="pfaCif"
              value={localSettings.pfaCif}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Detalii Vehicul</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Marcă</label>
              <input 
                className="form-control"
                name="carBrand"
                value={localSettings.carBrand}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input 
                className="form-control"
                name="carModel"
                value={localSettings.carModel}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Număr Înmatriculare</label>
            <input 
              className="form-control"
              name="carPlate"
              value={localSettings.carPlate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Configurări ANAF</h2>
          <div className="form-group">
            <label>Nume Șofer (Conducător auto)</label>
            <input 
              className="form-control"
              name="driverName"
              value={localSettings.driverName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Normă Consum (L/100km)</label>
            <input 
              className="form-control"
              type="number"
              step="0.1"
              name="fuelNorm"
              value={localSettings.fuelNorm}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Zonă Activitate (Implicită)</label>
            <input 
              className="form-control"
              name="defaultZone"
              value={localSettings.defaultZone}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: '1rem' }}>
          Salvează și Revino
        </button>
      </div>
    </div>
  );
}
