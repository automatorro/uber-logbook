'use client';

import { useState, useEffect, useCallback } from 'react';
import { account, databases, DATABASE_ID, ENTRIES_COLLECTION_ID, SETTINGS_COLLECTION_ID } from '@/lib/appwrite';
import { Query, ID, Models } from 'appwrite';
import { DailyEntry, Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants/defaults';

export function useAppwrite() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Helper to flatten Appwrite doc to our Local type
  const mapFromAppwrite = (doc: any): DailyEntry => ({
    id: doc.$id,
    date: doc.date,
    kmStart: doc.kmStart,
    kmEnd: doc.kmEnd,
    tripCount: doc.tripCount,
    startTime: doc.startTime,
    endTime: doc.endTime,
    route: doc.route,
    fueling: doc.fueling_liters > 0 ? {
      id: doc.$id + '_f',
      date: doc.date,
      liters: doc.fueling_liters,
      value: doc.fueling_value,
      station: doc.fueling_station,
      bill: doc.fueling_bill,
      odometer: doc.kmEnd,
    } : undefined
  });

  const mapToAppwrite = (entry: DailyEntry, userId: string) => ({
    date: entry.date,
    kmStart: entry.kmStart,
    kmEnd: entry.kmEnd,
    tripCount: entry.tripCount,
    startTime: entry.startTime,
    endTime: entry.endTime,
    route: entry.route,
    fueling_liters: entry.fueling?.liters || 0,
    fueling_value: entry.fueling?.value || 0,
    fueling_station: entry.fueling?.station || '',
    fueling_bill: entry.fueling?.bill || '',
    userId: userId
  });

  const fetchAll = useCallback(async (userId: string) => {
    try {
      // 1. Fetch Settings
      const setDoc = await databases.listDocuments(
        DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      if (setDoc.documents.length > 0) {
        const d = setDoc.documents[0];
        setSettings({
          pfaName: d.pfaName,
          pfaCif: d.pfaCif,
          carBrand: d.carBrand,
          carModel: d.carModel,
          carPlate: d.carPlate,
          driverName: d.driverName,
          fuelNorm: d.fuelNorm,
          defaultZone: d.defaultZone
        });
      }

      // 2. Fetch Entries
      const entDocs = await databases.listDocuments(
        DATABASE_ID,
        ENTRIES_COLLECTION_ID,
        [Query.limit(100), Query.orderDesc('date')]
      );

      setEntries(entDocs.documents.map(mapFromAppwrite));
      setIsLoaded(true);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const session = await account.get();
        setUser(session);
        await fetchAll(session.$id);
      } catch (err) {
        // Not logged in or error
        setIsLoaded(true);
      }
    };
    init();
  }, [fetchAll]);

  const saveSettings = async (newSettings: Settings) => {
    if (!user) return;
    try {
      const existing = await databases.listDocuments(
        DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          SETTINGS_COLLECTION_ID,
          existing.documents[0].$id,
          { ...newSettings, userId: user.$id }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          SETTINGS_COLLECTION_ID,
          ID.unique(),
          { ...newSettings, userId: user.$id }
        );
      }
      setSettings(newSettings);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      alert('Eroare la salvarea setărilor: ' + err.message);
    }
  };

  const addEntry = async (entry: DailyEntry) => {
    if (!user) return;
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        ENTRIES_COLLECTION_ID,
        ID.unique(),
        mapToAppwrite(entry, user.$id)
      );
      setEntries(prev => [...prev, mapFromAppwrite(doc)]);
    } catch (err: any) {
      console.error('Error adding entry:', err);
      alert('Eroare la adăugarea intrării: ' + err.message);
    }
  };

  const updateEntry = async (id: string, entry: DailyEntry) => {
    if (!user) return;
    try {
      const doc = await databases.updateDocument(
        DATABASE_ID,
        ENTRIES_COLLECTION_ID,
        id,
        mapToAppwrite(entry, user.$id)
      );
      setEntries(prev => prev.map(e => e.id === id ? mapFromAppwrite(doc) : e));
    } catch (err: any) {
      console.error('Error updating entry:', err);
      alert('Eroare la actualizarea intrării: ' + err.message);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;
    try {
      await databases.deleteDocument(DATABASE_ID, ENTRIES_COLLECTION_ID, id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      console.error('Error deleting entry:', err);
      alert('Eroare la ștergerea intrării: ' + err.message);
    }
  };

  const migrateFromLocal = async () => {
    if (!user) return;
    const localEntries = JSON.parse(localStorage.getItem('uber-entries') || '[]');
    const localSettings = JSON.parse(localStorage.getItem('uber-settings') || 'null');

    if (localSettings) {
        await saveSettings(localSettings);
    }

    for (const e of localEntries) {
        await addEntry(e);
    }
    
    alert('Migrare finalizată! Datele sunt acum în Cloud.');
  };

  const recalculateAllMileage = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      // 1. Fetch ALL entries (limit 5000 to be safe for a personal app)
      const res = await databases.listDocuments(
        DATABASE_ID,
        ENTRIES_COLLECTION_ID,
        [Query.limit(5000)]
      );

      const allEntries = res.documents.map(mapFromAppwrite);
      // Use the utility to sync them
      const synced = syncMileageContinuity(allEntries);

      // 2. Identify changed ones
      let changeCount = 0;
      for (const updated of synced) {
        const original = allEntries.find(e => e.id === updated.id);
        if (original && (original.kmStart !== updated.kmStart)) {
          console.log(`Syncing ${updated.date}: ${original.kmStart} -> ${updated.kmStart}`);
          await databases.updateDocument(
            DATABASE_ID,
            ENTRIES_COLLECTION_ID,
            updated.id,
            mapToAppwrite(updated, user.$id)
          );
          changeCount++;
        }
      }

      // 3. Refresh local state
      await fetchAll(user.$id);
      alert(`Sincronizare finalizată! ${changeCount} intrări au fost corectate.`);
    } catch (err: any) {
      console.error('Error during global sync:', err);
      alert('Eroare la sincronizare: ' + err.message);
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
      await account.deleteSession('current');
      window.location.href = '/login';
    }
  };
}
