import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Ordermodel, 
  CheckoutRequestmodel, 
  CheckoutResponsemodel 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  checkout(data: CheckoutRequestmodel): Observable<CheckoutResponsemodel> {
    return this.http
      .post<CheckoutResponsemodel | Ordermodel>(`${this.apiUrl}/orders/checkout`, data)
      .pipe(
        map((res) => {
          if (res && typeof res === 'object' && 'data' in res) {
            return res as CheckoutResponsemodel;
          }

          return {
            success: true,
            statusCode: 201,
            message: 'Order placed successfully.',
            data: res as Ordermodel,
          };
        })
      );
  }

  getMyOrders(): Observable<Ordermodel[]> {
    return this.http.get<Ordermodel[]>(`${this.apiUrl}/orders/my`);
  } 

  getOrderById(id: number): Observable<Ordermodel> {
  return this.http.get<{ data: Ordermodel }>(`${this.apiUrl}/orders/${id}`)
    .pipe(map(res => res.data));
}

  getAllOrders(): Observable<Ordermodel[]> {
    return this.http.get<Ordermodel[]>(`${this.apiUrl}/orders/admin/all`);
  }
}