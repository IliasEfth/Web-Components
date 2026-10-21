<script setup lang="ts">
const orderId = defineModel<string>();

const orderIds = ['A-1001', 'A-1002', 'A-1003'];
</script>

<template>
  <div class="toolbar" role="group" aria-label="Order">
    <span class="intro">Order</span>
    <button
      v-for="id in orderIds"
      :key="id"
      type="button"
      class="toolbar-button"
      :aria-pressed="id === orderId"
      @click="orderId = id"
    >
      {{ id }}
    </button>
  </div>
</template>
