import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiEnvelope } from '../models/auth.models';
import { CheckoutPayload, Order } from '../models/order.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly baseUrl = `${environment.apiBaseUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  checkout(payload: CheckoutPayload): Observable<ApiEnvelope<Order>> {
    return this.http.post<ApiEnvelope<Order>>(`${this.baseUrl}/checkout`, payload, {
      withCredentials: true
    });
  }

  getMyOrders(): Observable<ApiEnvelope<Order[]>> {
    return this.http.get<ApiEnvelope<Order[]>>(this.baseUrl, { withCredentials: true });
  }

  getMyOrderById(orderId: number): Observable<ApiEnvelope<Order>> {
    return this.http.get<ApiEnvelope<Order>>(`${this.baseUrl}/${orderId}`, { withCredentials: true });
  }

  confirmOrder(orderId: number): Observable<ApiEnvelope<Order>> {
    return this.http.post<ApiEnvelope<Order>>(`${this.baseUrl}/${orderId}/confirm`, {}, { withCredentials: true });
  }
}
