<script setup lang="ts">
import type { INoteAddedDetail } from '@shop/notes-contract';
import { ref } from 'vue';
import OrderNotes from '../notes/components/order-notes/OrderNotes.vue';
import EventLog from '../shared/EventLog.vue';
import OrderPicker from '../shared/OrderPicker.vue';
import { useEventLog } from '../shared/use-event-log';

const orderId = ref<string>();
const { events, log } = useEventLog();

function noteAdded(detail: INoteAddedDetail): void {
  log(`noteAdded({ orderId: ${detail.orderId}, text: ${detail.text} })`);
}
</script>

<template>
  <p class="intro">
    A plain Vue component: props in, emits out. The notes service comes from
    <code>app.use(createNotes(config))</code> through <code>inject</code>.
  </p>

  <OrderPicker v-model="orderId" />

  <div class="layout">
    <OrderNotes :order-id="orderId" @note-added="noteAdded" />
    <EventLog :events="events" />
  </div>
</template>
