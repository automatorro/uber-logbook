import { DailyEntry } from "../types";

export function syncMileageContinuity(entries: DailyEntry[]): DailyEntry[] {
  if (entries.length <= 1) return entries;

  // Sort by date ascending
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const synced = sorted.map((entry, index) => {
    // 1. Ensure current entry's kmEnd is at least its kmStart
    const current = { ...entry };
    if (current.kmEnd < current.kmStart && current.kmEnd !== 0) {
      current.kmEnd = current.kmStart;
    }

    if (index === 0) return current;
    
    const previous = sorted[index - 1];
    
    // 2. ONLY sync if previous has a valid kmEnd (not 0) 
    // and if current kmStart is actually 0 or smaller than previous kmEnd
    if (previous.kmEnd > 0) {
      current.kmStart = previous.kmEnd;
      // Also adjust kmEnd if it's now lagging behind the new kmStart
      if (current.kmEnd < current.kmStart) {
        current.kmEnd = current.kmStart;
      }
    }

    return current;
  });

  return synced;
}
