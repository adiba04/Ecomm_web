import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminCustomer,
  AdminOrder,
  AdminProduct,
  ApiResponse,
  TaxonomyCategory,
  TaxonomySubCategory,
  TaxonomyType
} from '../admin.models';
import { environment } from '../../../environments/environment';

@Injectable()
export class AdminApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getAdminProducts(search = '', page = 1, limit = 20): Observable<ApiResponse<AdminProduct[]>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('limit', limit);

    return this.http.get<ApiResponse<AdminProduct[]>>(`${this.baseUrl}/admin/products`, {
      params,
      withCredentials: true
    });
  }

  createProduct(formData: FormData): Observable<ApiResponse<AdminProduct>> {
    return this.http.post<ApiResponse<AdminProduct>>(`${this.baseUrl}/products`, formData, {
      withCredentials: true
    });
  }

  updateProduct(productId: number, formData: FormData): Observable<ApiResponse<AdminProduct>> {
    return this.http.patch<ApiResponse<AdminProduct>>(`${this.baseUrl}/products/${productId}`, formData, {
      withCredentials: true
    });
  }

  deleteProduct(productId: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.baseUrl}/products/${productId}`, {
      withCredentials: true
    });
  }

  getCustomers(search = '', page = 1, limit = 20): Observable<ApiResponse<AdminCustomer[]>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('limit', limit);

    return this.http.get<ApiResponse<AdminCustomer[]>>(`${this.baseUrl}/admin/customers`, {
      params,
      withCredentials: true
    });
  }

  lockCustomer(userId: number): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/admin/customers/${userId}/lock`, {}, {
      withCredentials: true
    });
  }

  unlockCustomer(userId: number): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.baseUrl}/admin/customers/${userId}/unlock`, {}, {
      withCredentials: true
    });
  }

  getOrders(page = 1, limit = 20): Observable<ApiResponse<AdminOrder[]>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<ApiResponse<AdminOrder[]>>(`${this.baseUrl}/admin/orders`, {
      params,
      withCredentials: true
    });
  }

  getOrderById(orderId: number): Observable<ApiResponse<AdminOrder>> {
    return this.http.get<ApiResponse<AdminOrder>>(`${this.baseUrl}/admin/orders/${orderId}`, {
      withCredentials: true
    });
  }

  getTypes(): Observable<ApiResponse<TaxonomyType[]>> {
    return this.http.get<ApiResponse<TaxonomyType[]>>(`${this.baseUrl}/taxonomy/types`, {
      withCredentials: true
    });
  }

  getCategories(typeId: number): Observable<ApiResponse<TaxonomyCategory[]>> {
    const params = new HttpParams().set('typeId', typeId);
    return this.http.get<ApiResponse<TaxonomyCategory[]>>(`${this.baseUrl}/taxonomy/categories`, {
      params,
      withCredentials: true
    });
  }

  getSubCategories(categoryId: number): Observable<ApiResponse<TaxonomySubCategory[]>> {
    const params = new HttpParams().set('categoryId', categoryId);
    return this.http.get<ApiResponse<TaxonomySubCategory[]>>(`${this.baseUrl}/taxonomy/sub-categories`, {
      params,
      withCredentials: true
    });
  }
}
