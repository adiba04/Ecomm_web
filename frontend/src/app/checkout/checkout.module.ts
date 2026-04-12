import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { CheckoutConfirmationComponent } from './pages/checkout-confirmation/checkout-confirmation.component';

@NgModule({
  declarations: [CheckoutPageComponent, CheckoutConfirmationComponent],
  imports: [SharedModule, CheckoutRoutingModule]
})
export class CheckoutModule {}
