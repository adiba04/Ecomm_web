import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEnvelope } from '../models/auth.models';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductsQuery,
  TaxonomyCategory,
  TaxonomySubCategory,
  TaxonomyType
} from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getProducts(query: ProductsQuery): Observable<ApiEnvelope<Product[]>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value !== 'undefined' && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ApiEnvelope<Product[]>>(`${this.apiUrl}/products`, { params, withCredentials: true });
  }

  getProductById(id: number): Observable<ApiEnvelope<Product>> {
    return this.http.get<ApiEnvelope<Product>>(`${this.apiUrl}/products/${id}`, { withCredentials: true });
  }

  getTypes(): Observable<ApiEnvelope<TaxonomyType[]>> {
    return this.http.get<ApiEnvelope<TaxonomyType[]>>(`${this.apiUrl}/taxonomy/types`, { withCredentials: true });
  }

  getCategories(typeId: number): Observable<ApiEnvelope<TaxonomyCategory[]>> {
    const params = new HttpParams().set('typeId', String(typeId));
    return this.http.get<ApiEnvelope<TaxonomyCategory[]>>(`${this.apiUrl}/taxonomy/categories`, {
      params,
      withCredentials: true
    });
  }

  getSubCategories(categoryId: number): Observable<ApiEnvelope<TaxonomySubCategory[]>> {
    const params = new HttpParams().set('categoryId', String(categoryId));
    return this.http.get<ApiEnvelope<TaxonomySubCategory[]>>(`${this.apiUrl}/taxonomy/sub-categories`, {
      params,
      withCredentials: true
    });
  }
}
