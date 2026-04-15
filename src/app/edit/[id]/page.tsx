'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppwrite } from '@/hooks/useAppwrite';
import { DailyEntry } from '@/types';

export default function EditEntry() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { entries, isLoaded, updateEntry } = useAppwrite();
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
      [name]: name === 'kmEnd' || name === 'kmStart' || name === 'tripCount' ? parseInt(value) || 0 : value
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
        [name]: name === 'liters' || name === 'value' ? parseFloat(value) || 0 : value
      }
    });
  };

  const handleSave = async () => {
    if (!entry) return;
    if (entry.kmEnd < entry.kmStart) {
      alert('KM Final nu poate fi mai mic decât KM Start!');
      return;
    }
    
    await updateEntry(id, entry);
    router.push('/');
  };

  if (!isLoaded || !entry) return <div className="container">Incarcare...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Editează Ziua</h1>
      <p style={{ marginBottom: '1rem', fontWeight: 600 }}>{new Date(entry.date).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Kilometraj și Timp</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>KM Start</label>
            <input 
              className="form-control" 
              type="number" 
              name="kmStart" 
              value={entry.kmStart} 
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>KM Final</label>
            <input 
              className="form-control" 
              type="number" 
              name="kmEnd" 
              value={entry.kmEnd} 
              onChange={handleChange}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Ora Start</label>
            <input 
              className="form-control" 
              type="time" 
              name="startTime" 
              value={entry.startTime} 
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Ora Final</label>
            <input 
              className="form-control" 
              type="time" 
              name="endTime" 
              value={entry.endTime} 
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Activitate</h2>
        <div className="form-group">
          <label>Număr Curse</label>
          <input 
            className="form-control" 
            type="number" 
            name="tripCount" 
            value={entry.tripCount} 
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Rută / Zonă</label>
          <input 
            className="form-control" 
            name="route" 
            value={entry.route} 
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🎫 Alimentare (Opțional)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Litri</label>
            <input 
              className="form-control" 
              type="number" 
              step="0.01" 
              name="liters" 
              value={entry.fueling?.liters || ''} 
              onChange={handleFuelChange}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Valoare (RON)</label>
            <input 
              className="form-control" 
              type="number" 
              step="0.01" 
              name="value" 
              value={entry.fueling?.value || ''} 
              onChange={handleFuelChange}
              placeholder="0.00"
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Stație Carburant</label>
            <input 
              className="form-control" 
              name="station" 
              value={entry.fueling?.station || ''} 
              onChange={handleFuelChange}
              placeholder="Ex: OMV, Rompetrol..."
            />
          </div>
          <div className="form-group">
            <label>Nr. Bon (Opțional)</label>
            <input 
              className="form-control" 
              name="bill" 
              value={entry.fueling?.bill || ''} 
              onChange={handleFuelChange}
              placeholder="Ex: 5678"
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary" onClick={handleSave}>Salvează</button>
        <button className="btn" onClick={() => router.push('/')} style={{ backgroundColor: 'var(--input)' }}>Anulează</button>
      </div>
    </div>
  );
}
