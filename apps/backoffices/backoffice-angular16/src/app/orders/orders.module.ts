import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { OrdersPageComponent } from './orders-page/orders-page.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { RemoteGateComponent } from './remote-gate/remote-gate.component';
import { StatusFilterComponent } from './status-filter/status-filter.component';

@NgModule({
  declarations: [OrdersPageComponent, RemoteGateComponent, StatusFilterComponent],
  imports: [CommonModule, OrdersRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrdersModule {}
