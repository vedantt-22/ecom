import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart-service';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order-service';
import { Cartmodel, CheckoutRequestmodel } from '../../core/models';
@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  checkoutForm!: FormGroup;
  cart: Cartmodel | null = null;
  isLoading = false;
  errorMsg = '';
  isPlaced = false;

   paymentMethods = [
    { value: 'credit_card',      label: 'Credit Card',      icon: '💳' },
    { value: 'debit_card',       label: 'Debit Card',       icon: '💳' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' },
    { value: 'bank_transfer',    label: 'Bank Transfer',    icon: '🏦' },
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      paymentMethod: ['cash_on_delivery', Validators.required]
    });

    this.isLoading = true;
    this.cartService.loadCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;

        if(cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg = 'Failed to load cart. Please try again later.';
      },
    });
  }

  placeOrder(): void {
  this.checkoutForm.markAllAsTouched();

  if (this.checkoutForm.invalid || !this.cart) return;

  this.isPlaced = true;
  this.errorMsg = '';
  const checkoutData: CheckoutRequestmodel = {
    paymentMethod: this.checkoutForm.value.paymentMethod,
    shippingAddressId: Number(this.checkoutForm.value.shippingAddressId)
  };
  this.orderService.checkout(checkoutData).subscribe({
    next: (res) => {
      this.isPlaced = false;
      this.cartService.clearLocalState();
      this.router.navigate(['/orders', res.data.id], {
        state: { 
          order: res.data, 
          isConfirmation: true 
        }
      });
    },
    error: (err) => {
      this.isPlaced = false;
      this.errorMsg = err.error?.message || 'Failed to place order. Please try again.';
    },
  });
}
}