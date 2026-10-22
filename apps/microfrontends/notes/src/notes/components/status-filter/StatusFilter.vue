<script setup lang="ts">
import type { IStatusFilterContract, OrderStatusFilter } from '@shop/notes-contract';

type Events = IStatusFilterContract['events'];

const { value = 'all' } = defineProps<Partial<IStatusFilterContract['properties']>>();

const emit = defineEmits<{ statusChange: [detail: Events['statusChange']] }>();

const statuses: OrderStatusFilter[] = ['all', 'open', 'shipped'];
</script>

<template>
  <div class="status-filter" role="group" aria-label="Order status">
    <span class="status-filter__label">Status</span>
    <button
      v-for="status in statuses"
      :key="status"
      type="button"
      class="status-filter__option"
      :aria-pressed="status === value"
      @click="emit('statusChange', { status })"
    >
      {{ status }}
    </button>
  </div>
</template>

<style src="./status-filter.css"></style>
