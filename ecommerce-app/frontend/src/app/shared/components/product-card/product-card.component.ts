import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { CartService } from '../../../core/services/cart-service';
import { ProductTaxonomyPipe } from '../../../core/pipes/product-taxonomy.pipe';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink, ProductTaxonomyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product: any; 
  isAddingToCart = false;
  addedToCart = false;
  errorMsg = '';

  constructor(private cartService: CartService, public authService: AuthService, private router: Router) {}


  fallbackImage = '/ProductImages/placeholder.png';

onImageError(event: Event) {
  const img = event.target as HTMLImageElement;

  // Prevent infinite loop
  if (img.src.includes(this.fallbackImage)) return;

  img.src = this.fallbackImage;
}

  addToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    // Check if user is authenticated
    if (!this.authService.isLoggedIn) {
      this.errorMsg = 'Please log in to add items to cart.';
      setTimeout(() => this.errorMsg = '', 3000);
      return;
    }

    // Check if user is a customer
    if (!this.authService.isCustomer) {
      this.errorMsg = 'Only customers can add items to cart. Admin accounts cannot purchase.';
      setTimeout(() => this.errorMsg = '', 3000);
      return;
    }

    if(this.isAddingToCart) return;
    this.isAddingToCart = true;
    this.errorMsg = '';

    this.cartService.addItem(this.product.id).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.addedToCart = true;
        setTimeout(() => this.addedToCart = false, 2000);
      },
      error: (err) => {
        this.isAddingToCart = false;
        this.errorMsg = 'Failed to add item to cart.';
        if (err.status === 403) {
          this.errorMsg = 'You do not have permission to add items to cart.';
        }
        setTimeout(() => this.errorMsg = '', 3000);
      }
  });
}
}
