import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart-service';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order-service';
import { AddressService } from '../../core/services/address.service';
import { Addressmodel, Cartmodel, CheckoutRequestmodel, CreateAddressRequestmodel } from '../../core/models';
@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  checkoutForm!: FormGroup;
  newAddressForm!: FormGroup;
  cart: Cartmodel | null = null;
  addresses: Addressmodel[] = [];
  isLoading = false;
  errorMsg = '';
  addressError = '';
  addressMsg = '';
  isPlaced = false;
  isAddingAddress = false;

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
    private addressService: AddressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      paymentMethod: ['cash_on_delivery', Validators.required],
      shippingAddressId: [null, Validators.required],
    });

    this.newAddressForm = this.fb.group({
      label: ['Home', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      isDefault: [false],
    });

    this.loadAddresses();

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

  loadAddresses(preferredAddressId?: number): void {
    this.addressService.loadAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;

        if (addresses.length === 0) {
          this.checkoutForm.patchValue({ shippingAddressId: '__add_new__' });
          this.isAddingAddress = true;
          this.errorMsg = 'Please add a shipping address before placing your order.';
          return;
        }

        const selectedAddress = preferredAddressId
          ? addresses.find((address) => address.id === preferredAddressId)
          : undefined;
        const defaultAddress = selectedAddress ?? addresses.find((address) => address.isDefault) ?? addresses[0];

        this.checkoutForm.patchValue({ shippingAddressId: defaultAddress.id });
        this.isAddingAddress = false;
        this.errorMsg = '';
      },
      error: () => {
        this.errorMsg = 'Failed to load addresses. Please try again later.';
      },
    });
  }

  onAddressSelect(): void {
    const selected = this.checkoutForm.value.shippingAddressId;
    this.isAddingAddress = selected === '__add_new__';

    if (this.isAddingAddress) {
      this.addressMsg = '';
      this.addressError = '';
      return;
    }

    this.addressError = '';
  }

  addNewAddress(): void {
    if (this.newAddressForm.invalid) {
      this.newAddressForm.markAllAsTouched();
      return;
    }

    this.addressError = '';
    this.addressMsg = '';

    const payload = this.newAddressForm.value as CreateAddressRequestmodel;
    this.addressService.createAddress(payload).subscribe({
      next: (address) => {
        this.addressMsg = 'Address added. Selected for this order.';
        this.newAddressForm.reset({
          label: 'Home',
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false,
        });
        this.loadAddresses(address.id);
      },
      error: (err) => {
        this.addressError = err.error?.error || err.message || 'Failed to add address.';
      },
    });
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    this.cartService.clearCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.router.navigate(['/cart']);
      },
      error: () => {
        this.errorMsg = 'Failed to clear cart. Please try again.';
      },
    });
  }

  placeOrder(): void {
  this.checkoutForm.markAllAsTouched();

  if (this.checkoutForm.invalid || !this.cart) return;

  this.isPlaced = true;
  this.errorMsg = '';
  const selectedAddress = this.checkoutForm.value.shippingAddressId;

  if (selectedAddress === '__add_new__') {
    this.isPlaced = false;
    this.errorMsg = 'Please add and select a shipping address first.';
    return;
  }

  const shippingAddressId = Number(this.checkoutForm.value.shippingAddressId);

  if (Number.isNaN(shippingAddressId) || shippingAddressId <= 0) {
    this.isPlaced = false;
    this.errorMsg = 'Please select a valid shipping address.';
    return;
  }

  const checkoutData: CheckoutRequestmodel = {
    paymentMethod: this.checkoutForm.value.paymentMethod,
    shippingAddressId
  };
  this.orderService.checkout(checkoutData).subscribe({
    next: (res) => {
      this.isPlaced = false;
      this.cartService.clearLocalState();
      this.router.navigate(['/orders', res.data.id], {
        queryParams: { placed: '1' },
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