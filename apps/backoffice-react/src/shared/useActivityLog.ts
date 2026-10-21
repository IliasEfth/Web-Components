import { useCallback, useRef, useState } from 'react';
import type { IActivityEntry } from '../models/activity-entry';

export function useActivityLog() {
  const [entries, setEntries] = useState<IActivityEntry[]>([]);
  const nextId = useRef(1);

  const log = useCallback((text: string) => {
    const entry: IActivityEntry = {
      id: nextId.current++,
      at: new Date().toLocaleTimeString(),
      text,
    };
    setEntries((current) => [entry, ...current]);
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, log, clear };
}
