import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../core/models/product.models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';
  message = '';
  readonly defaultImage = '/assets/default-product.svg';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    void this.authService.ensureSessionHydrated();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid product ID';
      return;
    }

    this.loading = true;
    this.productsService.getProductById(id).subscribe({
      next: (response) => {
        this.product = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load product';
        this.loading = false;
      }
    });
  }

  get isCustomer(): boolean {
    return this.authService.currentUser?.role === 'CUSTOMER';
  }

  get imageSrc(): string {
    return this.product?.imageUrl || this.defaultImage;
  }

  get taxonomyPath(): string {
    if (!this.product) {
      return '';
    }

    const labels = [this.product.type?.name, this.product.category?.name, this.product.subCategory?.name].filter(
      (value): value is string => Boolean(value)
    );

    return labels.join(' > ');
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    this.cartService.addItem(this.product.id, 1).subscribe({
      next: () => {
        this.message = 'Added to cart';
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to add to cart';
      }
    });
  }

  async copyShareUrl(): Promise<void> {
    const shareUrl = window.location.href;
    const shareTitle = this.product?.name ?? 'Product';

    if (navigator.share) {
      await navigator.share({ title: shareTitle, url: shareUrl });
      this.message = 'Product shared successfully';
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    this.message = 'Product URL copied to clipboard';
  }
}
