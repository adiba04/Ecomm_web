import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEnvelope } from '../models/auth.models';
import { CartView } from '../models/cart.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly baseUrl = `${environment.apiBaseUrl}/cart`;

  constructor(private readonly http: HttpClient) {}

  getCart(): Observable<ApiEnvelope<CartView>> {
    return this.http.get<ApiEnvelope<CartView>>(this.baseUrl, { withCredentials: true });
  }

  addItem(productId: number, quantity: number): Observable<ApiEnvelope<CartView>> {
    return this.http.post<ApiEnvelope<CartView>>(
      `${this.baseUrl}/items`,
      { productId, quantity },
      { withCredentials: true }
    );
  }

  updateItem(cartItemId: number, quantity: number): Observable<ApiEnvelope<CartView>> {
    return this.http.patch<ApiEnvelope<CartView>>(
      `${this.baseUrl}/items/${cartItemId}`,
      { quantity },
      { withCredentials: true }
    );
  }

  removeItem(cartItemId: number): Observable<ApiEnvelope<CartView>> {
    return this.http.delete<ApiEnvelope<CartView>>(`${this.baseUrl}/items/${cartItemId}`, {
      withCredentials: true
    });
  }
}
