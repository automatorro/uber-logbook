'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/hooks/useSupabase';
import { DailyEntry } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Dashboard() {
  const { entries, settings, isLoaded, addEntry, deleteEntry, migrateFromLocal, user, recalculateAllMileage, isSyncing } = useSupabase();
  const { t } = useLanguage();
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem('uber-entries');
    if (local && local !== '[]') {
      setHasLocalData(true);
    }
  }, []);

  const getLatestKmEnd = () => {
    if (entries.length === 0) return 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].kmEnd;
  };

  const handleAddDay = async () => {
    const exists = entries.find(e => e.date === newDate);
    if (exists) {
      alert(t.dashboard.alreadyExists);
      return;
    }
    const latestKm = getLatestKmEnd();
    const newEntry: DailyEntry = {
      id: '',
      date: newDate,
      kmStart: latestKm,
      kmEnd: latestKm,
      tripCount: 0,
      fuelings: [],
      startTime: '08:00',
      endTime: '20:00',
      route: settings.defaultZone || 'București'
    };
    await addEntry(newEntry);
  };

  const removeEntry = async (id: string) => {
    if (confirm(t.dashboard.deleteConfirm)) {
      await deleteEntry(id);
    }
  };

  const handleMigrate = async () => {
    if (confirm(t.dashboard.migrationConfirm)) {
      await migrateFromLocal();
      setHasLocalData(false);
      localStorage.removeItem('uber-entries');
      localStorage.removeItem('uber-settings');
    }
  };

  const totalKm = entries.reduce((sum, e) => sum + Math.max(0, e.kmEnd - e.kmStart), 0);
  const totalTrips = entries.reduce((sum, e) => sum + e.tripCount, 0);
  const thisMonthEntries = entries.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthKm = thisMonthEntries.reduce((sum, e) => sum + Math.max(0, e.kmEnd - e.kmStart), 0);

  if (!isLoaded) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚖</div>
        <p style={{ color: 'var(--muted)', fontWeight: 500 }}>{t.dashboard.loading}</p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container no-print" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>

      {hasLocalData && (
        <div className="alert-migration animate-in">
          <div>
            <p style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600, marginBottom: '0.15rem' }}>
              {t.dashboard.migrationTitle}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#78350f' }}>
              {t.dashboard.migrationText}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleMigrate}
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#d97706', boxShadow: 'none', flexShrink: 0 }}
          >
            {t.dashboard.migrationBtn}
          </button>
        </div>
      )}

      <header className="animate-in" style={{ marginBottom: '1.75rem', animationDelay: '0.05s' }}>
        <div style={{
          background: 'var(--gradient-hero)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-20px', right: '60px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
          <p style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
            {t.dashboard.welcome}
          </p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            {t.dashboard.title}
          </h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 500 }}>
            {settings.carBrand} {settings.carModel} · {settings.carPlate}
          </p>
          {user && (
            <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
              {user.email}
            </p>
          )}
        </div>
      </header>

      <div className="stats-grid animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card">
          <div className="stat-value">{entries.length}</div>
          <div className="stat-label">{t.dashboard.statDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalKm.toLocaleString('ro-RO')}</div>
          <div className="stat-label">{t.dashboard.statKmTotal}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{thisMonthKm.toLocaleString('ro-RO')}</div>
          <div className="stat-label">{t.dashboard.statKmMonth}</div>
        </div>
      </div>

      <div className="card animate-in" style={{ animationDelay: '0.15s' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '1rem' }}>
          {t.dashboard.addSectionLabel}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
            <label>{t.dashboard.addDateLabel}</label>
            <input
              className="form-control"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddDay}
            style={{ width: 'auto', flex: '0 0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
          >
            {t.dashboard.addButton}
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
          {t.dashboard.addHint}
        </p>
      </div>

      <section className="animate-in" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">{t.dashboard.historySectionTitle}</h2>
            {entries.length > 0 && (
              <p className="section-count">{t.dashboard.historyCount(entries.length, totalTrips)}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn"
              onClick={recalculateAllMileage}
              disabled={isSyncing || entries.length === 0}
              style={{
                width: 'auto',
                padding: '0.5rem 0.85rem',
                fontSize: '0.78rem',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--muted)',
                fontWeight: 600,
                opacity: entries.length === 0 ? 0.4 : 1
              }}
            >
              {isSyncing ? t.dashboard.syncingBtn : t.dashboard.syncBtn}
            </button>
            <Link
              href="/report"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0.5rem 0.85rem', fontSize: '0.78rem' }}
            >
              {t.dashboard.reportBtn}
            </Link>
          </div>
        </div>

        {isSyncing && (
          <div className="alert-sync">
            {t.dashboard.syncMessage}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">🗓️</div>
            <p className="empty-state-title">{t.dashboard.emptyTitle}</p>
            <p className="empty-state-text">{t.dashboard.emptyText}</p>
          </div>
        ) : (
          sortedEntries.map((entry, index) => {
            const kmDiff = entry.kmEnd - entry.kmStart;
            const entryDate = new Date(entry.date);
            const dayLabel = entryDate.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' });
            const totalLiters = entry.fuelings.reduce((s, f) => s + f.liters, 0);

            return (
              <div
                key={entry.id}
                className="entry-card animate-in"
                style={{ animationDelay: `${0.22 + index * 0.04}s` }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="entry-date">{dayLabel}</span>
                    {entry.fuelings.length > 0 && (
                      <span className="badge badge-amber">⛽ {totalLiters.toFixed(2)}L</span>
                    )}
                    {entry.tripCount > 0 && (
                      <span className="badge badge-purple">🚦 {entry.tripCount} {t.dashboard.trips}</span>
                    )}
                  </div>
                  <div className="entry-km" style={{ marginTop: '0.3rem' }}>
                    <strong>{entry.kmStart.toLocaleString('ro-RO')}</strong>
                    <span style={{ opacity: 0.5, margin: '0 0.35rem' }}>→</span>
                    <strong>{entry.kmEnd.toLocaleString('ro-RO')}</strong>
                    <span style={{ opacity: 0.5 }}> km</span>
                    {kmDiff > 0 && (
                      <span className="badge badge-green" style={{ marginLeft: '0.4rem' }}>
                        +{kmDiff} km
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                    {entry.startTime} – {entry.endTime} · {entry.route}
                  </div>
                </div>

                <div className="entry-actions">
                  <Link href={`/edit/${entry.id}`} className="btn-icon btn-icon-edit" title={t.edit.save}>
                    ✏️
                  </Link>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="btn-icon btn-icon-delete"
                    title={t.edit.cancel}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
