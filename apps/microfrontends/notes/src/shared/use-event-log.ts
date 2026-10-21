import { ref } from 'vue';

export function useEventLog() {
  const events = ref<string[]>([]);

  function log(entry: string): void {
    events.value = [`${new Date().toLocaleTimeString()}  ${entry}`, ...events.value];
  }

  return { events, log };
}
