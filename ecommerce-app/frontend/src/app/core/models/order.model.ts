import { Addressmodel } from "./address.model";
import { PaymentMethodmodel } from "./payment.model";

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
  paymentMethod:   PaymentMethodmodel;
  status:          OrderStatus;
  createdAt:       string | Date;
  items:           OrderItemmodel[];
  shippingAddress?: Addressmodel;         
}

export interface CheckoutRequestmodel {
  paymentMethod:     PaymentMethodmodel;
  shippingAddressId: number;         
}

export interface CheckoutResponsemodel {
  success: boolean;
  message: string;
  statusCode: number;
  data:   Ordermodel;
}

export interface AdminOrder extends Ordermodel {
  user: {
    id:    number;
    name:  string;
    email: string;
  };
}

