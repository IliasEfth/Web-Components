<script setup lang="ts">
import { ref, watch } from 'vue';

type RemoteState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'failed'; message: string };

const { name, load } = defineProps<{ name: string; load: () => Promise<void> }>();

const state = ref<RemoteState>({ status: 'loading' });
const attempt = ref(0);

watch(
  [() => load, attempt],
  (_values, _previous, onCleanup) => {
    let active = true;
    onCleanup(() => {
      active = false;
    });
    state.value = { status: 'loading' };
    load().then(
      () => {
        if (active) state.value = { status: 'ready' };
      },
      (error: unknown) => {
        if (active) state.value = { status: 'failed', message: String(error) };
      },
    );
  },
  { immediate: true },
);
</script>

<template>
  <slot v-if="state.status === 'ready'" />
  <section v-else-if="state.status === 'loading'" class="card remote-card">Loading {{ name }}…</section>
  <section v-else class="card remote-card remote-card--failed" role="alert">
    <h2>{{ name }} is unavailable</h2>
    <p>The rest of the back office keeps working.</p>
    <p class="remote-card__error">{{ state.message }}</p>
    <button type="button" class="button" @click="attempt++">Retry</button>
  </section>
</template>
