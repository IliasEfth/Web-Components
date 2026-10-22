<script setup lang="ts">
import type { IOrder } from '@shop/api-contract';
import { computed, onBeforeUnmount, ref } from 'vue';
import { remoteConfig } from '../app-config';
import { OrdersClient } from '../clients/orders-client';

const euros = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });
const ordersClient = new OrdersClient(remoteConfig.apiBase);
const controller = new AbortController();

const orders = ref<IOrder[]>([]);
const loadFailed = ref(false);
const openOrders = computed(() => orders.value.filter((order) => order.status === 'open'));
const revenue = computed(() => orders.value.reduce((sum, order) => sum + order.total, 0));

ordersClient.listOrders({}, controller.signal).then(
  (loaded) => {
    orders.value = loaded;
  },
  () => {
    loadFailed.value = !controller.signal.aborted;
  },
);

onBeforeUnmount(() => controller.abort());
</script>

<template>
  <p class="intro">
    A plain Vue page: no remote is loaded here. Open an order to jump into the Angular detail
    through the URL.
  </p>

  <section v-if="loadFailed" class="card remote-card remote-card--failed" role="alert">
    <h2>The orders could not load</h2>
  </section>

  <template v-else>
    <div class="tiles">
      <section class="card tile">
        <span class="tile__label">Open orders</span>
        <span class="tile__value">{{ openOrders.length }}</span>
      </section>
      <section class="card tile">
        <span class="tile__label">Shipped orders</span>
        <span class="tile__value">{{ orders.length - openOrders.length }}</span>
      </section>
      <section class="card tile">
        <span class="tile__label">Revenue</span>
        <span class="tile__value">{{ euros.format(revenue) }}</span>
      </section>
    </div>

    <section class="card">
      <h2>Waiting to ship</h2>
      <ul class="order-links">
        <li v-for="order in openOrders" :key="order.id">
          <RouterLink :to="`/orders/${order.id}`">{{ order.id }}</RouterLink>
          <span>{{ order.customer }}</span>
          <span>{{ euros.format(order.total) }}</span>
        </li>
      </ul>
    </section>
  </template>
</template>
