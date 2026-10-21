import { createRouter, createWebHistory } from 'vue-router';
import ComponentsPage from './pages/ComponentsPage.vue';
import WebComponentsPage from './pages/WebComponentsPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: 'active',
  routes: [
    { path: '/', redirect: '/components' },
    { path: '/components', component: ComponentsPage },
    { path: '/web-components', component: WebComponentsPage },
    { path: '/:pathMatch(.*)*', redirect: '/components' },
  ],
});
