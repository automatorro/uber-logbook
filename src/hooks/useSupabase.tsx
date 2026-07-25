'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DailyEntry, Fueling, Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { syncMileageContinuity } from '@/utils/mileage';
import { useToast } from '@/app/components/Toast';
import type { User } from '@supabase/supabase-js';

export function useSupabase() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { showToast } = useToast();

  const mapFromDB = (row: any): DailyEntry => ({
    id: row.id,
    date: row.date,
    kmStart: row.km_start,
    kmEnd: row.km_end,
    tripCount: row.trip_count,
    startTime: row.start_time,
    endTime: row.end_time,
    route: row.route,
    fuelings: (row.fuelings || []).map((f: any): Fueling => ({
      id: f.id,
      date: f.date,
      liters: Number(f.liters),
      value: Number(f.value),
      station: f.station,
      bill: f.bill ?? undefined,
      billPhotoUrl: f.bill_photo_url ?? undefined,
    })),
  });

  const fetchAll = useCallback(async (userId: string) => {
    try {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsData) {
        setSettings({
          pfaName: settingsData.pfa_name,
          pfaCif: settingsData.pfa_cif,
          carBrand: settingsData.car_brand,
          carModel: settingsData.car_model,
          carPlate: settingsData.car_plate,
          driverName: settingsData.driver_name,
          fuelNorm: Number(settingsData.fuel_norm),
          defaultZone: settingsData.default_zone,
        });
      }

      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('*, fuelings(*)')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;
      setEntries((entriesData || []).map(mapFromDB));
      setIsLoaded(true);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchAll(session.user.id);
      } else {
        setIsLoaded(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchAll(u.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAll]);

  const saveSettings = async (newSettings: Settings) => {
    if (!user) return;
    const row = {
      user_id: user.id,
      pfa_name: newSettings.pfaName,
      pfa_cif: newSettings.pfaCif,
      car_brand: newSettings.carBrand,
      car_model: newSettings.carModel,
      car_plate: newSettings.carPlate,
      driver_name: newSettings.driverName,
      fuel_norm: newSettings.fuelNorm,
      default_zone: newSettings.defaultZone,
      updated_at: new Date().toISOString(),
    };
    const { error: err } = await supabase.from('settings').upsert(row, { onConflict: 'user_id' });
    if (err) {
      showToast('Eroare la salvarea setărilor: ' + err.message, 'error');
      return;
    }
    setSettings(newSettings);
  };

  const addEntry = async (entry: DailyEntry) => {
    if (!user) return;
    const { data, error: err } = await supabase
      .from('entries')
      .insert({
        user_id: user.id,
        date: entry.date,
        km_start: entry.kmStart,
        km_end: entry.kmEnd,
        trip_count: entry.tripCount,
        start_time: entry.startTime,
        end_time: entry.endTime,
        route: entry.route,
      })
      .select()
      .single();
    if (err) { showToast('Eroare la adăugarea intrării: ' + err.message, 'error'); return; }
    const newEntry: DailyEntry = { ...mapFromDB(data), fuelings: [] };
    setEntries(prev => [newEntry, ...prev]);
  };

  const updateEntry = async (id: string, entry: DailyEntry) => {
    if (!user) return;

    const { error: entryErr } = await supabase
      .from('entries')
      .update({
        date: entry.date,
        km_start: entry.kmStart,
        km_end: entry.kmEnd,
        trip_count: entry.tripCount,
        start_time: entry.startTime,
        end_time: entry.endTime,
        route: entry.route,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (entryErr) { showToast('Eroare la actualizarea intrării: ' + entryErr.message, 'error'); return; }

    await supabase.from('fuelings').delete().eq('entry_id', id);

    if (entry.fuelings.length > 0) {
      const rows = entry.fuelings.map(f => ({
        id: f.id.startsWith('new_') ? undefined : f.id,
        entry_id: id,
        user_id: user.id,
        date: f.date,
        liters: f.liters,
        value: f.value,
        station: f.station,
        bill: f.bill ?? null,
        bill_photo_url: f.billPhotoUrl ?? null,
      })).map(r => { if (!r.id) { const { id: _, ...rest } = r; return rest; } return r; });

      const { error: fuelErr } = await supabase.from('fuelings').insert(rows);
      if (fuelErr) { showToast('Eroare la salvarea alimentărilor: ' + fuelErr.message, 'error'); return; }
    }

    setEntries(prev => prev.map(e => e.id === id ? { ...entry, id } : e));
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;
    const { error: err } = await supabase.from('entries').delete().eq('id', id);
    if (err) { showToast('Eroare la ștergerea intrării: ' + err.message, 'error'); return; }
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const migrateFromLocal = async () => {
    if (!user) return;
    const localEntries: DailyEntry[] = JSON.parse(localStorage.getItem('uber-entries') || '[]');
    const localSettings: Settings | null = JSON.parse(localStorage.getItem('uber-settings') || 'null');
    if (localSettings) await saveSettings(localSettings);
    for (const e of localEntries) {
      await addEntry({ ...e, fuelings: e.fuelings ?? [] });
    }
    showToast('Migrare finalizată! Datele sunt acum în Cloud.', 'success');
  };

  const recalculateAllMileage = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { data, error: err } = await supabase
        .from('entries')
        .select('*, fuelings(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      if (err) throw err;

      const allEntries = (data || []).map(mapFromDB);
      const synced = syncMileageContinuity(allEntries);

      let changeCount = 0;
      for (const updated of synced) {
        const original = allEntries.find(e => e.id === updated.id);
        if (original && original.kmStart !== updated.kmStart) {
          await supabase.from('entries').update({ km_start: updated.kmStart }).eq('id', updated.id);
          changeCount++;
        }
      }

      await fetchAll(user.id);
      showToast(`Sincronizare finalizată! ${changeCount} intrări corectate.`, 'success');
    } catch (err: any) {
      showToast('Eroare la sincronizare: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    user,
    entries,
    settings,
    isLoaded,
    isSyncing,
    error,
    saveSettings,
    addEntry,
    updateEntry,
    deleteEntry,
    migrateFromLocal,
    recalculateAllMileage,
    logout: async () => {
      await supabase.auth.signOut();
      window.location.href = '/landing';
    },
  };
}
