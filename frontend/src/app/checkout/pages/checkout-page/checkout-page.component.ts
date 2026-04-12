import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent {
  loading = false;
  error = '';

  readonly form = this.fb.group({
    paymentMethod: ['CASH_ON_DELIVERY', Validators.required],
    shippingFullName: ['', [Validators.required, Validators.minLength(2)]],
    shippingPhone: ['', [Validators.required, Validators.minLength(6)]],
    shippingAddressLine1: ['', [Validators.required, Validators.minLength(4)]],
    shippingAddressLine2: [''],
    shippingCity: ['', [Validators.required, Validators.minLength(2)]],
    shippingState: ['', [Validators.required, Validators.minLength(2)]],
    shippingPostalCode: ['', [Validators.required, Validators.minLength(2)]],
    shippingCountry: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly ordersService: OrdersService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.ordersService.checkout(this.form.getRawValue() as never).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/checkout/confirmation', response.data.id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Checkout failed';
      }
    });
  }
}
