import { createApp } from 'vue';
import App from './App.vue';
import { defineElements } from './elements';
import { createNotes } from './notes/config/create-notes';
import { notesConfig } from './notes/config/notes-config';
import { router } from './router';
import './styles.css';

await defineElements();

createApp(App).use(router).use(createNotes(notesConfig)).mount('#app');
