import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin-products/admin-products.component';
import { AdminCustomersComponent } from './pages/admin-customers/admin-customers.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminOrderDetailComponent } from './pages/admin-order-detail/admin-order-detail.component';
import { AdminApiService } from './services/admin-api.service';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminProductsComponent,
    AdminCustomersComponent,
    AdminOrdersComponent,
    AdminOrderDetailComponent
  ],
  imports: [SharedModule, AdminRoutingModule],
  providers: [AdminApiService]
})
export class AdminModule {}
