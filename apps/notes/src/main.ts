import { createApp } from 'vue';
import App from './App.vue';
import { notesConfig } from './app-config';
import { defineElements } from './elements';
import { createNotes } from './notes/config/create-notes';
import { router } from './router';
import './styles.css';

await defineElements(notesConfig);

createApp(App).use(router).use(createNotes(notesConfig)).mount('#app');
