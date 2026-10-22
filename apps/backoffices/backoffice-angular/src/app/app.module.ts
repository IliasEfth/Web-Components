import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { SettingsPageComponent } from './settings/settings-page.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent, DashboardPageComponent, SettingsPageComponent],
  imports: [BrowserModule, AppRoutingModule, SharedModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
