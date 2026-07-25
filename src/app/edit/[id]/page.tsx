'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { DailyEntry, Fueling } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/app/components/Toast';
import { supabase } from '@/lib/supabase';

function newFueling(entryDate: string): Fueling {
  return { id: 'new_' + Math.random().toString(36).substring(2, 11), date: entryDate, liters: 0, value: 0, station: '', bill: '' };
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
    setEntry({ ...entry, [name]: name === 'kmEnd' || name === 'kmStart' || name === 'tripCount' ? Math.max(0, parseInt(value) || 0) : value });
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
      let billPhotoUrl: string | undefined;
      if (user) {
        const fuelingId = 'new_' + Math.random().toString(36).substring(2, 11);
        const path = `${user.id}/${id}/${fuelingId}.jpg`;
        const blob = await (await fetch(`data:image/jpeg;base64,${base64}`)).blob();
        const { error: uploadErr } = await supabase.storage.from('fuel-receipts').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
        if (!uploadErr) billPhotoUrl = path;
      }
      const res = await fetch('/api/ocr-receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: base64, mediaType }) });
      const data = await res.json();
      if (data.ocrFailed) {
        showToast(t.edit.ocrFailed, 'warning');
        const f = newFueling(entry.date);
        if (billPhotoUrl) f.billPhotoUrl = billPhotoUrl;
        setEntry({ ...entry, fuelings: [...entry.fuelings, f] });
      } else {
        const f: Fueling = { id: 'new_' + Math.random().toString(36).substring(2, 11), date: data.date || entry.date, liters: data.liters ?? 0, value: data.value ?? 0, station: data.station ?? '', bill: data.bill ?? '', billPhotoUrl };
        setEntry({ ...entry, fuelings: [...entry.fuelings, f] });
        setOcrFilledIds(prev => new Set(prev).add(f.id));
        showToast(t.edit.ocrAutoFilled, 'success');
      }
    } catch {
      showToast(t.edit.ocrFailed, 'warning');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!entry) return;
    if (entry.kmEnd < entry.kmStart) { showToast(t.edit.kmError, 'error'); return; }
    await updateEntry(id, entry);
    showToast('Ziua a fost salvată.', 'success');
    router.push('/');
  };

  if (!isLoaded || !entry) return (
    <div style={{ minHeight: '100vh', background: '#F2EEE3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#8C8776', fontWeight: 600 }}>{t.edit.loading}</p>
    </div>
  );

  const totalLiters = entry.fuelings.reduce((s, f) => s + f.liters, 0);
  const totalValue  = entry.fuelings.reduce((s, f) => s + f.value, 0);

  const inputStyle: React.CSSProperties = { height: 52, borderRadius: 16, border: '1.5px solid #E7E2D3', background: '#fff', padding: '0 14px', fontSize: 15, color: '#171511', fontFamily: 'inherit', fontWeight: 500, width: '100%', boxSizing: 'border-box', outline: 'none' };
  const smallInput: React.CSSProperties = { height: 44, borderRadius: 12, border: '1.5px solid #E7E2D3', background: '#fff', padding: '0 12px', fontSize: 14, color: '#171511', fontFamily: 'inherit', fontWeight: 500, width: '100%', boxSizing: 'border-box', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: '#F2EEE3', paddingBottom: 100 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={{ paddingTop: 24, paddingBottom: 8 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#8C8776', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="#8C8776" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Înapoi
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#171511', letterSpacing: '-0.01em', margin: '0 0 4px' }}>{t.edit.title}</h1>
          <p style={{ fontSize: 14, color: '#8C8776', fontWeight: 600, margin: 0 }}>
            {new Date(entry.date).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Scan section */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E7E2D3', padding: 20, marginBottom: 12, marginTop: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#171511', margin: '0 0 4px' }}>Scanează bonul</h2>
          <p style={{ fontSize: 13, color: '#8C8776', margin: '0 0 14px' }}>Fă o poză bonului de combustibil, restul e automat.</p>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleScanReceipt(f); e.target.value = ''; }} />

          <button
            onClick={() => fileRef.current?.click()}
            disabled={scanning}
            style={{ width: '100%', height: 200, borderRadius: 18, background: '#171511', border: 'none', cursor: scanning ? 'wait' : 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}
          >
            {/* Corner brackets */}
            {!scanning && ['tl','tr','bl','br'].map(c => (
              <div key={c} style={{ position: 'absolute', width: 26, height: 26,
                ...(c.includes('t') ? { top: 16 } : { bottom: 16 }),
                ...(c.includes('l') ? { left: 16 } : { right: 16 }),
                borderTop: c.includes('t') ? '2.5px solid #D7FF4C' : 'none',
                borderBottom: c.includes('b') ? '2.5px solid #D7FF4C' : 'none',
                borderLeft: c.includes('l') ? '2.5px solid #D7FF4C' : 'none',
                borderRight: c.includes('r') ? '2.5px solid #D7FF4C' : 'none',
                borderTopLeftRadius: c === 'tl' ? 8 : 0,
                borderTopRightRadius: c === 'tr' ? 8 : 0,
                borderBottomLeftRadius: c === 'bl' ? 8 : 0,
                borderBottomRightRadius: c === 'br' ? 8 : 0,
              }} />
            ))}
            {scanning ? (
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600 }}>⏳ Se scanează...</p>
            ) : (
              <>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="3.4" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8"/>
                </svg>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, margin: 0 }}>Apasă pentru a fotografia bonul</p>
              </>
            )}
          </button>

          {entry.fuelings.some(f => ocrFilledIds.has(f.id)) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3FAE6A' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#3FAE6A' }}>Date extrase automat de AI</span>
            </div>
          )}
        </div>

        {/* Fuelings */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E7E2D3', padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#171511', margin: 0 }}>{t.edit.sectionFuel}</h2>
            <button onClick={addFueling} style={{ background: '#D7FF4C', color: '#171511', border: 'none', borderRadius: 100, padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              + Adaugă
            </button>
          </div>

          {entry.fuelings.length === 0 ? (
            <p style={{ color: '#8C8776', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>{t.edit.noFuelingsText}</p>
          ) : (
            <>
              {entry.fuelings.map((fueling, idx) => {
                const isOcr = ocrFilledIds.has(fueling.id);
                return (
                  <div key={fueling.id} style={{ borderRadius: 16, border: `1.5px solid ${isOcr ? '#D7FF4C' : '#E7E2D3'}`, padding: 14, marginBottom: 10, background: isOcr ? 'rgba(215,255,76,0.05)' : '#FAFAF8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: isOcr ? '#4A5A0F' : '#8C8776' }}>
                        ⛽ #{idx + 1}{isOcr ? ' — auto-completat' : ''}
                      </span>
                      <button onClick={() => removeFueling(fueling.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C24B2E', fontSize: 13, fontWeight: 600 }}>
                        ✕ Șterge
                      </button>
                    </div>

                    {/* Extracted data card style */}
                    <div style={{ borderRadius: 12, border: '1px solid #EFEBDD', overflow: 'hidden', marginBottom: 10 }}>
                      {[
                        { label: t.edit.fuelingDate, node: <input type="date" value={fueling.date} onChange={e => updateFuelingField(fueling.id, 'date', e.target.value)} style={{ ...smallInput, border: 'none', background: 'transparent', textAlign: 'right', width: 'auto' }} /> },
                        { label: t.edit.liters,       node: <input type="number" step="0.01" value={fueling.liters || ''} onChange={e => updateFuelingField(fueling.id, 'liters', e.target.value)} placeholder="0.00" style={{ ...smallInput, border: 'none', background: 'transparent', textAlign: 'right', width: 80 }} /> },
                        { label: t.edit.value,        node: <input type="number" step="0.01" value={fueling.value || ''} onChange={e => updateFuelingField(fueling.id, 'value', e.target.value)} placeholder="0.00" style={{ ...smallInput, border: 'none', background: 'transparent', textAlign: 'right', width: 90 }} /> },
                        { label: t.edit.station,      node: <input value={fueling.station} onChange={e => updateFuelingField(fueling.id, 'station', e.target.value)} placeholder="OMV, Petrom..." style={{ ...smallInput, border: 'none', background: 'transparent', textAlign: 'right', width: 130 }} /> },
                        { label: t.edit.bill,         node: <input value={fueling.bill || ''} onChange={e => updateFuelingField(fueling.id, 'bill', e.target.value)} placeholder="nr. bon" style={{ ...smallInput, border: 'none', background: 'transparent', textAlign: 'right', width: 100 }} /> },
                      ].map((row, i, arr) => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid #EFEBDD' : 'none', background: '#fff' }}>
                          <span style={{ fontSize: 13.5, color: '#8C8776', fontWeight: 600 }}>{row.label}</span>
                          {row.node}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Daily total */}
              <div style={{ background: 'linear-gradient(135deg, #201D16 0%, #3A2A1F 60%, #D7FF4C 130%)', borderRadius: 14, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{t.edit.dailyTotalLabel}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{totalLiters.toFixed(2)} L / {totalValue.toFixed(2)} RON</span>
              </div>
            </>
          )}
        </div>

        {/* Kilometraj */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E7E2D3', padding: 20, marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#171511', margin: '0 0 14px' }}>{t.edit.sectionMileage}</h2>
          <p className="section-label" style={{ marginBottom: 8 }}>Kilometraj zi</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ background: '#F8F5EE', borderRadius: 16, padding: '12px 14px', border: '1px solid #E7E2D3' }}>
              <div style={{ fontSize: 12, color: '#8C8776', fontWeight: 600, marginBottom: 6 }}>Plecare</div>
              <input type="number" name="kmStart" value={entry.kmStart} onChange={handleChange} style={{ ...inputStyle, height: 36, borderRadius: 8, padding: '0 10px', fontSize: 16, fontWeight: 700, border: '1.5px solid #E7E2D3' }} />
            </div>
            <div style={{ background: '#F8F5EE', borderRadius: 16, padding: '12px 14px', border: '1px solid #E7E2D3' }}>
              <div style={{ fontSize: 12, color: '#8C8776', fontWeight: 600, marginBottom: 6 }}>Sosire</div>
              <input type="number" name="kmEnd" value={entry.kmEnd} onChange={handleChange} style={{ ...inputStyle, height: 36, borderRadius: 8, padding: '0 10px', fontSize: 16, fontWeight: 700, border: '1.5px solid #E7E2D3' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t.edit.startTime}</label>
              <input className="form-control" type="time" name="startTime" value={entry.startTime} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t.edit.endTime}</label>
              <input className="form-control" type="time" name="endTime" value={entry.endTime} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Activity */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E7E2D3', padding: 20, marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#171511', margin: '0 0 14px' }}>{t.edit.sectionActivity}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t.edit.tripCount}</label>
              <input className="form-control" type="number" name="tripCount" value={entry.tripCount} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t.edit.route}</label>
              <input className="form-control" name="route" value={entry.route} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed save button */}
      <div style={{ position: 'fixed', bottom: 76, left: 0, right: 0, padding: '12px 16px', background: 'rgba(242,238,227,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E7E2D3', display: 'flex', gap: 10, maxWidth: 640, margin: '0 auto' }}>
        <button onClick={handleSave} style={{ flex: 1, height: 52, borderRadius: 100, background: '#D7FF4C', color: '#171511', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 6px 16px rgba(215,255,76,0.3)' }}>
          {t.edit.save}
        </button>
        <button onClick={() => router.push('/')} style={{ flex: '0 0 auto', height: 52, borderRadius: 100, background: 'transparent', border: '1.5px solid #E7E2D3', color: '#8C8776', fontSize: 15, fontWeight: 600, padding: '0 20px', cursor: 'pointer' }}>
          {t.edit.cancel}
        </button>
      </div>
    </div>
  );
}
