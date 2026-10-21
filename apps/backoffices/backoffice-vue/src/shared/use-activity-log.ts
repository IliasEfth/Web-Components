import { ref } from 'vue';
import type { IActivityEntry } from '../models/activity-entry';

export function useActivityLog() {
  const entries = ref<IActivityEntry[]>([]);
  let nextId = 1;

  function log(text: string): void {
    const entry: IActivityEntry = { id: nextId++, at: new Date().toLocaleTimeString(), text };
    entries.value = [entry, ...entries.value];
  }

  function clear(): void {
    entries.value = [];
  }

  return { entries, log, clear };
}
