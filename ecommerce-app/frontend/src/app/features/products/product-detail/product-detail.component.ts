import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Productmodel } from '../../../core/models';
import { CartService } from '../../../core/services/cart-service';
import { AuthService } from '../../../core/services/auth-service';
import { ProductService } from '../../../core/services/product-service';
import { ProductTaxonomyPipe } from '../../../core/pipes/product-taxonomy.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductTaxonomyPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Productmodel | null = null;
  isLoading = true;
  errorMsg = '';
  shareMsg = '';

  // Cart State
  quantity = 1;
  isAddingToCart = false; 
  addedToCart = false;
  cartErrorMsg = '';

  // Injections
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productId = params.get('id');
        if (productId) {
          this.loadProduct(Number(productId));
        } else {
          this.errorMsg = 'Invalid product ID.';
          this.isLoading = false;
        }
      });
  }

  loadProduct(productId: number): void {
    this.isLoading = true;
    this.productService.getProductById(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.product = res;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMsg = err.status === 404 ? 'Product not found.' : 'Failed to load product details.';
          this.isLoading = false;
          console.error('Detail Error:', err);
        },
      });
  }

  addToCart(): void {
    // Only allow adding if logged in and not already processing
    if (!this.authService.isLoggedIn) {
      this.cartErrorMsg = 'Please login to add items to cart.';
      return;
    }
    
    if (this.isAddingToCart || !this.product) return;

    this.isAddingToCart = true;
    this.cartErrorMsg = '';

    this.cartService.addItem(this.product.id, this.quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isAddingToCart = false;
          this.addedToCart = true;
          setTimeout(() => this.addedToCart = false, 2000);
        },
        error: (err) => {
          this.isAddingToCart = false;
          this.cartErrorMsg = err.error?.message || 'Failed to add item to cart.';
        }
      });
  }

  shareProduct(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.shareMsg = 'Link copied!';
      setTimeout(() => this.shareMsg = '', 3000);
    }).catch(() => {
      this.shareMsg = 'Could not copy URL.';
    });
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}