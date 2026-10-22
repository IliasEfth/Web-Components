import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RemoteGateComponent } from './remote-gate/remote-gate.component';

@NgModule({
  declarations: [RemoteGateComponent],
  imports: [CommonModule],
  exports: [RemoteGateComponent],
})
export class SharedModule {}
