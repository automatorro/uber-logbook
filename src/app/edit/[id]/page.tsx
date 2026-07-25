'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { DailyEntry, Fueling } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/app/components/Toast';
import { supabase } from '@/lib/supabase';

function newFueling(entryDate: string): Fueling {
  return {
    id: 'new_' + Math.random().toString(36).substring(2, 11),
    date: entryDate,
    liters: 0,
    value: 0,
    station: '',
    bill: '',
  };
}

async function compressImage(file: File, maxWidth = 1200): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function EditEntry() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { entries, isLoaded, updateEntry, user } = useSupabase();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [scanning, setScanning] = useState(false);
  const [ocrFilledIds, setOcrFilledIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded) {
      const found = entries.find(e => e.id === id);
      if (found) setEntry(found);
      else router.push('/');
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

  const addFueling = () => {
    if (!entry) return;
    setEntry({ ...entry, fuelings: [...entry.fuelings, newFueling(entry.date)] });
  };

  const updateFuelingField = (fuelingId: string, field: keyof Fueling, value: string) => {
    if (!entry) return;
    setEntry({
      ...entry,
      fuelings: entry.fuelings.map(f => {
        if (f.id !== fuelingId) return f;
        const numericFields: (keyof Fueling)[] = ['liters', 'value'];
        return { ...f, [field]: numericFields.includes(field) ? Math.max(0, parseFloat(value) || 0) : value };
      }),
    });
  };

  const removeFueling = (fuelingId: string) => {
    if (!entry) return;
    setEntry({ ...entry, fuelings: entry.fuelings.filter(f => f.id !== fuelingId) });
    setOcrFilledIds(prev => { const s = new Set(prev); s.delete(fuelingId); return s; });
  };

  const handleScanReceipt = async (file: File) => {
    if (!entry) return;
    setScanning(true);
    try {
      const { base64, mediaType } = await compressImage(file);

      // Upload to Supabase storage
      let billPhotoUrl: string | undefined;
      if (user) {
        const fuelingId = 'new_' + Math.random().toString(36).substring(2, 11);
        const path = `${user.id}/${id}/${fuelingId}.jpg`;
        const blob = await (await fetch(`data:image/jpeg;base64,${base64}`)).blob();
        const { error: uploadErr } = await supabase.storage.from('fuel-receipts').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
        if (!uploadErr) billPhotoUrl = path;
      }

      // Apel OCR
      const res = await fetch('/api/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();

      if (data.ocrFailed) {
        showToast(t.edit.ocrFailed, 'warning');
        const f = newFueling(entry.date);
        if (billPhotoUrl) f.billPhotoUrl = billPhotoUrl;
        setEntry({ ...entry, fuelings: [...entry.fuelings, f] });
      } else {
        const f: Fueling = {
          id: 'new_' + Math.random().toString(36).substring(2, 11),
          date: data.date || entry.date,
          liters: data.liters ?? 0,
          value: data.value ?? 0,
          station: data.station ?? '',
          bill: data.bill ?? '',
          billPhotoUrl,
        };
        setEntry({ ...entry, fuelings: [...entry.fuelings, f] });
        setOcrFilledIds(prev => new Set(prev).add(f.id));
        showToast(t.edit.ocrAutoFilled, 'success');
      }
    } catch (err) {
      showToast(t.edit.ocrFailed, 'warning');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!entry) return;
    if (entry.kmEnd < entry.kmStart) {
      showToast(t.edit.kmError, 'error');
      return;
    }
    await updateEntry(id, entry);
    showToast('Ziua a fost salvată.', 'success');
    router.push('/');
  };

  if (!isLoaded || !entry) return (
    <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚖</div>
      <p style={{ color: 'var(--muted)', fontWeight: 500 }}>{t.edit.loading}</p>
    </div>
  );

  const totalLiters = entry.fuelings.reduce((s, f) => s + f.liters, 0);
  const totalValue = entry.fuelings.reduce((s, f) => s + f.value, 0);

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

      {/* Secțiunea alimentări */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{t.edit.sectionFuel}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Input ascuns pentru fișier */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleScanReceipt(f); e.target.value = ''; }}
            />
            <button
              className="btn btn-secondary"
              onClick={() => fileRef.current?.click()}
              disabled={scanning}
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.82rem', opacity: scanning ? 0.6 : 1 }}
            >
              {scanning ? t.edit.scanningBtn : t.edit.scanReceiptBtn}
            </button>
            <button
              className="btn btn-primary"
              onClick={addFueling}
              style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            >
              {t.edit.addFuelingBtn}
            </button>
          </div>
        </div>

        {entry.fuelings.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
            {t.edit.noFuelingsText}
          </p>
        ) : (
          <>
            {entry.fuelings.map((fueling, idx) => {
              const isOcr = ocrFilledIds.has(fueling.id);
              return (
                <div key={fueling.id} style={{
                  border: `1.5px solid ${isOcr ? '#6366f1' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  background: isOcr ? 'rgba(99,102,241,0.04)' : 'var(--surface)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isOcr ? 'var(--primary)' : 'var(--muted)' }}>
                      ⛽ #{idx + 1}{isOcr ? ` — ${t.edit.ocrAutoFilled}` : ''}
                    </span>
                    <button
                      onClick={() => removeFueling(fueling.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {t.edit.removeFuelingBtn}
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>{t.edit.liters}</label>
                      <input className="form-control" type="number" step="0.01" value={fueling.liters || ''} onChange={e => updateFuelingField(fueling.id, 'liters', e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>{t.edit.value}</label>
                      <input className="form-control" type="number" step="0.01" value={fueling.value || ''} onChange={e => updateFuelingField(fueling.id, 'value', e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>{t.edit.station}</label>
                      <input className="form-control" value={fueling.station} onChange={e => updateFuelingField(fueling.id, 'station', e.target.value)} placeholder={t.edit.stationPlaceholder} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>{t.edit.bill}</label>
                      <input className="form-control" value={fueling.bill || ''} onChange={e => updateFuelingField(fueling.id, 'bill', e.target.value)} placeholder={t.edit.billPlaceholder} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>{t.edit.fuelingDate}</label>
                      <input className="form-control" type="date" value={fueling.date} onChange={e => updateFuelingField(fueling.id, 'date', e.target.value)} />
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{
              background: 'var(--gradient-hero)',
              color: 'white',
              borderRadius: 'var(--radius)',
              padding: '0.65rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>{t.edit.dailyTotalLabel}</span>
              <span>{totalLiters.toFixed(2)} L / {totalValue.toFixed(2)} RON</span>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary" onClick={handleSave}>{t.edit.save}</button>
        <button className="btn btn-secondary" onClick={() => router.push('/')}>{t.edit.cancel}</button>
      </div>
    </div>
  );
}
