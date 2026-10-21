import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { SettingsPageComponent } from './settings/settings-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPageComponent },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then((m) => m.OrdersModule),
  },
  { path: 'settings', component: SettingsPageComponent },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
