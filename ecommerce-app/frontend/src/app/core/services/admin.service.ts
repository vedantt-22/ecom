import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Dashboard ────────────────────────────────────────────

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/dashboard`);
  }

  // ── Customers ────────────────────────────────────────────

  getAllCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/customers`);
  }

  lockCustomer(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/customers/${id}/lock`, {});
  }

  unlockCustomer(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/customers/${id}/unlock`, {});
  }

  // ── Orders ───────────────────────────────────────────────

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/orders`);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/orders/${id}/status`,
      { status }
    );
  }

  // ── Products ─────────────────────────────────────────────

  getAllProducts(page: number = 1, pageSize: number = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/products`, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  getTaxonomyTree(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/taxonomy/tree`);
  }

  // Product create — uses FormData for image upload
  createProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/products`, formData);
  }

  // Product update — uses FormData for optional image upload
  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/products/${id}`);
  }

  restoreProduct(id: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/admin/products/${id}/restore`,
      {}
    );
  }
}