<script setup lang="ts">
import type { IStatusChangeDetail } from '../../models/notes-events';
import type { OrderStatusFilter } from '../../models/order';

const { value = 'all' } = defineProps<{ value?: OrderStatusFilter }>();

const emit = defineEmits<{ statusChange: [detail: IStatusChangeDetail] }>();

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
