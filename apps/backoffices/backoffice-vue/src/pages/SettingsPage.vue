<script setup lang="ts">
import { inject } from 'vue';
import { themeKey, themeNames } from '../theme/themes';

const theme = inject(themeKey);
</script>

<template>
  <section class="card">
    <h2>Theme</h2>
    <p class="intro">
      Sets <code>--shop-color-primary</code> on <code>:root</code>. The custom property crosses
      every shadow root, so the Angular, React and Vue components recolour too.
    </p>
    <div class="toolbar">
      <button
        v-for="name in themeNames"
        :key="name"
        type="button"
        class="button"
        :aria-pressed="name === theme"
        @click="theme = name"
      >
        {{ name }}
      </button>
    </div>
  </section>
</template>
