import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router';

import { OrdersPageComponent } from './orders-page/orders-page.component';

export function optionalOrderId(segments: UrlSegment[]): UrlMatchResult | null {
  if (segments.length > 1) {
    return null;
  }
  return {
    consumed: segments,
    posParams: segments.length === 1 ? { orderId: segments[0] } : {},
  };
}

const routes: Routes = [{ matcher: optionalOrderId, component: OrdersPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersRoutingModule {}
