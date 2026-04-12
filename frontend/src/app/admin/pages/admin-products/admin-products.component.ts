import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  AdminProduct,
  TaxonomyCategory,
  TaxonomySubCategory,
  TaxonomyType
} from '../../admin.models';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  loading = false;
  submitting = false;
  error = '';
  products: AdminProduct[] = [];
  types: TaxonomyType[] = [];
  categories: TaxonomyCategory[] = [];
  subCategories: TaxonomySubCategory[] = [];
  selectedImage: File | null = null;
  editingProductId: number | null = null;

  readonly form = this.fb.group({
    typeId: ['', Validators.required],
    categoryId: ['', Validators.required],
    subCategoryId: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2)]],
    sku: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(2)]],
    price: ['', Validators.required],
    stockQuantity: ['', Validators.required],
    isActive: [true]
  });

  constructor(
    private readonly adminApi: AdminApiService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTypes();
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.adminApi.getAdminProducts('', 1, 50).subscribe({
      next: (response) => {
        this.products = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load products';
        this.loading = false;
      }
    });
  }

  loadTypes(): void {
    this.adminApi.getTypes().subscribe({
      next: (response) => {
        this.types = response.data;
      }
    });
  }

  onTypeChange(): void {
    const typeId = Number(this.form.value.typeId);
    this.categories = [];
    this.subCategories = [];
    this.form.patchValue({ categoryId: '', subCategoryId: '' });
    if (!typeId) {
      return;
    }
    this.adminApi.getCategories(typeId).subscribe({
      next: (response) => {
        this.categories = response.data;
      }
    });
  }

  onCategoryChange(): void {
    const categoryId = Number(this.form.value.categoryId);
    this.subCategories = [];
    this.form.patchValue({ subCategoryId: '' });
    if (!categoryId) {
      return;
    }
    this.adminApi.getSubCategories(categoryId).subscribe({
      next: (response) => {
        this.subCategories = response.data;
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImage = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formData = new FormData();
    Object.entries(this.form.value).forEach(([key, value]) => {
      if (typeof value !== 'undefined' && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const request$ = this.editingProductId
      ? this.adminApi.updateProduct(this.editingProductId, formData)
      : this.adminApi.createProduct(formData);

    request$.subscribe({
      next: () => {
        this.resetForm();
        this.loadProducts();
        this.submitting = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to save product';
        this.submitting = false;
      }
    });
  }

  startEdit(product: AdminProduct): void {
    this.editingProductId = product.id;
    this.form.patchValue({
      typeId: String(product.typeId),
      categoryId: String(product.categoryId),
      subCategoryId: String(product.subCategoryId),
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      stockQuantity: String(product.stockQuantity),
      isActive: product.isActive
    });
    this.onTypeChange();
    setTimeout(() => this.onCategoryChange(), 150);
  }

  remove(product: AdminProduct): void {
    if (!confirm(`Delete product ${product.name}?`)) {
      return;
    }

    this.adminApi.deleteProduct(product.id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to delete product';
      }
    });
  }

  resetForm(): void {
    this.editingProductId = null;
    this.selectedImage = null;
    this.form.reset({ isActive: true, typeId: '', categoryId: '', subCategoryId: '' });
  }
}
