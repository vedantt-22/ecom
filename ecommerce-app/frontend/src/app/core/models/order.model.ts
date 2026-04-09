import { Addressmodel } from "./address.model";

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'cash_on_delivery'
  | 'bank_transfer'
  | 'upi';                    // new

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItemmodel {
  id:              number;
  quantity:        number;
  priceAtPurchase: number;
  lineTotal:       number;
  product: {
    id:       number;
    name:     string;
    imageUrl: string;
  } | null;
}

export interface Ordermodel {
  id:              number;
  totalAmount:     number;
  paymentMethod:   PaymentMethod;
  status:          OrderStatus;
  createdAt:       string;
  items:           OrderItemmodel[];
  shippingAddress?: Addressmodel;         // new
}

export interface CheckoutRequestmodel {
  paymentMethod:     PaymentMethod;
  shippingAddressId: number;         // new — required for checkout
}

export interface CheckoutResponsemodel {
  message: string;
  order:   Ordermodel;
}

export interface AdminOrder extends Ordermodel {
  customer: {
    id:    number;
    name:  string;
    email: string;
  };
}