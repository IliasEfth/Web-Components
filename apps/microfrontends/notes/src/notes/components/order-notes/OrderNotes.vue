<script setup lang="ts">
import type { INote } from '@shop/api-contract';
import type { IOrderNotesContract } from '@shop/notes-contract';
import { ref, watch } from 'vue';
import { useNotesService } from '../../config/use-notes-service';

type Events = IOrderNotesContract['events'];

const { orderId } = defineProps<Partial<IOrderNotesContract['properties']>>();

const emit = defineEmits<{ noteAdded: [detail: Events['noteAdded']] }>();

const notesService = useNotesService();
const notes = ref<INote[]>([]);
const text = ref('');
const loadFailed = ref(false);
const saving = ref(false);
const saveFailed = ref(false);

watch(
  () => orderId,
  async (id, _previousId, onCleanup) => {
    notes.value = [];
    loadFailed.value = false;
    saveFailed.value = false;
    if (!id) {
      return;
    }

    const controller = new AbortController();
    onCleanup(() => controller.abort());
    try {
      notes.value = await notesService.list(id, controller.signal);
    } catch {
      if (!controller.signal.aborted) {
        loadFailed.value = true;
      }
    }
  },
  { immediate: true },
);

async function addNote(): Promise<void> {
  if (!orderId || !text.value.trim()) {
    return;
  }

  saving.value = true;
  saveFailed.value = false;
  try {
    const note = await notesService.add(orderId, text.value);
    notes.value = [...notes.value, note];
    text.value = '';
    emit('noteAdded', { orderId: note.orderId, text: note.text });
  } catch {
    saveFailed.value = true;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="order-notes">
    <h2 class="order-notes__title">{{ orderId ? `Notes for ${orderId}` : 'Notes' }}</h2>

    <p v-if="!orderId" class="order-notes__message">Select an order to read and add notes.</p>
    <template v-else>
      <p v-if="loadFailed" class="order-notes__message order-notes__message--error">
        Could not load the notes.
      </p>
      <p v-else-if="notes.length === 0" class="order-notes__message">No notes yet.</p>
      <ul v-else class="order-notes__list">
        <li v-for="note in notes" :key="note.id" class="order-notes__note">{{ note.text }}</li>
      </ul>

      <form class="order-notes__form" @submit.prevent="addNote">
        <input
          v-model="text"
          class="order-notes__input"
          maxlength="500"
          placeholder="Add a note"
          aria-label="New note"
        />
        <button type="submit" class="order-notes__add" :disabled="saving || !text.trim()">
          Add
        </button>
      </form>
      <p v-if="saveFailed" class="order-notes__message order-notes__message--error">
        Could not save the note.
      </p>
    </template>
  </section>
</template>

<style src="./order-notes.css"></style>
