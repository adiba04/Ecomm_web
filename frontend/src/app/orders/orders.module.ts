import { NgModule } from '@angular/core';
import { OrdersRoutingModule } from './orders-routing.module';
import { SharedModule } from '../shared/shared.module';
import { OrdersPageComponent } from './pages/orders-page/orders-page.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';

@NgModule({
  declarations: [OrdersPageComponent, OrderDetailComponent],
  imports: [SharedModule, OrdersRoutingModule]
})
export class OrdersModule {}
