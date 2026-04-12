import { NgModule } from '@angular/core';
import { CartRoutingModule } from './cart-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CartPageComponent } from './pages/cart-page/cart-page.component';

@NgModule({
  declarations: [CartPageComponent],
  imports: [SharedModule, CartRoutingModule]
})
export class CartModule {}
