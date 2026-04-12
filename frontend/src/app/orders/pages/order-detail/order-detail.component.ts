import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '../../../core/models/order.models';
import { OrdersService } from '../../../core/services/orders.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error = '';

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
        this.error = err?.error?.message ?? 'Failed to load order details';
        this.loading = false;
      }
    });
  }

  backToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
