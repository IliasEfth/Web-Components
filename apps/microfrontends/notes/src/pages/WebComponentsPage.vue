<script setup lang="ts">
import type { INoteAddedDetail } from '@shop/notes-contract';
import { ref } from 'vue';
import EventLog from '../shared/EventLog.vue';
import OrderPicker from '../shared/OrderPicker.vue';
import { useEventLog } from '../shared/use-event-log';

const orderId = ref<string>();
const { events, log } = useEventLog();

function noteAdded(event: CustomEvent<INoteAddedDetail>): void {
  log(`noteAdded { orderId: ${event.detail.orderId}, text: ${event.detail.text} }`);
}
</script>

<template>
  <p class="intro">
    The same component as a custom element, registered by
    <code>defineElements({ apiBase })</code> before the app starts: attributes in, DOM events
    out, exactly the way React, Angular and Angular 16 use it.
  </p>

  <OrderPicker v-model="orderId" />

  <div class="layout">
    <shop-order-notes :order-id="orderId" @noteAdded="noteAdded" />
    <EventLog :events="events" />
  </div>
</template>
