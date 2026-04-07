import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CartItem {
  id:        number;
  quantity:  number;
  lineTotal: number;
  product: {
    id:       number;
    name:     string;
    price:    number;
    stock:    number;
    imageUrl: string;
  };
}

export interface Cart {
  cartId:    number;
  items:     CartItem[];
  total:     number;
  itemCount: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = environment.apiUrl;

  // Shared cart state — components subscribe to this
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public  cart$       = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  get itemCount(): number {
    return this.cartSubject.value?.itemCount ?? 0;
  }

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/cart`).pipe(
      tap((cart) => this.cartSubject.next(cart))
    );
  }

  addItem(productId: number, quantity: number = 1): Observable<Cart> {
    return this.http
      .post<Cart>(`${this.apiUrl}/cart/items`, { productId, quantity })
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  updateItem(cartItemId: number, quantity: number): Observable<Cart> {
    return this.http
      .put<Cart>(`${this.apiUrl}/cart/items/${cartItemId}`, { quantity })
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  removeItem(cartItemId: number): Observable<Cart> {
    return this.http
      .delete<Cart>(`${this.apiUrl}/cart/items/${cartItemId}`)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  clearCart(): Observable<Cart> {
    return this.http
      .delete<Cart>(`${this.apiUrl}/cart`)
      .pipe(tap((cart) => this.cartSubject.next(cart)));
  }

  clearLocalCart(): void {
    this.cartSubject.next(null);
  }
}