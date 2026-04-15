import { DailyEntry } from "../types";

export function syncMileageContinuity(entries: DailyEntry[]): DailyEntry[] {
  if (entries.length <= 1) return entries;

  // Sort by date ascending
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // The first entry (oldest) keeps its kmStart.
  // Subsequent ones take kmEnd from previous.
  const synced = sorted.map((entry, index) => {
    if (index === 0) return entry;
    
    const previous = sorted[index - 1];
    return {
      ...entry,
      kmStart: previous.kmEnd
    };
  });

  return synced;
}
