<script setup lang="ts">
import type { IStatusPickedDetail } from '@shop/insights-contract';
import type { INoteAddedDetail } from '@shop/notes-contract';
import type {
  IOrderClosedDetail,
  IOrderSelectedDetail,
  IOrderUpdatedDetail,
  OrderStatusFilter,
} from '@shop/orders-contract';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import StatusFilter from '../components/StatusFilter.vue';
import { loadInsightsElements } from '../remotes/insights-remote';
import { loadNotesElements } from '../remotes/notes-remote';
import { loadOrdersElements } from '../remotes/orders-remote';
import RemoteGate from '../remotes/RemoteGate.vue';
import { useActivityLog } from '../shared/use-activity-log';

const props = defineProps<{ orderId?: string }>();

const router = useRouter();
const status = ref<OrderStatusFilter>('all');
const refreshCount = ref(0);
const { entries, log, clear } = useActivityLog();

function filterChanged(next: OrderStatusFilter): void {
  log(`filter: status ${next}`);
}

function statusPicked(event: CustomEvent<IStatusPickedDetail>): void {
  status.value = event.detail.status;
  log(`statusPicked { status: ${event.detail.status} }`);
}

function orderSelected(event: CustomEvent<IOrderSelectedDetail>): void {
  log(`orderSelected { id: ${event.detail.id} }`);
  router.push(`/orders/${event.detail.id}`);
}

function orderUpdated(event: CustomEvent<IOrderUpdatedDetail>): void {
  log(`orderUpdated { id: ${event.detail.id}, status: ${event.detail.status} }`);
  refreshCount.value++;
}

function orderClosed(event: CustomEvent<IOrderClosedDetail>): void {
  log(`closed { id: ${event.detail.id} }`);
  router.push('/orders');
}

function noteAdded(event: CustomEvent<INoteAddedDetail>): void {
  log(`noteAdded { orderId: ${event.detail.orderId}, text: ${event.detail.text} }`);
}
</script>

<template>
  <p class="intro">
    Vue owns the URL, the filter and the layout. The list and the detail are Angular, the
    statistics and the feed are React, the notes are Vue. They meet only in this page.
  </p>

  <StatusFilter v-model="status" @update:model-value="filterChanged" />

  <div class="layout">
    <RemoteGate name="Orders" :load="loadOrdersElements">
      <div class="stack">
        <shop-orders-list :status="status" page-size="10" @orderSelected="orderSelected" />
        <shop-order-detail
          :order-id="props.orderId"
          @orderUpdated="orderUpdated"
          @closed="orderClosed"
        />
      </div>
    </RemoteGate>

    <div class="stack">
      <RemoteGate name="Insights" :load="loadInsightsElements">
        <shop-order-stats :refresh-key="String(refreshCount)" @statusPicked="statusPicked" />
      </RemoteGate>
      <RemoteGate name="Notes" :load="loadNotesElements">
        <shop-order-notes :order-id="props.orderId" @noteAdded="noteAdded" />
      </RemoteGate>
      <RemoteGate name="Insights" :load="loadInsightsElements">
        <shop-activity-feed :entries="entries" @cleared="clear" />
      </RemoteGate>
    </div>
  </div>
</template>
