import { Component, OnInit } from '@angular/core';
import { AdminCustomer } from '../../admin.models';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-customers',
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.css']
})
export class AdminCustomersComponent implements OnInit {
  customers: AdminCustomer[] = [];
  loading = false;
  error = '';

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.adminApi.getCustomers('', 1, 50).subscribe({
      next: (response) => {
        this.customers = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load customers';
        this.loading = false;
      }
    });
  }

  lock(customer: AdminCustomer): void {
    this.adminApi.lockCustomer(customer.id).subscribe({
      next: () => this.loadCustomers(),
      error: (err) => (this.error = err?.error?.message ?? 'Failed to lock customer')
    });
  }

  unlock(customer: AdminCustomer): void {
    this.adminApi.unlockCustomer(customer.id).subscribe({
      next: () => this.loadCustomers(),
      error: (err) => (this.error = err?.error?.message ?? 'Failed to unlock customer')
    });
  }
}
