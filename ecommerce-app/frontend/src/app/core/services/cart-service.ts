import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cartmodel, CartItemmodel } from '../models';

type AddToCartRequest = { productId: CartItemmodel['product']['id']; quantity: number };
type UpdateCartRequest = Pick<CartItemmodel, 'quantity'>;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private cartSubject = new BehaviorSubject<Cartmodel | null>(null);
  public cart$ = this.cartSubject.asObservable();

  
  get cartValue(): Cartmodel | null {
    return this.cartSubject.value;
  }

  get itemCount(): number {
    return this.cartValue?.itemCount ?? 0;
  }

  loadCart(): Observable<Cartmodel> {
    return this.http.get<Cartmodel>(`${this.apiUrl}/cart`).pipe(
      tap((cart) => this.updateLocalState(cart))
    );
  }

  addItem(productId: CartItemmodel['product']['id'], quantity = 1): Observable<Cartmodel> {
    const payload: AddToCartRequest = { productId, quantity };
    return this.http
      .post<Cartmodel>(`${this.apiUrl}/cart/items`, payload)
      .pipe(tap((cart) => this.updateLocalState(cart)));
  }

  updateItem(cartItemId: CartItemmodel['id'], quantity: number): Observable<Cartmodel> {
    const payload: UpdateCartRequest = { quantity };
    return this.http
      .put<Cartmodel>(`${this.apiUrl}/cart/items/${cartItemId}`, payload)
      .pipe(tap((cart) => this.updateLocalState(cart)));
  }

  removeItem(cartItemId: CartItemmodel['id']): Observable<Cartmodel> {
    return this.http
      .delete<Cartmodel>(`${this.apiUrl}/cart/items/${cartItemId}`)
      .pipe(tap((cart) => this.updateLocalState(cart)));
  }

  clearCart(): Observable<Cartmodel> {
    return this.http
      .delete<Cartmodel>(`${this.apiUrl}/cart`)
      .pipe(tap((cart) => this.updateLocalState(cart)));
  }

  private updateLocalState(cart: Cartmodel): void {
    this.cartSubject.next(cart);
  }

  clearLocalState(): void {
    this.cartSubject.next(null);
  }
}