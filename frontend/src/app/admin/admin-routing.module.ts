import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminCustomersComponent } from './pages/admin-customers/admin-customers.component';
import { AdminOrderDetailComponent } from './pages/admin-order-detail/admin-order-detail.component';
import { AdminOrdersComponent } from './pages/admin-orders/admin-orders.component';
import { AdminProductsComponent } from './pages/admin-products/admin-products.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      { path: 'products', component: AdminProductsComponent },
      { path: 'customers', component: AdminCustomersComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'orders/:orderId', component: AdminOrderDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
