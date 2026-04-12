import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminOrder } from '../../admin.models';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: AdminOrder[] = [];
  loading = false;
  error = '';

  constructor(
    private readonly adminApi: AdminApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminApi.getOrders(1, 50).subscribe({
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

  viewOrder(orderId: number): void {
    this.router.navigate(['/admin/orders', orderId]);
  }
}
