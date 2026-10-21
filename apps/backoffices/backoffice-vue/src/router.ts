import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from './pages/DashboardPage.vue';
import OrdersPage from './pages/OrdersPage.vue';
import SettingsPage from './pages/SettingsPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  linkActiveClass: 'active',
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: DashboardPage },
    { path: '/orders/:orderId?', component: OrdersPage, props: true },
    { path: '/settings', component: SettingsPage },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
});
