import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart-service';
import { Cartmodel } from '../../core/models/cart.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true, 
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cartmodel | null = null; 
  isLoading = true;
  errorMsg = '';
  updatedItemId: number | null = null;
  private cartSub!: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartSub = this.cartService.cart$.subscribe({
      next: (data) => {
        this.cart = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Error updating cart view.';
        this.isLoading = false;
      }
    });

    // 2. Trigger the initial load
    this.cartService.loadCart().subscribe({
      error: (err) => {
        this.errorMsg = 'Failed to load cart. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSub) this.cartSub.unsubscribe();
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    this.updatedItemId = itemId;
    this.cartService.updateItem(itemId, quantity).subscribe({
      next: () => this.updatedItemId = null,
      error: () => {
        this.updatedItemId = null;
        this.errorMsg = 'Failed to update quantity.';
      }
    });
  }

  removeItem(itemId: number): void {
    this.updatedItemId = itemId;
    this.cartService.removeItem(itemId).subscribe({ // Assuming this exists in service
      next: () => this.updatedItemId = null,
      error: () => this.updatedItemId = null
    });
  }

  clearCart(): void {
    if (!confirm('Are you sure?')) return;
    this.cartService.clearCart().subscribe({
      error: () => (this.errorMsg = 'Failed to clear cart.')
    });
  }
}