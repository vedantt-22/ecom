import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post<CheckoutResponsemodel>(`${this.apiUrl}/orders/checkout`, data);
  }

  getMyOrders(): Observable<Ordermodel[]> {
    return this.http.get<Ordermodel[]>(`${this.apiUrl}/orders/my`);
  } 

  getOrderById(id: Ordermodel['id']): Observable<Ordermodel> {
    return this.http.get<Ordermodel>(`${this.apiUrl}/orders/${id}`);
  }

  getAllOrders(): Observable<Ordermodel[]> {
    return this.http.get<Ordermodel[]>(`${this.apiUrl}/orders/admin/all`);
  }
}