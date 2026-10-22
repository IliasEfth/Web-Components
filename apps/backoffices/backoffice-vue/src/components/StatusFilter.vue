<script setup lang="ts">
import type { OrderStatusFilter } from '@shop/orders-contract';

const status = defineModel<OrderStatusFilter>({ required: true });

const statuses: OrderStatusFilter[] = ['all', 'open', 'shipped'];
</script>

<template>
  <div class="toolbar" role="group" aria-label="Order status">
    <button
      v-for="option in statuses"
      :key="option"
      type="button"
      class="button"
      :aria-pressed="option === status"
      @click="status = option"
    >
      {{ option }}
    </button>
  </div>
</template>
