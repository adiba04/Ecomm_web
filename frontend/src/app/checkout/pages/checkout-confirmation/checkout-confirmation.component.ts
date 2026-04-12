import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '../../../core/models/order.models';
import { OrdersService } from '../../../core/services/orders.service';

@Component({
  selector: 'app-checkout-confirmation',
  templateUrl: './checkout-confirmation.component.html',
  styleUrls: ['./checkout-confirmation.component.css']
})
export class CheckoutConfirmationComponent implements OnInit {
  loading = false;
  error = '';
  order: Order | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ordersService: OrdersService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!orderId) {
      this.error = 'Invalid order reference';
      return;
    }

    this.loading = true;
    this.ordersService.getMyOrderById(orderId).subscribe({
      next: (response) => {
        this.order = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load confirmation';
        this.loading = false;
      }
    });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
