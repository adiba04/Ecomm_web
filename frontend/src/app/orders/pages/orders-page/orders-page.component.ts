import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from '../../../core/models/order.models';
import { OrdersService } from '../../../core/services/orders.service';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css']
})
export class OrdersPageComponent {
  orders: Order[] = [];
  loading = false;
  error = '';

  constructor(
    private readonly ordersService: OrdersService,
    private readonly router: Router
  ) {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.ordersService.getMyOrders().subscribe({
      next: (response) => {
        this.orders = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  confirm(orderId: number): void {
    this.ordersService.confirmOrder(orderId).subscribe({
      next: () => this.loadOrders(),
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to confirm order';
      }
    });
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }
}

