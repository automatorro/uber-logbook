import { DailyEntry } from "../types";

export function syncMileageContinuity(entries: DailyEntry[]): DailyEntry[] {
  if (entries.length <= 1) return entries;

  // Sort by date ascending to ensure chronological order
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const synced = sorted.map((entry, index) => {
    if (index === 0) return entry;
    
    const previous = sorted[index - 1];
    // Today's departure value is the arrival value from the day before
    return {
      ...entry,
      kmStart: previous.kmEnd
    };
  });

  return synced;
}
