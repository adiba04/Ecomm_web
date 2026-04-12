import { Component } from '@angular/core';
import { CartView } from '../../../core/models/cart.models';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css']
})
export class CartPageComponent {
  cart: CartView | null = null;
  loading = false;
  error = '';

  constructor(private readonly cartService: CartService) {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = '';

    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cart = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load cart';
        this.loading = false;
      }
    });
  }

  increment(itemId: number, quantity: number): void {
    this.cartService.updateItem(itemId, quantity + 1).subscribe({ next: () => this.loadCart() });
  }

  decrement(itemId: number, quantity: number): void {
    const nextQuantity = Math.max(1, quantity - 1);
    this.cartService.updateItem(itemId, nextQuantity).subscribe({ next: () => this.loadCart() });
  }

  remove(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({ next: () => this.loadCart() });
  }
}

