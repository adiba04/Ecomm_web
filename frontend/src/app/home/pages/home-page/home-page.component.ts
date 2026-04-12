import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.models';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  products: Product[] = [];
  loading = false;
  error = '';

  constructor(
    private readonly productsService: ProductsService,
    private readonly router: Router
  ) {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService
      .getProducts({ page: 1, limit: 8, inStock: true })
      .subscribe({
        next: (response) => {
          this.products = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'Failed to load featured products';
          this.loading = false;
        }
      });
  }

  openProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}
