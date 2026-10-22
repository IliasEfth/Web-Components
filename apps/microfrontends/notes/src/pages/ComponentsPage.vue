<script setup lang="ts">
import type { INoteAddedDetail, IStatusChangeDetail } from '@shop/notes-contract';
import type { OrderStatusFilter } from '@shop/notes-contract';
import { ref } from 'vue';
import OrderNotes from '../notes/components/order-notes/OrderNotes.vue';
import StatusFilter from '../notes/components/status-filter/StatusFilter.vue';
import EventLog from '../shared/EventLog.vue';
import OrderPicker from '../shared/OrderPicker.vue';
import { useEventLog } from '../shared/use-event-log';

const status = ref<OrderStatusFilter>('all');
const orderId = ref<string>();
const { events, log } = useEventLog();

function changeStatus(detail: IStatusChangeDetail): void {
  status.value = detail.status;
  log(`statusChange({ status: ${detail.status} })`);
}

function noteAdded(detail: INoteAddedDetail): void {
  log(`noteAdded({ orderId: ${detail.orderId}, text: ${detail.text} })`);
}
</script>

<template>
  <p class="intro">
    Plain Vue components: props in, emits out. The notes service comes from
    <code>app.use(createNotes(config))</code> through <code>inject</code>.
  </p>

  <StatusFilter :value="status" @status-change="changeStatus" />
  <OrderPicker v-model="orderId" />

  <div class="layout">
    <OrderNotes :order-id="orderId" @note-added="noteAdded" />
    <EventLog :events="events" />
  </div>
</template>
