import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Product, TaxonomyCategory, TaxonomySubCategory, TaxonomyType } from '../../../core/models/product.models';
import { ProductsService } from '../../../core/services/products.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent {
  products: Product[] = [];
  types: TaxonomyType[] = [];
  categories: TaxonomyCategory[] = [];
  subCategories: TaxonomySubCategory[] = [];
  loading = false;
  error = '';
  page = 1;
  totalPages = 1;

  readonly filtersForm = this.fb.group({
    search: [''],
    typeId: [''],
    categoryId: [''],
    subCategoryId: [''],
    subCategoryName: [''],
    minPrice: [''],
    maxPrice: [''],
    inStock: ['']
  });

  constructor(
    private readonly productsService: ProductsService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    this.loadTypes();
    this.loadProducts();
  }

  loadTypes(): void {
    this.productsService.getTypes().subscribe({
      next: (response) => {
        this.types = response.data;
      }
    });
  }

  onTypeChange(): void {
    const typeId = Number(this.filtersForm.value.typeId);
    this.categories = [];
    this.subCategories = [];
    this.filtersForm.patchValue({ categoryId: '', subCategoryId: '' });
    if (!typeId) return;

    this.productsService.getCategories(typeId).subscribe({
      next: (response) => {
        this.categories = response.data;
      }
    });
  }

  onCategoryChange(): void {
    const categoryId = Number(this.filtersForm.value.categoryId);
    this.subCategories = [];
    this.filtersForm.patchValue({ subCategoryId: '' });
    if (!categoryId) return;

    this.productsService.getSubCategories(categoryId).subscribe({
      next: (response) => {
        this.subCategories = response.data;
      }
    });
  }

  loadProducts(page = 1): void {
    this.loading = true;
    this.error = '';
    this.page = page;

    const form = this.filtersForm.getRawValue();
    this.productsService
      .getProducts({
        search: form.search || undefined,
        typeId: form.typeId ? Number(form.typeId) : undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        subCategoryId: form.subCategoryId ? Number(form.subCategoryId) : undefined,
        subCategoryName: form.subCategoryName || undefined,
        minPrice: form.minPrice ? Number(form.minPrice) : undefined,
        maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
        inStock: form.inStock === '' ? undefined : form.inStock === 'true',
        page,
        limit: 12
      })
      .subscribe({
        next: (response) => {
          this.products = response.data;
          this.totalPages = response.pagination?.totalPages ?? 1;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message ?? 'Failed to load products';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.loadProducts(1);
  }

  resetFilters(): void {
    this.filtersForm.reset({
      search: '',
      typeId: '',
      categoryId: '',
      subCategoryId: '',
      subCategoryName: '',
      minPrice: '',
      maxPrice: '',
      inStock: ''
    });
    this.categories = [];
    this.subCategories = [];
    this.loadProducts(1);
  }

  openProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.loadProducts(this.page + 1);
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.loadProducts(this.page - 1);
    }
  }
}
