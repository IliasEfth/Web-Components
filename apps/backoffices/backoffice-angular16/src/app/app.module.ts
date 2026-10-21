import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { REMOTE_CONFIG } from './models/remote-config';

@NgModule({
  declarations: [AppComponent, DashboardPageComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
  providers: [{ provide: REMOTE_CONFIG, useValue: { apiBase: 'http://localhost:3000' } }],
  bootstrap: [AppComponent],
})
export class AppModule {}
