import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { CustomerGuard } from './core/guards/customer.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then((m) => m.ProductsModule)
  },
  {
    path: 'cart',
    canActivate: [CustomerGuard],
    loadChildren: () => import('./cart/cart.module').then((m) => m.CartModule)
  },
  {
    path: 'checkout',
    canActivate: [CustomerGuard],
    loadChildren: () => import('./checkout/checkout.module').then((m) => m.CheckoutModule)
  },
  {
    path: 'orders',
    canActivate: [CustomerGuard],
    loadChildren: () => import('./orders/orders.module').then((m) => m.OrdersModule)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule)
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: 'products'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
