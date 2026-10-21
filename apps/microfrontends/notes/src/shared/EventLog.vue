<script setup lang="ts">
defineProps<{ events: string[] }>();
</script>

<template>
  <section class="event-log">
    <h2>Events</h2>
    <p v-if="events.length === 0" class="intro">Nothing yet. Pick a status or add a note.</p>
    <ul v-else>
      <li v-for="(event, index) in events" :key="events.length - index">{{ event }}</li>
    </ul>
  </section>
</template>
