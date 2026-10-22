<script setup lang="ts">
import type { INoteAddedDetail, IStatusChangeDetail } from '@shop/notes-contract';
import type { OrderStatusFilter } from '@shop/notes-contract';
import { ref } from 'vue';
import EventLog from '../shared/EventLog.vue';
import OrderPicker from '../shared/OrderPicker.vue';
import { useEventLog } from '../shared/use-event-log';

const status = ref<OrderStatusFilter>('all');
const orderId = ref<string>();
const { events, log } = useEventLog();

function changeStatus(event: CustomEvent<IStatusChangeDetail>): void {
  status.value = event.detail.status;
  log(`statusChange { status: ${event.detail.status} }`);
}

function noteAdded(event: CustomEvent<INoteAddedDetail>): void {
  log(`noteAdded { orderId: ${event.detail.orderId}, text: ${event.detail.text} }`);
}
</script>

<template>
  <p class="intro">
    The same components as custom elements, registered by
    <code>defineElements({ apiBase })</code> before the app starts: attributes in, DOM events
    out, exactly the way React, Angular and Angular 16 use them.
  </p>

  <shop-status-filter :value="status" @statusChange="changeStatus" />
  <OrderPicker v-model="orderId" />

  <div class="layout">
    <shop-order-notes :order-id="orderId" @noteAdded="noteAdded" />
    <EventLog :events="events" />
  </div>
</template>
