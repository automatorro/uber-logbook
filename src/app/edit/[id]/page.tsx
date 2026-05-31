'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppwrite } from '@/hooks/useAppwrite';
import { DailyEntry } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

export default function EditEntry() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { entries, isLoaded, updateEntry } = useAppwrite();
  const { t } = useLanguage();
  const [entry, setEntry] = useState<DailyEntry | null>(null);

  useEffect(() => {
    if (isLoaded) {
      const found = entries.find(e => e.id === id);
      if (found) {
        setEntry(found);
      } else {
        router.push('/');
      }
    }
  }, [isLoaded, entries, id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!entry) return;
    const { name, value } = e.target;
    setEntry({
      ...entry,
      [name]: name === 'kmEnd' || name === 'kmStart' || name === 'tripCount' ? Math.max(0, parseInt(value) || 0) : value
    });
  };

  const handleFuelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!entry) return;
    const { name, value } = e.target;
    const fueling = entry.fueling || { id: Math.random().toString(36).substring(2, 11), date: entry.date, liters: 0, value: 0, station: '', odometer: entry.kmEnd };
    setEntry({
      ...entry,
      fueling: {
        ...fueling,
        [name]: name === 'liters' || name === 'value' ? Math.max(0, parseFloat(value) || 0) : value
      }
    });
  };

  const handleSave = async () => {
    if (!entry) return;
    if (entry.kmEnd < entry.kmStart) {
      alert(t.edit.kmError);
      return;
    }
    await updateEntry(id, entry);
    router.push('/');
  };

  if (!isLoaded || !entry) return (
    <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚖</div>
      <p style={{ color: 'var(--muted)', fontWeight: 500 }}>{t.edit.loading}</p>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{t.edit.title}</h1>
      <p style={{ marginBottom: '1.5rem', fontWeight: 600, color: 'var(--muted)' }}>
        {new Date(entry.date).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>{t.edit.sectionMileage}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>{t.edit.kmStart}</label>
            <input className="form-control" type="number" name="kmStart" value={entry.kmStart} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>{t.edit.kmEnd}</label>
            <input className="form-control" type="number" name="kmEnd" value={entry.kmEnd} onChange={handleChange} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>{t.edit.startTime}</label>
            <input className="form-control" type="time" name="startTime" value={entry.startTime} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>{t.edit.endTime}</label>
            <input className="form-control" type="time" name="endTime" value={entry.endTime} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>{t.edit.sectionActivity}</h2>
        <div className="form-group">
          <label>{t.edit.tripCount}</label>
          <input className="form-control" type="number" name="tripCount" value={entry.tripCount} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>{t.edit.route}</label>
          <input className="form-control" name="route" value={entry.route} onChange={handleChange} />
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>{t.edit.sectionFuel}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>{t.edit.liters}</label>
            <input className="form-control" type="number" step="0.01" name="liters" value={entry.fueling?.liters || ''} onChange={handleFuelChange} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>{t.edit.value}</label>
            <input className="form-control" type="number" step="0.01" name="value" value={entry.fueling?.value || ''} onChange={handleFuelChange} placeholder="0.00" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>{t.edit.station}</label>
            <input className="form-control" name="station" value={entry.fueling?.station || ''} onChange={handleFuelChange} placeholder={t.edit.stationPlaceholder} />
          </div>
          <div className="form-group">
            <label>{t.edit.bill}</label>
            <input className="form-control" name="bill" value={entry.fueling?.bill || ''} onChange={handleFuelChange} placeholder={t.edit.billPlaceholder} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary" onClick={handleSave}>{t.edit.save}</button>
        <button className="btn btn-secondary" onClick={() => router.push('/')}>{t.edit.cancel}</button>
      </div>
    </div>
  );
}
