import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { CheckoutConfirmationComponent } from './pages/checkout-confirmation/checkout-confirmation.component';

const routes: Routes = [
  { path: '', component: CheckoutPageComponent, canActivate: [AuthGuard] },
  { path: 'confirmation/:orderId', component: CheckoutConfirmationComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule {}
