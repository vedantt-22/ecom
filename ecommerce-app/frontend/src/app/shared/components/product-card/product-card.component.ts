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

  addToCart(event: Event): void {

    event.stopPropagation(); // Prevent card click navigation
    event.preventDefault(); // Prevent default button behavior

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
        setTimeout(() => this.errorMsg = '', 3000);

      }
  });
}
}
