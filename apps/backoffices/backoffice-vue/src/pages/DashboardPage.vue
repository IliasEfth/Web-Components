<script setup lang="ts">
import type { IOrderSelectedDetail } from '@shop/orders-contract';
import { useRouter } from 'vue-router';
import { loadInsightsElements } from '../remotes/insights-remote';
import { loadOrdersElements } from '../remotes/orders-remote';
import RemoteGate from '../remotes/RemoteGate.vue';

const router = useRouter();

function orderSelected(event: CustomEvent<IOrderSelectedDetail>): void {
  router.push(`/orders/${event.detail.id}`);
}
</script>

<template>
  <p class="intro">
    The shell never calls the API: the statistics come from Insights, the open orders from
    Orders. Open an order to see its detail.
  </p>

  <div class="stack">
    <RemoteGate name="Insights" :load="loadInsightsElements">
      <shop-order-stats />
    </RemoteGate>
    <RemoteGate name="Orders" :load="loadOrdersElements">
      <shop-orders-list status="open" page-size="5" @orderSelected="orderSelected" />
    </RemoteGate>
  </div>
</template>
