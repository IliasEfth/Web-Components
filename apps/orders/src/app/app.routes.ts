import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'components' },
  {
    path: 'components',
    title: 'Orders · Angular components',
    loadComponent: () =>
      import('./pages/components-page/components-page').then((page) => page.ComponentsPage),
  },
  {
    path: 'web-components',
    title: 'Orders · Web components',
    loadComponent: () =>
      import('./pages/web-components-page/web-components-page').then(
        (page) => page.WebComponentsPage,
      ),
  },
  { path: '**', redirectTo: 'components' },
];
