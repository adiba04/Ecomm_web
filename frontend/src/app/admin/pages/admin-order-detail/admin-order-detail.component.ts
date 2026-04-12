import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminOrder } from '../../admin.models';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.css']
})
export class AdminOrderDetailComponent implements OnInit {
  order: AdminOrder | null = null;
  loading = false;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly adminApi: AdminApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!orderId) {
      this.error = 'Invalid order reference';
      return;
    }

    this.loading = true;
    this.adminApi.getOrderById(orderId).subscribe({
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
    this.router.navigate(['/admin/orders']);
  }
}
