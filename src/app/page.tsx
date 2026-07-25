'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/hooks/useSupabase';
import { DailyEntry } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/app/components/Toast';
import { SkeletonCard, SkeletonStats } from '@/app/components/Skeleton';

export default function Dashboard() {
  const { entries, settings, isLoaded, addEntry, deleteEntry, migrateFromLocal, user, recalculateAllMileage, isSyncing } = useSupabase();
  const { t } = useLanguage();
  const { showToast, confirm } = useToast();
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem('uber-entries');
    if (local && local !== '[]') setHasLocalData(true);
  }, []);

  const getLatestKmEnd = () => {
    if (entries.length === 0) return 0;
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].kmEnd;
  };

  const handleAddDay = async () => {
    const exists = entries.find(e => e.date === newDate);
    if (exists) { showToast(t.dashboard.alreadyExists, 'warning'); return; }
    const latestKm = getLatestKmEnd();
    const newEntry: DailyEntry = {
      id: '', date: newDate,
      kmStart: latestKm, kmEnd: latestKm,
      tripCount: 0, fuelings: [],
      startTime: '08:00', endTime: '20:00',
      route: settings.defaultZone || 'București',
    };
    await addEntry(newEntry);
  };

  const removeEntry = async (id: string) => {
    const ok = await confirm(t.dashboard.deleteConfirm);
    if (ok) { await deleteEntry(id); showToast('Ziua a fost ștearsă.', 'success'); }
  };

  const handleMigrate = async () => {
    const ok = await confirm(t.dashboard.migrationConfirm);
    if (ok) {
      await migrateFromLocal();
      setHasLocalData(false);
      localStorage.removeItem('uber-entries');
      localStorage.removeItem('uber-settings');
    }
  };

  const handleScanToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(e => e.date === today);
    if (todayEntry) {
      window.location.href = `/edit/${todayEntry.id}`;
    } else {
      showToast('Adaugă mai întâi ziua de azi, apoi poți scana bonul.', 'info');
      document.getElementById('add-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const thisMonthKm = entries.filter(e => {
    const d = new Date(e.date); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + Math.max(0, e.kmEnd - e.kmStart), 0);

  const totalTrips = entries.reduce((s, e) => s + e.tripCount, 0);

  if (!isLoaded) {
    return (
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <div className="skeleton" style={{ height: 160, borderRadius: 24, marginBottom: '1rem' }} />
        <SkeletonStats />
        <div className="skeleton" style={{ height: 76, borderRadius: 20, marginBottom: '1rem' }} />
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const driverFirstName = settings.driverName?.split(' ')[0] || user?.email?.split('@')[0] || 'șofer';

  return (
    <div className="container no-print" style={{ paddingTop: '1.5rem' }}>

      {hasLocalData && (
        <div className="alert-migration animate-in">
          <div>
            <p style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600, marginBottom: '0.15rem' }}>{t.dashboard.migrationTitle}</p>
            <p style={{ fontSize: '0.8rem', color: '#78350f' }}>{t.dashboard.migrationText}</p>
          </div>
          <button onClick={handleMigrate} style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
            {t.dashboard.migrationBtn}
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="animate-in" style={{ background: 'linear-gradient(135deg, #201D16 0%, #3A2A1F 60%, #D7FF4C 130%)', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', marginBottom: '0.875rem' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>
          Bună, {driverFirstName}
        </p>
        <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {thisMonthKm.toLocaleString('ro-RO')}
          <span style={{ fontSize: 18, fontWeight: 600, opacity: 0.7 }}> km luna asta</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '10px 0 0', fontWeight: 500 }}>
          {[settings.carBrand, settings.carModel, settings.carPlate].filter(Boolean).join(' · ') || 'PFAuto'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid animate-in" style={{ animationDelay: '0.04s' }}>
        <div className="stat-card">
          <div className="stat-value">{entries.length}</div>
          <div className="stat-label">Zile active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalTrips}</div>
          <div className="stat-label">Curse total</div>
        </div>
      </div>

      {/* Scan CTA */}
      <button onClick={handleScanToday} className="animate-in" style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#171511', borderRadius: 20, padding: '16px 18px', marginBottom: '0.875rem', width: '100%', textAlign: 'left', boxShadow: '0 10px 24px rgba(23,21,17,0.2)', border: 'none', cursor: 'pointer', animationDelay: '0.07s' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#D7FF4C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="#171511" strokeWidth="2" strokeLinejoin="round"/>
            <circle cx="12" cy="13" r="3.2" stroke="#171511" strokeWidth="2"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Scanează bonul</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>Adaugă alimentarea în 5 secunde</div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Add day */}
      <div id="add-form" className="card animate-in" style={{ animationDelay: '0.1s' }}>
        <p className="section-label">{t.dashboard.addSectionLabel}</p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>
            <label>{t.dashboard.addDateLabel}</label>
            <input className="form-control" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleAddDay} style={{ width: 'auto', flex: '0 0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', height: 52 }}>
            {t.dashboard.addButton}
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
          {t.dashboard.addHint}
        </p>
      </div>

      {/* History */}
      <section className="animate-in" style={{ animationDelay: '0.13s' }}>
        <div className="section-header">
          <p className="section-title">{t.dashboard.historySectionTitle}</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {entries.length > 0 && <span className="section-count">{t.dashboard.historyCount(entries.length, totalTrips)}</span>}
            <button onClick={recalculateAllMileage} disabled={isSyncing || entries.length === 0} style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '3px 8px', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, cursor: isSyncing || entries.length === 0 ? 'not-allowed' : 'pointer', opacity: entries.length === 0 ? 0.4 : 1 }}>
              {isSyncing ? '⏳' : '🔄'}
            </button>
          </div>
        </div>

        {isSyncing && <div className="alert-sync">{t.dashboard.syncMessage}</div>}

        {entries.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">🗓️</div>
            <p className="empty-state-title">{t.dashboard.emptyTitle}</p>
            <p className="empty-state-text">{t.dashboard.emptyText}</p>
          </div>
        ) : sortedEntries.map((entry, i) => {
          const kmDiff = entry.kmEnd - entry.kmStart;
          const dayLabel = new Date(entry.date).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
          const totalLiters = entry.fuelings.reduce((s, f) => s + f.liters, 0);
          return (
            <div key={entry.id} className="entry-card animate-in" style={{ animationDelay: `${0.15 + i * 0.025}s` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span className="entry-date">{dayLabel}</span>
                  {entry.fuelings.length > 0 && <span className="badge badge-amber">⛽ {totalLiters.toFixed(1)}L</span>}
                  {entry.tripCount > 0 && <span className="badge badge-purple">🚦 {entry.tripCount}</span>}
                </div>
                <div className="entry-km" style={{ marginTop: '0.15rem' }}>
                  <strong>{entry.kmStart.toLocaleString('ro-RO')}</strong>
                  <span style={{ opacity: 0.4, margin: '0 0.3rem' }}>→</span>
                  <strong>{entry.kmEnd.toLocaleString('ro-RO')}</strong>
                  <span style={{ opacity: 0.4 }}> km</span>
                  {kmDiff > 0 && <span className="badge badge-green" style={{ marginLeft: '0.3rem' }}>+{kmDiff}</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.1rem' }}>
                  {entry.startTime} – {entry.endTime} · {entry.route}
                </div>
              </div>
              <div className="entry-actions">
                <Link href={`/edit/${entry.id}`} className="btn-icon btn-icon-edit" title="Editează">✏️</Link>
                <button onClick={() => removeEntry(entry.id)} className="btn-icon btn-icon-delete" title="Șterge">🗑️</button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
