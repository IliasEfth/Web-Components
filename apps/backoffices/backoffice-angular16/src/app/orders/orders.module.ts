import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { OrdersPageComponent } from './orders-page/orders-page.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { StatusFilterComponent } from './status-filter/status-filter.component';

@NgModule({
  declarations: [OrdersPageComponent, StatusFilterComponent],
  imports: [CommonModule, OrdersRoutingModule, SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrdersModule {}
