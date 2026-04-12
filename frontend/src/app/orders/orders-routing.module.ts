import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersPageComponent } from './pages/orders-page/orders-page.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';

const routes: Routes = [
  { path: '', component: OrdersPageComponent },
  { path: ':orderId', component: OrderDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule {}
